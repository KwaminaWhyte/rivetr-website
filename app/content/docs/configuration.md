# Configuration

Rivetr reads server configuration from a TOML file, `rivetr.toml` by default. Pass `--config <path>` to use another file. Every table and field is optional: a missing file means all defaults apply. Restart the service after editing the file.

Instance settings changed in the dashboard are stored in SQLite and apply without a restart. Server settings such as ports, the data directory, proxy and ACME, runtime limits, rate limits and retention come from this file. Per-app settings (build type, health check, resources, domains, environment) live in the database and are managed from the dashboard or API. They are not stored in a repository file.

## Minimal production example

```toml
[server]
host = "0.0.0.0"
api_port = 8080
proxy_port = 80
proxy_https_port = 443
data_dir = "/var/lib/rivetr"
external_url = "https://rivetr.example.com"

[auth]
admin_token = "replace-with-openssl-rand-hex-32"
encryption_key = "replace-with-openssl-rand-hex-32"

[proxy]
acme_enabled = true
acme_email = "admin@example.com"
instance_domain = "rivetr.example.com"

[rate_limit]
trusted_proxies = ["127.0.0.1"]

[email]
enabled = true
smtp_host = "smtp.example.com"
from_address = "rivetr@example.com"
```

## `[server]`

| Field | Default | Description |
|---|---|---|
| `host` | `"0.0.0.0"` | Address the API and proxy bind to |
| `api_port` | `8080` | REST API and dashboard port |
| `proxy_port` | `80` | Embedded HTTP proxy port |
| `proxy_https_port` | `443` | Embedded HTTPS proxy port |
| `data_dir` | `"./data"` | SQLite database, ACME cache, backups and key files |
| `external_url` | none | Externally reachable base URL for callbacks and webhook URLs |

## `[auth]`

| Field | Default | Description |
|---|---|---|
| `admin_token` | random 256-bit hex per start | Stable bearer token for programmatic API access. Set it explicitly in production. |
| `encryption_key` | none | Key for encrypting secrets at rest. Use at least 32 random characters, for example from `openssl rand -hex 32`. |

The key is resolved in this order: `[auth] encryption_key`, then `<data_dir>/.encryption_key`, then on a fresh install a generated key written to that file with mode `0600`. An existing install with no key keeps values in plaintext and logs a warning.

Back up `.encryption_key` and `.encryption_salt` with the database. To encrypt values that already exist, stop Rivetr and run `rivetr --config rivetr.toml db encrypt-secrets` (dry run) followed by the same command with `--execute`. There is no key rotation command in 1.0.0.

## `[runtime]`

| Field | Default | Description |
|---|---|---|
| `runtime_type` | `"auto"` | `auto`, `docker` or `podman` |
| `docker_socket` | platform default | Docker daemon socket path or URL |
| `build_cpu_limit` | `"2"` | CPU limit for builds |
| `build_memory_limit` | `"2g"` | Memory limit for builds |
| `max_concurrent_deployments` | `2` | Builds allowed at once; extra deploys queue |
| `health_check_timeout_secs` | `20` | Seconds a new container has to pass its health check |
| `default_memory_limit` | `"512m"` | Fallback memory cap for running containers; empty disables |
| `default_pids_limit` | `512` | Fallback PID limit; `0` disables |
| `default_oom_score_adj` | `500` | OOM score adjustment, `-1000` to `1000` |
| `default_log_max_size` | `"10m"` | Log rotation size per container; empty disables |
| `default_log_max_file` | `3` | Rotated log files retained; Docker only |

Per-resource limits override the defaults. The running-container defaults protect the host from a runaway app; the build limits protect it from a runaway build.

## `[proxy]`

| Field | Default | Description |
|---|---|---|
| `acme_enabled` | `false` | Enable Let's Encrypt certificates |
| `acme_email` | none | ACME account email; required when ACME is enabled |
| `acme_staging` | `false` | Use the Let's Encrypt staging environment |
| `health_check_interval` | `30` | Seconds between backend checks |
| `health_check_timeout` | `5` | Timeout per backend check |
| `health_check_threshold` | `3` | Consecutive failures before a backend is unhealthy |
| `drain_timeout_secs` | `30` | Wait for in-flight requests before stopping an old container; `0` disables |
| `base_domain` | none | Base for auto-generated app subdomains |
| `auto_subdomain_enabled` | `false` | Generate subdomains for new apps; needs `base_domain` |
| `server_ip` | none | Public IP for sslip.io domains; auto-detected when unset |
| `sslip_enabled` | `false` | Enable sslip.io automatic domains |
| `preview_domain` | none | Base domain for PR preview deployments |
| `instance_domain` | none | Domain that routes the dashboard and API through the proxy |

Per-domain certificate mode is set on the app's Domains page: automatic HTTP-01, wildcard DNS-01 through a configured DNS provider, or a custom uploaded certificate. Custom certificates win over ACME. Renewal starts 30 days before expiry.

## `[logging]`

