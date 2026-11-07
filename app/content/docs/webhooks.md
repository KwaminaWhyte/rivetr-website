# Webhooks

Webhooks tell Rivetr when to deploy. GitHub, GitLab, Gitea, Bitbucket and Docker Hub are supported. Each provider posts to a root path on the Rivetr instance:

| Provider | Endpoint |
|---|---|
| GitHub | `POST /webhooks/github` |
| GitLab | `POST /webhooks/gitlab` |
| Gitea | `POST /webhooks/gitea` |
| Bitbucket | `POST /webhooks/bitbucket` |
| Docker Hub | `POST /webhooks/dockerhub?token=YOUR_SECRET` |

The endpoints are not under `/api`. The full URL is the dashboard origin plus the path, for example `https://rivetr.example.com/webhooks/github` or `http://203.0.113.10:8080/webhooks/github` when Rivetr is reached by IP and port.

## Secrets and verification

Verification fails closed. If the matching secret is not configured, or the request does not carry a valid signature, Rivetr returns `401` and does not deploy.

```toml
[webhooks]
github_secret = "..."
gitlab_token = "..."
gitea_secret = "..."
bitbucket_secret = "..."
dockerhub_secret = "..."
```

| Provider | Header | Format |
|---|---|---|
| GitHub | `X-Hub-Signature-256` | `sha256=` followed by the hex HMAC-SHA256 of the raw body |
| GitLab | `X-Gitlab-Token` | The secret itself, compared in constant time |
| Gitea | `X-Gitea-Signature` | Plain hex HMAC-SHA256, with no `sha256=` prefix |
| Bitbucket | `X-Hub-Signature` | `sha256=` followed by the hex HMAC-SHA256 |
| Docker Hub | `?token=` query parameter | The secret in the URL; there is no signature header |

Restart the service after editing `rivetr.toml`. Secrets are read at startup.

GitHub also accepts a webhook secret from a configured GitHub App. A GitHub App delivery is valid if it matches the App's webhook secret even when `webhooks.github_secret` is unset. A global secret and an App secret must not be confused: use the value that belongs to the App installation sending the event.

## GitHub App

Creating a GitHub App under **Integrations > Git** is the recommended GitHub setup. The App receives push and pull request events for the repositories it is installed on, and Rivetr uses the installation token for clones. You do not add a webhook per repository.

For GitHub, Rivetr deduplicates deliveries on `X-GitHub-Delivery`, so a redelivered event does not start a second deployment.

## Supported events

| Event | Behavior |
|---|---|
| Push to a branch | Deploys every app whose Git URL matches the repository and whose configured branch matches the pushed branch exactly. Compose services with a matching repository also deploy. |
| Push to a tag | Ignored by the push handler. Tags are deployed with the deploy-by-tag action instead. |
| Branch deletion | Ignored. |
| Pull request opened or updated | Creates or updates a preview deployment when previews are enabled for the app. |
| Pull request closed or merged | Removes the preview deployment and its route. |
| Ping | Acknowledged. No deployment and no event log entry. |
| Docker Hub push | Deploys apps whose configured image matches the pushed repository and tag. |

Other event types are accepted but ignored. A webhook is not a per-app trigger: a push can deploy several apps if they point at the same repository and branch. If an app's branch differs, the push does not deploy it.

## Skip markers

A push does not deploy when its commit message contains any of these markers, case-insensitive:

- `[skip ci]`
- `[ci skip]`
- `[skip cd]`
- `[cd skip]`
- `[skip deploy]`
- `[no deploy]`

The marker must be in the pushed commit message. A marker in an earlier commit does not stop the deploy for providers that only inspect the head or newest commit.

## Watch paths

Watch paths restrict a deploy to pushes that touch selected files. Set them on the app's **Build** tab as a JSON array:

```json
["src/", "package.json", "Dockerfile"]
```

- An empty list deploys on every push.
- A trailing slash is treated as `/**`, so `src/` matches everything under `src`.
- Entries use glob matching; `src/**`, `*.json` and `Dockerfile` work.
- A push with no matching changed file does not deploy. The webhook event is still accepted; the deployment list simply shows no new deployment for that app.

## Freeze windows

Freeze windows block webhook deploys during maintenance periods. When a push arrives inside a window:

- A deployment row is created with status `skipped`.
- The webhook event is recorded with status `frozen` and a note naming the window.
- No container is built or started.

Preview deployments are exempt unless the freeze window explicitly includes previews. A window that blocks everything else still allows preview builds.

## Webhook event log

Push, pull request and Docker Hub deliveries are recorded under **Integrations > Webhook Events**, with provider, event type, repository, branch, status and notes. Ping and unsupported event types are acknowledged without an entry. The same records are available from `GET /api/webhook-events`.

| Status | Meaning |
|---|---|
| `processed` | The event was handled. A deployment was queued, or no app needed one, for example because no watched file changed |
| `ignored` | No app matched the repository and branch |
| `frozen` | A matching deploy was blocked by a freeze window, and no other app was queued |

Events are kept for `[data_retention] webhook_events_days`, which defaults to 30 days. Use the log to see whether a delivery reached Rivetr; if it shows `processed` but nothing deployed, check watch paths, duplicate active deployments and the app's branch.

## Docker Hub

Docker Hub webhooks do not sign the payload. Instead, the secret travels in the URL:

```
https://rivetr.example.com/webhooks/dockerhub?token=YOUR_SECRET
```

Set the same value as `[webhooks] dockerhub_secret`. Rivetr matches the pushed repository and tag against app images: an app configured with `nginx:1.27` matches that tag, and an app configured with `nginx:latest` matches pushes to the latest tag. If no app matches, the event is recorded as ignored.

## Troubleshooting

| Symptom | Check |
|---|---|
| `401` from GitHub | `webhooks.github_secret` or the App webhook secret is missing, or the `X-Hub-Signature-256` value does not match the raw body. Proxies that rewrite the body break HMAC verification. |
| `401` from GitLab | `X-Gitlab-Token` must equal `webhooks.gitlab_token` exactly. |
| `401` from Gitea | Gitea sends plain hex. Do not prepend `sha256=`; the signature will fail. |
| `401` from Bitbucket | Bitbucket uses the `sha256=` prefix, like GitHub. |
| `401` from Docker Hub | The `token` query parameter is missing or does not equal `dockerhub_secret`. |
| Event is logged but nothing deploys | `ignored` means no app matched the repository and branch. `frozen` means a freeze window blocked it. For `processed`, check watch paths, skip markers and an active deployment for the same commit. |
| Preview is not created | Enable PR Previews on the app, subscribe the webhook to pull request or merge request events, and set a reachable `[proxy] preview_domain`. |
| Duplicate delivery does nothing | GitHub delivery IDs are deduplicated. The second delivery is acknowledged without a second deploy. |

## Testing a webhook

Use the provider's redeliver action on a recent delivery, then open **Integrations > Webhook Events** and read the status and notes. For GitHub Apps, the App's **Advanced** page lists recent deliveries and their response codes. A `2xx` response means Rivetr accepted the delivery; it does not always mean a deployment was queued.
