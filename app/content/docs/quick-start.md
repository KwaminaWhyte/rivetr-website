# Quick start

This page takes a fresh Linux server to a running deployment. It assumes a host with Docker or Podman installed or installable, and ports 80, 443 and 8080 available.

## Install

Run the installer as root:

```bash
curl -fsSL https://raw.githubusercontent.com/KwaminaWhyte/rivetr/main/install.sh | sudo bash
```

The script installs Docker if needed, installs Git, Nixpacks, Railpack and the Pack CLI, creates a `rivetr` service user, downloads the release binary to `/opt/rivetr/rivetr`, writes a config at `/opt/rivetr/rivetr.toml` with a generated admin token, registers a systemd service and opens ports 80, 443 and 8080 in UFW or firewalld.

When it finishes, open:

```
http://your-server-ip:8080
```

The installer prints the paths and the generated admin token at the end. See [Installation](/docs/installation) for requirements, manual setup and service management.

## Create the first admin account

On a fresh instance the dashboard redirects to `/setup`. Enter a name, email and password. The first user is created with the `admin` role, and this endpoint is disabled once any user exists.

After setup you can sign in with the email and password. The admin token in `rivetr.toml` is separate: it authenticates API calls and recovery tasks, not the dashboard login.

## Connect a Git provider

Open **Integrations > Git**. The page has provider tabs for GitHub, GitLab and Bitbucket, plus a manual Git URL option:

| Provider | Setup |
|---|---|
| GitHub | Install a GitHub App. This is the only option that manages webhooks and installation tokens for you. |
| GitLab | Personal access token with the `api` and `read_repository` scopes. |
| Bitbucket | Username and API token with Repository Read and Account Read. |
| Manual | Any HTTPS or SSH Git URL, with credentials if the repository is private. Use this for Gitea and any other host. |

For SSH repositories, add a deploy key under **Keys > SSH**. The same page holds personal API tokens under **Keys > API Tokens**.

If you use a GitHub App, Rivetr registers the webhook and signs deliveries with the App's webhook secret. For Gitea, GitLab, Bitbucket and manual Git URLs, configure the webhook after creating the app, as described below.

## Create an app

1. Open **Projects**, create a project, then choose **New Application**.
2. Pick a source: **Build from Git**, **Upload ZIP** or **Docker Registry**.
3. For a Git source, select the provider, repository and branch.
4. Set the build type. Nixpacks is selected by default and builds most languages without a Dockerfile.
5. Set the container port the app listens on. The default is 3000.
6. Optionally set a domain now, or add one later under the app's **Domains** tab.
7. Create the application.

The app's **Build** tab holds the Dockerfile path, Nixpacks commands, static publish directory, preview toggle, clone options and build secrets. **Resources** sets CPU and memory limits; **Environment** holds env vars and secrets; **Healthcheck** configures the health check.

## Set up the webhook

Skip this step for GitHub Apps: Rivetr already has a webhook for the installation. For GitLab, Gitea, Bitbucket and manual Git URLs, add a webhook in the Git provider pointing at Rivetr.

The endpoint is on the root path, not under `/api`:

| Provider | URL |
|---|---|
| GitHub | `https://your-host/webhooks/github` |
| GitLab | `https://your-host/webhooks/gitlab` |
| Gitea | `https://your-host/webhooks/gitea` |
| Bitbucket | `https://your-host/webhooks/bitbucket` |
| Docker Hub | `https://your-host/webhooks/dockerhub?token=YOUR_SECRET` |

Use the dashboard URL (`http://your-server-ip:8080`) when Rivetr is not behind a domain. Subscribe to push events; add pull request or merge request events if you want preview deployments. Set the secret in the provider and in the matching `[webhooks]` key in `rivetr.toml`:

```toml
[webhooks]
github_secret = "..."
gitlab_token = "..."
gitea_secret = "..."
bitbucket_secret = "..."
dockerhub_secret = "..."
```

Verification fails closed: if no secret is configured for a provider, Rivetr rejects that provider's webhooks with `401`. Restart the service after editing the config. See [Webhooks](/docs/webhooks) for signature formats, skip markers and the event log.

## Deploy

Open the app and click **Deploy**. The deployment page streams build output, then the container start, health check and proxy switch. A successful deploy ends with the new container receiving traffic and the old one drained.

If the health check fails, the deployment is marked failed and Rivetr keeps the previous version serving traffic.

To add a domain, open **Domains**, add the hostname and create a DNS record pointing at the server. With `[proxy] acme_email` set, Rivetr requests a Let's Encrypt certificate per domain and serves HTTPS on port 443.

## Next steps

- [Deployments](/docs/deployments): previews, approvals, freeze windows, scheduled deploys, replicas and rollback.
- [Build types](/docs/build-types): choose and configure a builder.
- [Webhooks](/docs/webhooks): endpoints, signatures and troubleshooting.
- [Environment variables](/docs/environment-variables): app, project, environment and team scope.
- [Databases](/docs/databases): provision PostgreSQL, MySQL, Redis and other managed engines.
- [Services](/docs/services): deploy from the 365 templates or from Docker Compose.