`level` sets the log filter: `trace`, `debug`, `info`, `warn` or `error`. Default `"info"`.

## `[webhooks]`

| Field | Default | Description |
|---|---|---|
| `github_secret` | none | Verifies `X-Hub-Signature-256` (HMAC-SHA256) |
| `gitlab_token` | none | Matched against `X-Gitlab-Token` |
| `gitea_secret` | none | Verifies the Gitea HMAC-SHA256 signature |
| `bitbucket_secret` | none | Verifies the Bitbucket HMAC-SHA256 signature |
| `dockerhub_secret` | none | Shared token required as `?token=` on DockerHub webhooks |

Inbound webhooks fail closed. GitHub rejects requests when neither `github_secret` nor a connected GitHub App secret is configured. The other providers reject requests when their secret or token is unset. DockerHub sends no signature header, so its secret travels in the webhook URL; treat that URL as a credential.

## `[oauth]`

Optional provider subtables: `[oauth.github]`, `[oauth.gitlab]` and `[oauth.bitbucket]`. Each accepts `client_id` (required), `client_secret` (required) and `redirect_uri` (optional). Other OAuth providers are configured from the authentication settings page and stored in the database.

## `[rate_limit]`

| Field | Default | Description |
|---|---|---|
| `enabled` | `true` | Master switch |
| `api_requests_per_window` | `100` | General API requests per window |
| `webhook_requests_per_window` | `500` | Webhook requests per window |
| `auth_requests_per_window` | `20` | Authentication requests per window |
| `window_seconds` | `60` | Window length |
| `cleanup_interval` | `300` | Seconds between expired-entry cleanups |
| `trusted_proxies` | `[]` | IPs or CIDRs whose forwarded headers are trusted |

Forwarded headers are read right to left, skipping trusted hops. Loopback peers are always trusted. List only proxies that untrusted clients cannot connect from. Account lockout is separate from IP rate limiting and is described in [/docs/security](/docs/security).

## Background loops and retention

| Table | Fields and defaults |
|---|---|
| `[cleanup]` | `enabled = true`, `max_deployments_per_app = 3` (the example file shows 10 as a sample), `cleanup_interval_seconds = 3600`, `prune_images = true` |
| `[disk_monitor]` | `enabled = true`, `check_interval_seconds = 300`, `warning_threshold = 80`, `critical_threshold = 90` |
| `[container_monitor]` | `enabled = true`, `check_interval_secs = 30`, `max_restart_attempts = 5`, `initial_backoff_secs = 5`, `max_backoff_secs = 300`, `stable_duration_secs = 120` |
| `[database_backup]` | `enabled = true`, `check_interval_seconds = 60`, `backup_dir = "backups"`, `timeout_seconds = 3600` |
| `[stats_retention]` | `enabled = true`, `raw_retention_days = 7`, `hourly_retention_days = 30`, `daily_retention_days = 365`, `cleanup_interval_seconds = 3600` |
| `[data_retention]` | `proxy_logs_days = 14`, `webhook_events_days = 30`, `audit_logs_days = 90`, `scheduled_job_runs_keep = 100`, `deployment_snapshots_keep = 3` |

In `[data_retention]`, a value of `0` disables pruning for that item; expired sessions are always removed after a one-day grace period. The cleanup loop prunes old deployments and, when `prune_images` is on, dangling images.

## `[email]`

| Field | Default | Description |
|---|---|---|
| `enabled` | `false` | Enable outgoing email |
| `smtp_host` | none | SMTP server hostname |
| `smtp_port` | `587` | SMTP port |
| `smtp_username` | none | SMTP username |
| `smtp_password` | none | SMTP password |
| `smtp_tls` | `true` | Use TLS |
| `from_address` | none | Sender address |
| `from_name` | `"Rivetr"` | Sender display name |

Email is considered configured only when `enabled` is true and both `smtp_host` and `from_address` are set. Invitations, password resets and notification channels use it.

## `[auto_update]`

| Field | Default | Description |
|---|---|---|
| `enabled` | `true` | Check for new releases |
| `auto_apply` | `false` | Download and install automatically |
| `check_interval_hours` | `6` | Hours between checks |
| `github_repo` | `"KwaminaWhyte/rivetr"` | Repository to check |
| `include_prereleases` | `false` | Include prerelease versions |

The check calls the GitHub Releases API only. Rivetr has no telemetry. Disable it for an air-gapped install and update manually.

## `[ai]`

| Field | Default | Description |
|---|---|---|
| `provider` | `"claude"` when unset | `claude`, `openai`, `gemini` or `moonshot` |
| `api_key` | none | Provider API key; stored in the config file, so protect its permissions |
| `model` | provider default | Model override |
| `max_tokens` | `2048` | Maximum output tokens |

## Full reference

The exhaustive field list, including every type and default, is maintained in the repository at `docs/reference/configuration.md`. `rivetr.example.toml` is a copyable starter with comments. Run `rivetr --config rivetr.toml config check` to validate a file and print a summary with warnings.
