# Configuration

Rivetr uses two configuration files:

- **`rivetr.toml`**: server-level configuration (ports, auth, runtime, proxy, email, etc.)
- **`deploy.toml`**: per-app configuration placed in each repository root

All fields are optional. Omit any field and the documented default applies.

---

## `rivetr.toml`: Server configuration

### `[server]`

Network and data location settings.

| Field | Default | Description |
|-------|---------|-------------|
| `host` | `"0.0.0.0"` | Address the API and proxy bind to. |
| `api_port` | `8080` | Port for the REST API and dashboard. |
| `proxy_port` | `80` | Port for the embedded HTTP reverse proxy. |
| `proxy_https_port` | `443` | Port for the embedded HTTPS reverse proxy. |
| `data_dir` | `"./data"` | Directory for the SQLite database, ACME cache, and backups. |
| `external_url` | - | Publicly reachable base URL. Required for GitHub App callbacks when behind a tunnel (e.g. ngrok). |

### `[auth]`

| Field | Default | Description |
|-------|---------|-------------|
| `admin_token` | auto-generated | Bearer token for API access. Set explicitly in production so it is stable across restarts. |
| `encryption_key` | - | Secret for encrypting env vars at rest (AES-256-GCM). Use a strong random string of 32+ characters. |

### `[runtime]`

| Field | Default | Description |
|-------|---------|-------------|
| `runtime_type` | `"auto"` | One of `auto`, `docker`, `podman`. `auto` detects the available runtime. |
| `build_cpu_limit` | `"2"` | CPU limit during builds. |
| `build_memory_limit` | `"2g"` | Memory limit during builds. |
| `default_memory_limit` | `"512m"` | Fallback memory cap for containers without an explicit limit. |
| `default_pids_limit` | `512` | Fallback PID limit per container (fork-bomb protection). |

### `[proxy]`

| Field | Default | Description |
|-------|---------|-------------|
| `acme_enabled` | `false` | Enable automatic HTTPS via Let's Encrypt. |
| `acme_email` | - | Email for the Let's Encrypt account (required when `acme_enabled = true`). |
| `acme_staging` | `false` | Use the Let's Encrypt staging environment (avoids rate limits while testing). |
| `acme_cache_dir` | `"./data/acme"` | Directory for ACME account data and certificates. |
| `base_domain` | - | Base domain for auto-generated subdomains, e.g. `apps.example.com`. |
| `sslip_enabled` | `false` | Enable `sslip.io` automatic domains (e.g. `myapp.1.2.3.4.sslip.io`). |
| `preview_domain` | - | Base domain for PR preview deployments. |

### `[webhooks]`

Secrets for verifying inbound Git webhook signatures. All optional but recommended.

| Field | Description |
|-------|-------------|
| `github_secret` | Verifies the GitHub `X-Hub-Signature-256` header. |
| `gitlab_token` | Matched against the GitLab `X-Gitlab-Token` header. |
| `gitea_secret` | Verifies the Gitea HMAC-SHA256 signature. |
| `bitbucket_secret` | Verifies the Bitbucket HMAC-SHA256 signature. |

### `[rate_limit]`

| Field | Default | Description |
|-------|---------|-------------|
| `enabled` | `true` | Master switch for rate limiting. |
| `api_requests_per_window` | `100` | Limit for general API endpoints per window. |
| `webhook_requests_per_window` | `500` | Limit for webhook endpoints per window. |
| `auth_requests_per_window` | `20` | Limit for auth endpoints (anti-brute-force). |
| `window_seconds` | `60` | Window duration in seconds. |

### `[cleanup]`

| Field | Default | Description |
|-------|---------|-------------|
| `enabled` | `true` | Enable automatic cleanup of old deployments. |
| `max_deployments_per_app` | `3` | Deployments kept per app; older ones and their containers are removed. |
| `cleanup_interval_seconds` | `3600` | Seconds between cleanup runs. |
| `prune_images` | `true` | Prune dangling Docker/Podman images after cleanup. |

### `[container_monitor]`

Crash detection and auto-restart with exponential backoff.

| Field | Default | Description |
|-------|---------|-------------|
| `enabled` | `true` | Enable crash monitoring and auto-restart. |
| `check_interval_secs` | `30` | Seconds between container health checks. |
| `max_restart_attempts` | `5` | Restart attempts before marking the deployment failed. |
| `initial_backoff_secs` | `5` | Initial backoff after a crash; doubles each retry. |
| `max_backoff_secs` | `300` | Maximum backoff delay. |
| `stable_duration_secs` | `120` | Seconds a container must run to be considered stable (resets the restart counter). |

### `[email]`

| Field | Default | Description |
|-------|---------|-------------|
| `enabled` | `false` | Enable email sending. |
| `smtp_host` | - | SMTP server hostname. |
| `smtp_port` | `587` | SMTP port. |
| `smtp_username` | - | SMTP auth username. |
| `smtp_password` | - | SMTP auth password. |
| `from_address` | - | From address for outgoing email. |

### `[ai]`

AI-powered features: deployment diagnosis, Dockerfile suggestions, cost insights.

| Field | Default | Description |
|-------|---------|-------------|
| `provider` | `"claude"` | Provider: `claude`, `openai`, `gemini`, or `moonshot`. |
| `api_key` | - | API key for the selected provider. |
| `model` | provider default | Model override. |

### Full example

```toml
[server]
host = "0.0.0.0"
api_port = 8080
proxy_port = 80
proxy_https_port = 443
data_dir = "/var/lib/rivetr"

[auth]
admin_token = "change-me-in-production"
encryption_key = "your-32-char-minimum-key-here"

[runtime]
runtime_type = "auto"
build_cpu_limit = "2"
build_memory_limit = "2g"

[proxy]
acme_enabled = true
acme_email = "admin@example.com"
sslip_enabled = true

[logging]
level = "info"

[webhooks]
github_secret = "your-hmac-secret"
```

---

## `deploy.toml`: Per-app configuration

Place this file in the root of your repository. All fields are optional.

```toml
app = "my-api"
port = 3000

[build]
dockerfile = "./Dockerfile"
# builder = "nixpacks"  # or "railpack", "buildpacks", "static"
# build_args = { NODE_ENV = "production" }

[deploy]
healthcheck = "/health"
healthcheck_timeout = 30
# branch = "main"
# watch_paths = ["src/**", "package.json"]

[resources]
memory = "256mb"
cpu = "0.5"
replicas = 1
```

### Build options

| Field | Description |
|-------|-------------|
| `build.dockerfile` | Path to a Dockerfile, relative to the repo root. |
| `build.builder` | Builder override: `dockerfile`, `nixpacks`, `railpack`, `buildpacks`, `static`. |
| `build.build_args` | Key-value map of Docker build arguments. |

### Deploy options

| Field | Description |
|-------|-------------|
| `deploy.healthcheck` | HTTP path to check after starting the container. |
| `deploy.healthcheck_timeout` | Seconds to wait for the health check to pass. |
| `deploy.branch` | Branch to deploy (defaults to the repository's default branch). |
| `deploy.watch_paths` | Glob patterns: only trigger a deploy when matching files change. |

### Resource limits

| Field | Description |
|-------|-------------|
| `resources.memory` | Container memory limit (e.g. `256mb`, `1g`). |
| `resources.cpu` | CPU shares (e.g. `0.5`, `2`). |
| `resources.replicas` | Number of container replicas. Traffic is load-balanced round-robin. |
