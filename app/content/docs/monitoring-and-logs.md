# Monitoring and Logs

Rivetr provides live log streaming, full-text log search, uptime and response-time tracking, Prometheus metrics, and automatic crash recovery, all built in, no external observability stack required.

---

## Live Log Streaming

### App Logs

Stream an app's stdout/stderr in real time:

**SSE (Server-Sent Events)**: works in any browser and HTTP client:

```bash
curl -N "https://your-server/api/apps/<app_id>/logs/stream" \
  -H "Authorization: Bearer <token>"
```

**WebSocket**: used by the dashboard terminal:

```
wss://your-server/api/deployments/<deployment_id>/logs/stream?token=<token>
```

### Deployment Logs

Each deployment step (clone, build, start, health check) streams logs via WebSocket:

```
wss://your-server/api/deployments/<deployment_id>/logs/stream?token=<token>
```

Stored deployment logs (after the deployment completes) are also available via REST:

```bash
curl https://your-server/api/deployments/<deployment_id>/logs \
  -H "Authorization: Bearer <token>"
```

### Service and Database Logs

```bash
# Service logs (Docker Compose)
curl https://your-server/api/services/<id>/logs \
  -H "Authorization: Bearer <token>"

# Stream service start logs
# wss://your-server/api/services/<id>/start-stream?token=<token>

# Database logs
curl https://your-server/api/databases/<id>/logs \
  -H "Authorization: Bearer <token>"
```

---

## Full-Text Log Search

Search an app's stored logs by keyword:

```bash
curl "https://your-server/api/apps/<app_id>/logs/search?q=ERROR&limit=100" \
  -H "Authorization: Bearer <token>"
```

### Log Retention Policy

Configure how many days of logs to keep per app:

```bash
# Get current policy
curl https://your-server/api/apps/<app_id>/log-retention \
  -H "Authorization: Bearer <token>"

# Update policy
curl -X PUT https://your-server/api/apps/<app_id>/log-retention \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"retention_days": 14}'
```

Manual cleanup:

```bash
curl -X POST https://your-server/api/system/log-cleanup \
  -H "Authorization: Bearer <token>"
```

---

## Uptime and Response-Time Tracking

Rivetr tracks uptime by recording the result of each periodic health check. The health check URL is configured in `deploy.toml`:

```toml
[deploy]
healthcheck = "/health"
healthcheck_timeout = 30
```

Query uptime status:

```bash
# Current status
curl https://your-server/api/apps/<app_id>/uptime \
  -H "Authorization: Bearer <token>"

# Historical uptime
curl https://your-server/api/apps/<app_id>/uptime/history \
  -H "Authorization: Bearer <token>"
```

Health check latency (response time) is recorded alongside each check and exposed in the dashboard's Recharts graphs.

The embedded proxy also performs independent backend health checks:

```toml
[proxy]
health_check_interval = 30    # seconds between checks
health_check_timeout = 5      # seconds before timeout
health_check_threshold = 3    # consecutive failures before marking unhealthy
```

---

## Prometheus Metrics

Rivetr exposes a Prometheus-compatible metrics endpoint with no authentication required (suitable for scraping from a private network):

```
GET /metrics
```

Metrics include container resource usage (CPU, memory), request counts, deployment durations, uptime status, and disk usage.

Example Prometheus scrape config:

```yaml
scrape_configs:
  - job_name: rivetr
    static_configs:
      - targets: ["your-server:8080"]
```

Per-app and per-system stats are also available via the REST API:

```bash
# System stats
curl https://your-server/api/system/stats \
  -H "Authorization: Bearer <token>"

# App resource stats
curl https://your-server/api/apps/<app_id>/stats \
  -H "Authorization: Bearer <token>"
```

---

## Crash Recovery with Exponential Backoff

Rivetr's container monitor watches for unexpected container exits and restarts them automatically:

```toml
[container_monitor]
enabled = true
check_interval_secs = 30     # how often to check container states
max_restart_attempts = 5     # attempts before marking the deployment failed
initial_backoff_secs = 5     # wait after first crash; doubles each retry
max_backoff_secs = 300       # cap on backoff delay
stable_duration_secs = 120   # seconds running before restart counter resets
```

**Backoff schedule (defaults):** 5s → 10s → 20s → 40s → 80s, then the deployment is marked failed and no further restarts are attempted.

---

## Log Draining

Forward logs to an external aggregator in real time:

| Provider | Type |
|----------|------|
| Axiom | HTTP |
| New Relic | HTTP |
| Datadog | HTTP |
| Logtail / Better Stack | HTTP |
| Any HTTP endpoint | HTTP |

```bash
curl -X POST https://your-server/api/apps/<app_id>/log-drains \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "datadog",
    "url": "https://http-intake.logs.datadoghq.com/v1/input",
    "api_key": "..."
  }'
```

Test a drain before enabling it:

```bash
curl -X POST https://your-server/api/apps/<app_id>/log-drains/<drain_id>/test \
  -H "Authorization: Bearer <token>"
```

---

## Disk Monitoring

Rivetr monitors the `data_dir` filesystem and warns before it fills up:

```toml
[disk_monitor]
enabled = true
check_interval_seconds = 300
warning_threshold = 80    # % usage that logs a warning
critical_threshold = 90   # % usage that logs a critical alert
```

Disk stats are included in the Prometheus `/metrics` output and in `GET /api/system/disk`.
