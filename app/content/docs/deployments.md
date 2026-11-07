# Deployments

A deployment takes source code, produces a container image, starts a container and moves traffic to it without dropping requests. Rivetr keeps the previous version until the new one passes its health check.

## The pipeline

| Stage | What happens |
|---|---|
| Freeze check | The app's freeze windows are evaluated. A blocked deploy is recorded with status `skipped`. |
| Queue | The deployment waits for a build slot. `[runtime] max_concurrent_deployments` defaults to 2. |
| Clone | The Git CLI clones the repository and checks out the branch or commit. Shallow clones are on by default. |
| Build | The selected build type produces an image. See [Build types](/docs/build-types). |
| Start | The new container starts on a private port on the `rivetr` network. |
| Health check | Rivetr polls HTTP or runs a command inside the container until it passes, the retries run out, or the timeout expires. |
| Switch | The proxy route table is updated atomically. New requests go to the new container. |
| Drain | In-flight requests on the old container finish, up to `[proxy] drain_timeout_secs` (default 30). Then the old container is stopped. |

The route table sits behind `ArcSwap`, so the switch does not restart the proxy or interrupt unrelated apps. If the health check fails, Rivetr keeps the old container serving and marks the deployment failed.

Deployment statuses are `pending`, `queued`, `running`, `success`, `failed`, `cancelled` and `skipped`.

## Build types at a glance

| Build type | Use it when |
|---|---|
| Dockerfile | The repository has a Dockerfile, or you need full control of the image. |
| Nixpacks | You want automatic language and framework detection with no Dockerfile. |
| Railpack | The repository has a `railpack.toml`, or you want Railway's successor to Nixpacks. |
| Cloud Native Buildpacks | You want Paketo or Heroku buildpacks and a `project.toml`. |
| Static | The app is a static site with no server process. Rivetr builds an NGINX image. |
| Docker image | The image already exists in a registry and only needs to be pulled and run. |

Build type, Dockerfile path, build commands and publish directory are set on the app's **Build** tab or through the API. They are stored per app in the database.

## Health checks and zero-downtime

Configure the health check under the app's **Healthcheck** tab:

- HTTP check: path, expected status code, optional expected body text.
- Command check: a command run inside the container, with exit code 0 meaning healthy.
- Timing: interval, timeout, retries and start period.

The check window is never shorter than `[runtime] health_check_timeout_secs`, which defaults to 20 seconds. An app-specific setting can extend it.

A deployment only goes live after the check passes. Requests continue to reach the old container until the atomic switch, and the old container stays alive during the drain window. WebSocket tunnels are not waited for during drain.

## Rollback

### Automatic rollback

If the new container fails its health check, the deployment is marked failed and the previous container keeps serving. No manual action is needed.

### Manual rollback

Open the app's **Deployments** page and choose rollback on a previous successful deployment, or call:

```bash
curl -X POST http://localhost:8080/api/deployments/DEPLOYMENT_ID/rollback \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

Rollback reuses the image from the target deployment, starts a container from it, health checks it and swaps the route. It does not rebuild. The previous container is renamed with a `-prev` suffix while the rollback container starts.

Rollback settings on the app's **Rollback** tab control automatic rollback, registry push and the maximum number of versions. Retention is 1 to 50 deployments and defaults to 10; successful deployments beyond that count are pruned, which also limits how far back you can roll back.

### Rollback with data

A deployment can snapshot managed databases before it starts. Enable **Snapshot before deploy** on the app's **Rollback** tab. When rolling back from the Deployments page, select **Also restore database data** to restore the snapshot taken before that deployment.

Supported engines are PostgreSQL, MySQL, MariaDB, MongoDB, Redis and KeyDB. Snapshots are limited to 256 MiB. A restore replaces current data: anything written after the snapshot is lost. Rivetr takes a safety backup of the current data first. Redis and KeyDB restores stop the container and replace `dump.rdb`, so they need a local volume and no AOF.

## Preview deployments

Preview deployments build pull requests on their own subdomain. All four Git providers are supported: GitHub, GitLab, Gitea and Bitbucket.

- Enable **Enable PR Previews** on the app's **Build** tab.
- The preview hostname is `pr-<number>.<app>.<preview_domain>`. Set `[proxy] preview_domain` in `rivetr.toml`; if unset it defaults to `preview.localhost`.
- The **Previews** tab lists active previews and allows redeploy or delete.
- Closing or merging the pull request cleans up the preview.
- GitHub pull requests receive a comment with the preview URL.

Preview deployments are exempt from freeze windows unless the window explicitly includes previews.

## Deploy a commit, tag or schedule

The deploy control on the app page deploys the configured branch by default. It also accepts a specific commit SHA or Git tag. Over the API:

```bash
curl -X POST http://localhost:8080/api/apps/APP_ID/deploy \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"git_tag": "v1.2.3"}'
```

Use `"commit_sha"` for a commit. An empty body deploys the configured branch.

To schedule a deployment, add `scheduled_at` as an RFC 3339 timestamp:

```json
{ "commit_sha": "abc123", "scheduled_at": "2026-11-10T09:00:00Z" }
```

The scheduler checks every minute and queues deployments whose time has passed. A scheduled deployment is checked against freeze windows when it becomes due, not when it is created. If the app requires approval, the deployment waits for an admin; approving it queues the deployment immediately.

## Approvals

Enable **Require Approval** on the app's **Advanced** tab. A deployment created by a non-admin then waits with a pending approval and is not queued until an admin approves it. Only users with the `admin` role can approve or reject.

```bash
curl -X POST http://localhost:8080/api/deployments/DEPLOYMENT_ID/approve \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

