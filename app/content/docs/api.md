# REST API

Rivetr's REST API is built with [Axum](https://github.com/tokio-rs/axum). All endpoints are versioned under `/api`.

## Authentication

Most endpoints require a **Bearer token** in the `Authorization` header:

```
Authorization: Bearer rvt_your_token_here
```

Tokens are prefixed `rvt_` and stored as SHA-256 hashes. There are two types:

- **Admin token** — The `admin_token` in `rivetr.toml`. Full access.
- **Named API tokens** — Created via `POST /api/tokens`. Can be scoped for CI/CD.

Create a named token from the dashboard under **Settings → API Tokens**, or via the API:

```bash
curl -X POST \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "github-actions", "description": "CI deploy token"}' \
  https://your-instance/api/tokens
```

---

## Rate limiting

| Tier | Limit | Applies to |
|------|-------|------------|
| Auth | 20 req/min | Login, register, 2FA, OAuth |
| API | 100 req/min | All protected `/api` endpoints |
| Webhook | 500 req/min | `/webhooks/*` |

---

## Public endpoints

These endpoints do not require a token:

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Liveness check — returns `OK`. |
| `GET` | `/metrics` | Prometheus metrics. |
| `POST` | `/mcp` | MCP server handler (AI assistant integration). |
| `POST` | `/api/auth/login` | Log in. |
| `POST` | `/api/auth/setup` | First-run admin setup. |

---

## Apps

```bash
# List all apps
GET /api/apps

# Create an app
POST /api/apps

# Get an app
GET /api/apps/:id

# Trigger a deploy
POST /api/apps/:id/deploy

# Start / stop / restart
POST /api/apps/:id/start
POST /api/apps/:id/stop
POST /api/apps/:id/restart

# Stream logs (SSE)
GET /api/apps/:id/logs/stream

# App resource stats
GET /api/apps/:id/stats
```

### Example: trigger a deploy

```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"ref": "main"}' \
  https://your-instance/api/apps/my-app-id/deploy
```

---

## Deployments

```bash
# List deployments for an app
GET /api/apps/:id/deployments

# Get a deployment
GET /api/deployments/:id

# Get deployment logs
GET /api/deployments/:id/logs

# Rollback to a deployment
POST /api/deployments/:id/rollback

# Cancel a running deployment
POST /api/apps/:app_id/deployments/:id/cancel

# Approve / reject a pending deployment
POST /api/deployments/:id/approve
POST /api/deployments/:id/reject
```

---

## Databases

```bash
# List databases
GET /api/databases

# Create a database
POST /api/databases

# Start / stop
POST /api/databases/:id/start
POST /api/databases/:id/stop

# List backups
GET /api/databases/:id/backups

# Create a backup
POST /api/databases/:id/backups
```

---

## Environment variables

```bash
# List env vars for an app
GET /api/apps/:id/env-vars

# Create an env var
POST /api/apps/:id/env-vars

# Resolved env vars (includes shared and linked vars)
GET /api/apps/:id/env-vars/resolved

# Update an env var
PUT /api/apps/:id/env-vars/:key

# Delete an env var
DELETE /api/apps/:id/env-vars/:key
```

---

## System

```bash
# System health
GET /api/system/health

# Current system stats
GET /api/system/stats

# Version info
GET /api/system/version

# Check for updates
POST /api/system/update/check

# Create a full backup
POST /api/system/backup/full
```

---

## WebSocket endpoints

WebSocket endpoints authenticate via a query parameter instead of the `Authorization` header:

| Path | Description |
|------|-------------|
| `/api/deployments/:id/logs/stream?token=<token>` | Stream deployment logs in real time. |
| `/api/apps/:id/terminal?token=<token>` | Browser terminal into a running container. |
| `/api/servers/:id/terminal?token=<token>` | Browser terminal into a remote server via SSH. |

---

## MCP server

Rivetr ships an MCP (Model Context Protocol) server at `POST /mcp`. This lets AI assistants — Claude, GitHub Copilot, and others — interact with your Rivetr instance using natural language.

The MCP server exposes tools for:

- Listing and inspecting apps
- Triggering and monitoring deployments
- Reading deployment logs
- Managing databases
- Diagnosing failed deployments with AI

### Connecting Claude Desktop

Add to your Claude Desktop `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "rivetr": {
      "url": "https://your-instance/mcp",
      "headers": {
        "Authorization": "Bearer rvt_your_token_here"
      }
    }
  }
}
```

### Connecting Claude Code (CLI)

```bash
claude mcp add rivetr \
  --transport http \
  --url https://your-instance/mcp \
  --header "Authorization: Bearer rvt_your_token"
```

---

## AI features

Rivetr provides AI-powered endpoints that require an `[ai]` provider configured in `rivetr.toml`:

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/apps/:app_id/deployments/:deployment_id/diagnose` | Diagnose a failed deployment. |
| `GET` | `/api/apps/:app_id/insights` | Deployment insights and patterns. |
| `GET` | `/api/apps/:app_id/cost-suggestions` | Cost-optimization suggestions. |
| `POST` | `/api/apps/:app_id/suggest-dockerfile` | Suggest a Dockerfile for the app. |
| `GET` | `/api/apps/:app_id/security-scan` | Scan an app for security issues. |
