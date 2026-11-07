# Introduction

Rivetr is a self-hosted platform as a service (PaaS) that deploys applications from Git. Version 1.0.0 ships as a single Rust binary: API, dashboard, deployment engine, reverse proxy and database all run in one process. The only external dependency is Docker or Podman on the host.

Measured on Rivetr 1.0.0, Ubuntu 24.04 x86_64: the process uses 52 MB RSS (8 threads) while managing 30 containers. The release binary is 47 MB.

## What it replaces

Many self-hosted PaaS tools need a control plane before they can deploy anything. A typical install runs PostgreSQL for state, Redis for queues and a separate reverse proxy for TLS. Rivetr replaces all three:

- State lives in an embedded SQLite database in WAL mode, one file at `<data_dir>/rivetr.db`.
- Deploy jobs move over an in-process Tokio channel, with no Redis and no worker service.
- An embedded Hyper and rustls proxy terminates TLS, obtains certificates and routes traffic to containers.
- The React dashboard is compiled into the binary with `rust-embed` and served from the same port.

There is no separate database, cache, message broker or proxy to install, upgrade or monitor.

## How a deployment works

Every deploy follows the same pipeline, whether it starts from a Git push, the dashboard, the API or a Docker Hub event:

1. Freeze windows are checked. A blocked deploy is recorded with status `skipped`.
2. The deployment is queued. Concurrency is capped by `[runtime] max_concurrent_deployments`.
3. The source is cloned with the Git CLI. Shallow clones are on by default; submodules and Git LFS are opt-in per app.
4. The selected build type produces a container image.
5. The new container starts on a private port.
6. Health checks run over HTTP or a command, with expected status code and body, interval, timeout, retries and start period.
7. The proxy route table is swapped atomically. In-flight requests on the old container are allowed to finish (drain, 30 seconds by default) before it is removed.
8. If the health check fails, Rivetr rolls back automatically to the previous deployment.

Because the route table sits behind `ArcSwap`, the proxy picks up a new backend without a restart and without dropping connections.

## What is in 1.0

### Deployments

- Git deployments from GitHub, GitLab, Gitea and Bitbucket, with webhook signature verification.
- Build types: Dockerfile, Nixpacks, Railpack, Cloud Native Buildpacks (Paketo or Heroku builders), static sites and prebuilt Docker images.
- Docker and Podman runtimes, detected at startup or set with `[runtime] runtime_type`.
- Zero-downtime switching, health checks and automatic rollback.
- Preview deployments for pull requests, deploy by commit SHA or tag, and scheduled deployments.
- Container replicas (1 to 10) behind round-robin load balancing.
- ZIP upload as a deployment source, deploy cancellation and resource cloning.

### Platform services

- Nine managed database engines: PostgreSQL, MySQL, MariaDB, MongoDB, Redis, DragonflyDB, KeyDB, ClickHouse and LibSQL.
- Docker Compose deployments, including an optional raw mode that skips Rivetr network injection.
- Service deployments with recorded history, build from Git or a server path, pre and post-deploy hooks, rollback by image digest and per-container logs and terminals.
- 365 service templates across 26 categories.
- Scheduled commands and scheduled container restarts.

### Security and access

- Per-domain Let's Encrypt certificates selected by SNI, wildcard certificates through DNS-01, and custom certificate upload.
- OAuth login through GitHub, Google, GitLab, Microsoft and Bitbucket, OIDC SSO, TOTP 2FA and passkeys.
- AES-256-GCM encryption for secrets and SSH keys at rest.
- Teams with role presets built from 24 fine-grained abilities, custom roles, per-resource overrides and an audit log.
- API tokens prefixed `rvt_`, stored as SHA-256 hashes, with scopes, project restriction, expiry and a grace-period roll.
- External secret managers at deploy time: HashiCorp Vault/OpenBao, Infisical, Doppler and AWS Secrets Manager.

### Operations

- Real-time logs over WebSocket and SSE, deployment log search and per-app retention.
- Uptime and response-time tracking from health check latency.
- Container crash recovery with exponential backoff.
- Traffic analytics, a Prometheus `/metrics` endpoint and a webhook event log.
- Managed database backups, volume backups and full instance backups, local or to S3-compatible storage.
- Multi-server deployments over SSH, build servers, registry push and Docker Swarm management.
- A terminal UI (`rivetr tui`, built with `--features tui`) and CLI subcommands that talk to any running instance.

## Rivetr compared

| | Rivetr | Coolify | Dokploy |
|---|---|---|---|
| **Control plane memory** | 52 MB RSS, measured with 30 containers | No published figure; docs ask for 2 GB RAM | No published figure; docs ask for 2 GB RAM |
| **Services it runs** | None besides the binary | PostgreSQL, Redis, Traefik or Caddy | PostgreSQL, Traefik (on Docker Swarm) |
| **Single binary** | Yes | No | No |
| **Container runtimes** | Docker, Podman | Docker | Docker |
| **Git providers** | GitHub, GitLab, Gitea, Bitbucket, any Git URL | GitHub, GitLab, Gitea, Bitbucket, any Git URL | GitHub, GitLab, Gitea, Bitbucket, any Git URL |
| **Preview deployments** | Yes (all four providers) | Yes (all four providers) | Yes (GitHub only) |
| **MCP server** | Built in | Built in | Separate package (`@dokploy/mcp`) |
| **Web terminal (container and server)** | Yes | Yes (v4.0+) | Yes |
| **Terminal UI (TUI) and CLI** | TUI (`rivetr tui`) and CLI subcommands | CLI (`coolify`, no TUI) | CLI (`dokploy`, no TUI) |
| **File browser** | Containers and remote servers | Containers (beta) | No |
| **License** | MIT | Apache 2.0 | Apache 2.0, with source-available `/proprietary` features |

Competitor details checked against their docs and releases on 2026-11-07 (Coolify v4.6.0, Dokploy v0.31.0).

## Next steps

- [Features](/features) lists every capability in 1.0.
- [Quick start](/docs/quick-start) installs Rivetr and deploys a first app.
- [Installation](/docs/installation) covers requirements, the installer and manual setup.
- [Deployments](/docs/deployments) explains the pipeline, previews, approvals and rollback.
- [Build types](/docs/build-types) covers Dockerfile, Nixpacks, Railpack, buildpacks, static sites and prebuilt images.
- [Webhooks](/docs/webhooks) lists endpoints, signature verification and event handling.