curl -X POST http://localhost:8080/api/deployments/DEPLOYMENT_ID/reject \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Waiting for the release window"}'
```

Admins bypass the approval requirement.

## Freeze windows

Freeze windows block deployments during maintenance periods. Create them under **Advanced > Deployment Control** on the app, or team-wide. Each window has a start time, end time and days of the week, all in UTC, with `HH:MM` times and days numbered from 0 (Sunday). A window whose end time is earlier than its start crosses midnight.

Windows apply to manual deploys, Git and registry webhooks, scheduled deploys, tag deploys and Compose auto-deploys. Previews are exempt unless the window includes them.

A blocked webhook deploy is recorded twice: a deployment with status `skipped`, and a webhook event with status `frozen`. ZIP uploads are manual and are not blocked at trigger time.

## Watch paths

Watch paths limit webhook deploys to pushes that change selected files. Set them on the **Build** tab as a JSON array:

```json
["src/", "package.json", "Dockerfile"]
```

An empty list deploys on every push. A path ending in `/` matches everything under it. Matching uses glob patterns, so `src/**` and `*.json` work. If no changed file matches, the deployment is skipped and the webhook event records the reason.

## Replicas

Run up to 10 containers for one app behind round-robin load balancing. Set the count on the **Resources** tab, or over the API:

```bash
curl -X PUT http://localhost:8080/api/apps/APP_ID/replicas/count \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"count": 3}'
```

Replicas are for single-server apps. For an app placed on multiple servers, set containers per server under **Resources > Servers** instead.

## ZIP uploads

Choose **Upload ZIP** when creating an app, or upload a new source from the app. The archive limit is 100 MB. Rivetr detects the build type from the archive contents and stores the extracted source for later deploys.

Over the API, send a multipart request to `POST /api/apps/APP_ID/deploy/upload` with the archive in the `file` or `zip` field. Subsequent deploys rebuild from the stored source without another upload.

## Cancellation and cloning

A queued or running deployment can be cancelled from the Deployments page or with `POST /api/apps/APP_ID/deployments/DEPLOYMENT_ID/cancel`. Cancelled deployments stop before they switch traffic.

Apps, databases and services can be cloned to another project, environment or server. Volume data can be included when cloning within the same server; cross-server clones copy configuration only. Clone jobs run in the background and report progress through `/api/clone-jobs/{id}`.

## Resource limits

CPU and memory limits are set per app on the **Resources** tab. Changes apply live through `docker update` without a redeploy. Limits fall back to `[runtime] default_memory_limit` (512 MB) when unset. PID limits (`default_pids_limit`, 512) and the OOM score adjustment (`default_oom_score_adj`, 500) also apply by default. Builds are capped separately by `build_cpu_limit` (2 CPUs) and `build_memory_limit` (2 GB).

## Related

- [Build types](/docs/build-types): builder configuration and detection.
- [Webhooks](/docs/webhooks): triggers, signatures and the event log.
- [Services](/docs/services): Docker Compose and template deployments.
- [Environment variables](/docs/environment-variables): secrets available at build and run time.
- [Domains and HTTPS](/docs/domains-and-https): routing and certificates.
