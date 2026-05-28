# Webhooks

Webhooks let Rivetr deploy automatically when you push to Git or publish a new Docker image. This page covers setup for every supported provider, signature verification, skip markers, and watch paths.

---

## How It Works

Rivetr exposes a public webhook endpoint for each Git provider:

| Provider | Endpoint |
|----------|----------|
| GitHub | `POST /webhooks/github` |
| GitLab | `POST /webhooks/gitlab` |
| Gitea | `POST /webhooks/gitea` |
| Bitbucket | `POST /webhooks/bitbucket` |
| Docker Hub | `POST /webhooks/dockerhub` |

When a push event arrives, Rivetr:
1. Verifies the signature (if a secret is configured)
2. Matches the pushed branch to any app tracking that branch
3. Checks skip markers and watch paths
4. Enqueues a deployment if all checks pass

---

## Setting Up Signature Verification

Verifying signatures prevents unauthorized third parties from triggering deploys. Configure secrets in `rivetr.toml`:

```toml
[webhooks]
github_secret  = "your-hmac-secret"    # verifies X-Hub-Signature-256
gitlab_token   = "your-token"          # matched against X-Gitlab-Token header
gitea_secret   = "your-hmac-secret"    # verifies X-Gitea-Signature
bitbucket_secret = "your-secret"       # verifies X-Hub-Signature-256
```

If a secret is set and the signature does not match, the request is rejected with `401`.

---

## GitHub

1. Open your repository on GitHub → **Settings → Webhooks → Add webhook**.
2. Set **Payload URL** to `https://your-server/webhooks/github`.
3. Set **Content type** to `application/json`.
4. Set **Secret** to the same value as `webhooks.github_secret` in your config.
5. Select **Just the push event** (or add **Pull requests** for preview deployments).
6. Click **Add webhook**.

### GitHub App (alternative)

If you set up a GitHub App via **Settings → GitHub Apps**, Rivetr receives events automatically, with no per-repo webhook configuration needed.

---

## GitLab

1. Open your project → **Settings → Webhooks**.
2. Set **URL** to `https://your-server/webhooks/gitlab`.
3. Set **Secret token** to the value of `webhooks.gitlab_token`.
4. Check **Push events** (and **Merge request events** for previews).
5. Click **Add webhook**.

---

## Gitea

1. Open your repository → **Settings → Webhooks → Add Webhook → Gitea**.
2. Set **Target URL** to `https://your-server/webhooks/gitea`.
3. Set **Secret** to the value of `webhooks.gitea_secret`.
4. Select **Push** events.
5. Click **Add Webhook**.

---

## Bitbucket

1. Open your repository → **Repository settings → Webhooks → Add webhook**.
2. Set **URL** to `https://your-server/webhooks/bitbucket`.
3. Set **Secret** to the value of `webhooks.bitbucket_secret`.
4. Select **Repository push** under triggers.
5. Click **Save**.

---

## Docker Hub Auto-Deploy

When a new image is pushed to Docker Hub, Rivetr can automatically redeploy any app that uses that image.

1. Open your Docker Hub repository → **Webhooks → Add webhook**.
2. Set the URL to `https://your-server/webhooks/dockerhub`.
3. In the Rivetr dashboard, open the app and enable **Docker Hub trigger** under **Settings**.

Rivetr matches the incoming image tag against the app's configured image and triggers a redeploy if they match.

---

## Skip Markers

To prevent a specific commit from triggering a deploy, include one of these strings anywhere in the commit message:

```
[skip ci]
[ci skip]
[no deploy]
[skip deploy]
```

Example:

```
git commit -m "fix typo in README [skip ci]"
```

Rivetr checks the commit message of the push event. If any skip marker is found, the webhook is acknowledged but no deployment is queued.

---

## Watch Paths

By default, any push to the tracked branch triggers a deploy. Watch paths let you narrow this: a deploy is only triggered if at least one changed file matches a path pattern.

Configure watch paths in the Rivetr dashboard under your app's **Settings → Watch Paths**, or in `deploy.toml`:

```toml
[deploy]
watch_paths = [
  "src/**",
  "package.json",
  "Dockerfile",
]
```

Paths use glob syntax. If the push changes no files matching any pattern, the webhook is silently skipped.

---

## Webhook Audit Log

Every inbound webhook is recorded. Go to **Settings → Webhook Events** to see a full history of received payloads, matched apps, and whether a deploy was triggered or skipped (and why).
