# Introduction

Rivetr is a self-hosted Platform as a Service (PaaS) that deploys your applications from Git with a single binary. It has no external service dependencies (no Redis, no PostgreSQL, no Traefik) and idles at roughly **30–80 MB of RAM**.

Everything runs in one process: an embedded reverse proxy with automatic HTTPS, a React dashboard, a full REST API, and a SQLite database. You drop a single binary on a Linux server and you have a complete deployment platform.

## Why Rivetr?

Most self-hosted PaaS tools require a stack of services just to get started. Coolify needs PostgreSQL, Redis, and Traefik before you can deploy your first app. Rivetr has no such requirements.

| | Rivetr | Coolify | Dokploy |
|---|---|---|---|
| **RAM idle** | ~30–80 MB | 400–800 MB | ~300 MB |
| **External dependencies** | None | PostgreSQL, Redis, Traefik | PostgreSQL |
| **Single binary** | Yes | No | No |
| **Container runtimes** | Docker + Podman | Docker | Docker |
| **Git providers** | GitHub, GitLab, Gitea, Bitbucket | GitHub, GitLab, Gitea, Bitbucket | GitHub, GitLab, Bitbucket |
| **Preview deployments** | Yes | Yes | No |
| **MCP server** | Yes | No | No |
| **Terminal UI (TUI)** | Yes | No | No |
| **License** | MIT | Apache 2.0 | MIT |

## What Rivetr does

**Deployments from Git**: Connect a repository, push a commit, and Rivetr clones the code, builds an image, starts a container, runs health checks, and atomically switches the proxy, all without downtime. If the health check fails, it rolls back automatically.

**Multiple build types**: Rivetr supports Dockerfile, Nixpacks, Railpack, Heroku/Paketo buildpacks, and static sites. It detects the right builder automatically or you can pin it in `deploy.toml`.

**Managed databases**: Provision PostgreSQL, MySQL, MongoDB, Redis, DragonFlyDB, KeyDB, ClickHouse, and LibSQL with one click. Rivetr manages the container lifecycle and optionally backs databases up to S3.

**Service templates**: Over 335 pre-configured one-click services across categories like AI/ML, Analytics, CMS, Automation, and more.

**Preview environments**: For every pull request, Rivetr creates a separate deployment on a unique subdomain. When the PR closes or merges, the preview is cleaned up automatically.

**Team collaboration**: Multi-tenant with RBAC (owner / admin / developer / viewer), team invitations, audit logging, and per-team 2FA enforcement.

**Real-time logs and monitoring**: Stream logs via WebSocket or SSE, search full-text across log history, track uptime, and export Prometheus metrics.

**AI integration**: Rivetr ships an MCP server that lets AI assistants (Claude, GitHub Copilot, etc.) manage your deployments. It also provides AI-powered deployment diagnosis and Dockerfile suggestions.

**Terminal UI**: `rivetr tui` launches a keyboard-driven terminal dashboard that connects to any running Rivetr instance without opening a browser.

## How deployments work

```
Git push / webhook
       │
       ▼
   Validate → Clone → Build → Start container → Health check → Atomic proxy switch
                                                      │
                                              fail → Rollback
```

The pipeline runs in a Tokio async runtime. State is persisted to SQLite so deployments survive restarts. The embedded reverse proxy uses ArcSwap for lock-free route updates: traffic switches to the new container without restarting the proxy.

## Open source

Rivetr is MIT-licensed. Source: [github.com/KwaminaWhyte/rivetr](https://github.com/KwaminaWhyte/rivetr).
