# Deployments

## The pipeline

Every deployment goes through the same five-stage pipeline:

```
Clone → Build → Start → Health check → Atomic proxy switch
                                │
                           fail → Rollback to previous
```

1. **Clone** — Rivetr clones the repository at the target commit using the `git2` crate (no git CLI dependency). For large repos, it does a shallow clone.
2. **Build** — The image is built using the configured builder (see Build types below). Build CPU and memory are capped by the `[runtime]` limits in `rivetr.toml`.
3. **Start** — The container is started on a private port. It is not yet receiving traffic.
4. **Health check** — Rivetr polls the configured health check endpoint until it returns 200 or the timeout expires. If the check passes, deployment continues; if it fails, the new container is stopped and the previous version stays live.
5. **Atomic proxy switch** — The embedded reverse proxy updates its route table atomically using ArcSwap. Traffic switches to the new container with no dropped connections.

---

## Build types

Rivetr auto-detects the builder from your repository, or you can pin it in `deploy.toml`.

| Builder | When used | Config |
|---------|-----------|--------|
| **Dockerfile** | A `Dockerfile` is present in the repo root | `builder = "dockerfile"` |
| **Nixpacks** | No Dockerfile; Nixpacks detects the language | `builder = "nixpacks"` |
| **Railpack** | Explicit opt-in | `builder = "railpack"` |
| **Buildpacks** | Heroku/Paketo buildpacks | `builder = "buildpacks"` |
| **Static** | Pure static site (HTML/CSS/JS) | `builder = "static"` |

Example `deploy.toml` using Nixpacks:

```toml
app = "my-api"
port = 3000

[build]
builder = "nixpacks"
```

---

## Connecting a Git provider

### GitHub, GitLab, Gitea, Bitbucket

1. Go to **Settings → Git Providers** and add a personal access token for your provider.
2. Or, for GitHub, create a **GitHub App** under **Settings → GitHub Apps** for per-repo fine-grained access.

### Setting up a webhook

In your repository's webhook settings, add:

```
URL:     https://your-rivetr-instance/webhooks/github
Secret:  (the value of webhooks.github_secret in rivetr.toml)
Events:  Push events, Pull request events
```

Rivetr verifies the HMAC-SHA256 signature on every webhook delivery.

| Provider | Webhook URL |
|----------|-------------|
| GitHub | `/webhooks/github` |
| GitLab | `/webhooks/gitlab` |
| Gitea | `/webhooks/gitea` |
| Bitbucket | `/webhooks/bitbucket` |

---

## Preview environments

Enable preview deployments for a repository and every pull request gets its own environment on a unique subdomain:

```
pr-42.my-app.preview.example.com
```

When the PR is closed or merged, the preview is automatically torn down. The preview domain is configured via `proxy.preview_domain` in `rivetr.toml`.

---

## Rollbacks

To roll back to any previous deployment, use the dashboard's Deployments tab or the API:

```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  https://your-instance/api/deployments/<deployment-id>/rollback
```

The rolled-back version goes through the same health-check pipeline before the proxy switches.

---

## Deploying a specific commit or tag

Trigger a deployment at a specific commit SHA or tag:

```bash
# Deploy from the CLI
rivetr deploy my-app --ref v1.2.3

# Deploy via API
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"ref": "v1.2.3"}' \
  https://your-instance/api/apps/<app-id>/deploy
```

---

## Deployment approvals and freeze windows

### Approval workflow

Enable approval-required deployments for an app. When a deploy is triggered, it enters a `pending` state and waits for an authorized user to approve or reject it.

```bash
# Approve
curl -X POST -H "Authorization: Bearer <token>" \
  https://your-instance/api/deployments/<id>/approve

# Reject
curl -X POST -H "Authorization: Bearer <token>" \
  https://your-instance/api/deployments/<id>/reject
```

### Freeze windows

Block all deployments during scheduled maintenance periods. Deployments attempted during a freeze window are queued until the window ends.

```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Saturday maintenance", "cron_start": "0 22 * * 6", "duration_minutes": 120}' \
  https://your-instance/api/apps/<app-id>/freeze-windows
```

---

## Watch paths

Only trigger a deploy when specific files change in a push. Useful for monorepos.

```toml
# deploy.toml
[deploy]
watch_paths = ["packages/api/**", "shared/**"]
```

A push that only changes files in `packages/frontend/` will not trigger a deploy for an app configured with the above.

---

## Scheduled deployments

Trigger a deploy at a specific date and time via the API, or configure a cron-based scheduled job in the dashboard under **App → Jobs**.

---

## Container replicas

Scale an app to multiple replicas. Traffic is distributed round-robin across all healthy replicas.

```toml
# deploy.toml
[resources]
replicas = 3
```

Or update replicas live without a redeploy:

```bash
curl -X PUT \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"count": 3}' \
  https://your-instance/api/apps/<app-id>/replicas/count
```

---

## DockerHub auto-deploy

Add a DockerHub webhook to automatically redeploy when a new image is pushed to a Docker Hub repository:

```
URL: https://your-rivetr-instance/webhooks/dockerhub
```
