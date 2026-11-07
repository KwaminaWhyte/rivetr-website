# Monitoring and Logs

Rivetr streams container logs, keeps deployment logs with per-app retention, reports host and container resource usage, exposes Prometheus metrics, tracks uptime, and forwards events to notification channels and log drains.

## Live logs

Runtime logs are streamed from the container runtime:

- App runtime logs use Server-Sent Events at `GET /api/apps/:id/logs/stream`. The stream starts with the last 100 lines and follows new output with timestamps.
- Compose service logs use SSE at `GET /api/services/:id/logs/stream`.
- A single service container's recent logs are available at `GET /api/services/:id/containers/:container/logs?lines=`.
- Database container logs are available at `GET /api/databases/:id/logs`.

Deployment logs are different. They are produced by Rivetr, stored in SQLite, and available after the deployment ends:

- `GET /api/deployments/:id/logs` returns stored lines.
- `WS /api/deployments/:id/logs/stream?token=` streams them live.
- `WS /api/services/:id/deployments/:deployment_id/logs/stream?token=` does the same for a service deployment.

Runtime logs are not stored by Rivetr. Docker or Podman keeps them under the container log rotation configured by `runtime.default_log_max_size` and `runtime.default_log_max_file`, which default to `10m` and `3`.

## Log search and retention

`GET /api/apps/:id/logs/search` searches an app's stored deployment logs. Query parameters:

| Parameter | Meaning |
|---|---|
| `q` | Text to match |
| `from`, `to` | Time bounds |
| `level` | Log level filter |
| `limit` | Maximum rows |

Each app can have its own retention policy:

```
GET /api/apps/:id/log-retention
PUT /api/apps/:id/log-retention
```

`retention_days` accepts 1 to 365 and defaults to 30. `max_size_mb` caps the stored deployment logs for the app. Apps without a policy use the 30-day default. The cleaner also enforces size limits and can be triggered manually with `POST /api/system/log-cleanup`.

## Monitoring page

The dashboard's monitoring view combines container and host figures from `GET /api/system/stats` with disk figures from `GET /api/system/disk`:

- Host CPU utilization across all cores, plus CPU steal. Steal is the share of cycles the hypervisor took for other tenants; it stays at zero on bare metal and rises on an oversubscribed host.
- Container memory used and the sum of container limits, plus host total, used, and available memory.
- Host swap total and used.
- Host load averages over 1, 5, and 15 minutes.
- Running and total counts for apps, databases, and services.
- Server uptime and uptime percentage.
- Disk total, used, free, and usage percentage from the disk monitor. The monitor checks every 300 seconds by default, logs a warning at 80 percent and a critical message at 90 percent.

Historical resource data is available at `GET /api/system/stats/history` and summarized at `GET /api/system/stats/summary`. The `[stats_retention]` settings keep raw samples for 7 days, hourly aggregates for 30 days, and daily aggregates for 365 days.

Per-app resource graphs come from `GET /api/apps/:id/stats`; databases and services have equivalent stats endpoints.

## Prometheus metrics

`GET /metrics` returns Prometheus text format. The endpoint is public, so restrict access at the network layer if the instance is reachable from untrusted networks.

| Metric | Type | Meaning |
|---|---|---|
| `http_requests_total` | counter | HTTP requests by route |
| `http_request_duration_seconds` | histogram | Request duration |
| `deployments_total` | counter | Deployments by status |
| `apps_total` | gauge | Registered apps |
| `containers_running` | gauge | Running containers |
| `rivetr_deployments_total` | counter | Rivetr deployments by status |
| `rivetr_deployment_duration_seconds` | histogram | Deployment duration |
| `rivetr_active_apps_total` | gauge | Active apps |
| `rivetr_active_databases_total` | gauge | Active databases |
| `rivetr_webhooks_received_total` | counter | Webhook deliveries |
| `rivetr_disk_total_bytes`, `rivetr_disk_used_bytes`, `rivetr_disk_free_bytes` | gauge | Disk capacity |
| `rivetr_disk_usage_percent` | gauge | Disk usage |
| `rivetr_health_check_total` | counter | Proxy health checks by domain and result |
| `rivetr_health_check_duration_seconds` | histogram | Proxy health check latency |
| `rivetr_backend_healthy` | gauge | 1 healthy, 0 unhealthy |
| `rivetr_health_check_consecutive_failures` | gauge | Consecutive failed checks |
| `rivetr_container_cpu_percent` | gauge | Container CPU, labeled by app |
| `rivetr_container_memory_bytes`, `rivetr_container_memory_limit_bytes` | gauge | Container memory |
| `rivetr_container_network_rx_bytes`, `rivetr_container_network_tx_bytes` | gauge | Container network |
| `rivetr_container_restarts_total` | counter | Container restarts |
| `rivetr_container_restart_backoff_seconds` | gauge | Current restart backoff |

## Health checks and uptime

An app's health check can be an HTTP request or a command.

HTTP checks support a method, scheme, host, port, path, expected status code, and expected body. Timing fields are:

| Field | Default |
|---|---|
| Interval | 5 seconds |
| Timeout | 5 seconds |
| Retries | 10 |
| Start period | 5 seconds |

The defaults for path and host are `/` and `localhost`. During a deployment, Rivetr starts the new container, runs the health check, and only then switches proxy traffic. A failure triggers rollback to the previous deployment.

Uptime tracking is separate from the deploy health check. The uptime checker probes each app every 60 seconds and records status (`up`, `down`, or `degraded`), response time, HTTP status code, and error. History is kept for 30 days.

```
GET /api/apps/:id/uptime?period=24h|7d|30d
GET /api/apps/:id/uptime/history
```

## Traffic analytics

Traffic analytics are recorded by the embedded proxy per app, server, and team. Reports cover requests, 2xx, 3xx, 4xx, 5xx, bytes in and out, p50 and p95 latency, unique visitors, top paths, top referrers, top user agents, top hosts, and, when GeoIP is configured, top countries.

Ranges are `1h`, `24h` (default), `7d`, and `30d`.

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/analytics?range=&team_id=` | Everything the caller can see |
| GET | `/api/apps/:id/analytics?range=` | One app |
| GET, PUT | `/api/servers/:id/analytics` | Read a server's report or enable and disable analytics |
| GET, PUT | `/api/analytics/settings` | Retention days and the GeoIP database path |

Analytics retention defaults to 30 days and accepts 1 to 365. A GeoIP database path is optional; without one, the country breakdown is omitted.

## Notifications

Notification channels support Slack, Discord, email, generic webhook, Telegram, Microsoft Teams, Pushover, Ntfy, Mattermost, Lark, and Gotify. Configure them under notification settings, then subscribe each channel to events:

- `deployment_started`, `deployment_success`, `deployment_failed`
- `app_started`, `app_stopped`
- `container_crash`, `container_restarted`
- `backup_succeeded`, `backup_failed`, `backup_missed`

| Method | Path | Purpose |
|---|---|---|
| GET, POST | `/api/notification-channels` | List or create channels |
| GET, PUT, DELETE | `/api/notification-channels/:id` | Manage one channel |
| POST | `/api/notification-channels/:id/test` | Send a test message |
| GET, POST | `/api/notification-channels/:id/subscriptions` | List or add event subscriptions |
| DELETE | `/api/notification-subscriptions/:id` | Remove a subscription |

## Log drains

A log drain forwards an app's container logs to an external service. Supported providers:

| Provider | Configuration |
|---|---|
| Axiom | Dataset and API token |
| New Relic | API key and region (`us` or `eu`) |
| Datadog | API key and site, for example `datadoghq.com` or `datadoghq.eu` |
| Logtail (Better Stack) | Source token |
| HTTP | URL, plus optional authorization header name and value |

Manage drains under the app's log settings or with `/api/apps/:id/log-drains`. The list shows the last send time, error count, and last error. `POST /api/apps/:id/log-drains/:drain_id/test` sends a test entry. Credential fields are masked in API responses.

## Crash recovery

The container monitor checks container health every 30 seconds by default. When a container crashes, Rivetr restarts it with exponential backoff:

| Setting | Default |
|---|---|
| `container_monitor.check_interval_secs` | 30 |
| `container_monitor.max_restart_attempts` | 5 |
| `container_monitor.initial_backoff_secs` | 5 |
| `container_monitor.max_backoff_secs` | 300 |
| `container_monitor.stable_duration_secs` | 120 |

A container that runs for the stable duration resets its restart counter. After the maximum attempts the deployment is marked failed. Crash and restart events can notify through the `container_crash` and `container_restarted` subscriptions.

## Data retention

`[data_retention]` prunes high-volume tables once a day in bounded batches of 10,000 rows:

| Key | Default | Data |
|---|---|---|
| `proxy_logs_days` | 14 | Proxy access logs |
| `webhook_events_days` | 30 | Webhook delivery events |
| `audit_logs_days` | 90 | User and team audit logs |
| `scheduled_job_runs_keep` | 100 | Latest runs per scheduled job |
| `deployment_snapshots_keep` | 3 | Deployments per app with pre-deploy database snapshots |

Set a value to `0` to disable pruning for that item. Expired sessions are always removed after a one-day grace period.
