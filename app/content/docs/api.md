# REST API

Rivetr 1.0.0 exposes a JSON REST API built with Axum. Resource routes sit under `/api` on the API port, which defaults to `8080`; `/health`, `/metrics`, and `/mcp` sit at the root. The dashboard and CLI call this API, and MCP uses the same token model on its own endpoint.

The 1.0 release changed dashboard URLs (`/settings`, `/account`, `/team`, `/integrations`, `/keys`, `/monitoring`), but not API paths. Old dashboard URLs redirect; API clients keep the same routes.

## Base URL and content type

| Item | Value |
|------|-------|
| Direct API base | `http://your-server:8080/api` |
| Behind the proxy | `https://rivetr.example.com/api` |
| Content type | `application/json`; `multipart/form-data` for uploads |
| Version prefix | None. Routes are under `/api`, not `/api/v1`. |

Archive uploads (`/api/apps/{id}/deploy/upload`, `/api/projects/{id}/apps/upload`, `/api/build/detect`) accept up to 100 MB.

## Authentication

| Credential | Header | Notes |
|------------|--------|-------|
| Dashboard session | `Authorization: Bearer <session token>` | `POST /api/auth/login` returns `token`. Sessions expire. |
| Admin token | `Authorization: Bearer <admin_token>` | The `[auth] admin_token` value in `rivetr.toml`. Full access. |
| Personal API token | `Authorization: Bearer rvt_...` | Created in **Keys > API Tokens** or with `POST /api/tokens`. Stored as a SHA-256 hash. |

`X-API-Key: <token>` works in place of `Authorization`. SSE and WebSocket clients that cannot set headers can use `?token=<token>`. Admin tokens and API tokens are subject to the API access policy; dashboard sessions are not.

### API token scopes

| Scope | Allows |
|-------|--------|
| `read` | GET requests that do not reveal secrets. |
| `deploy` | Deploy, start, stop, restart, roll back, cancel, approve or reject a deployment, run a job, bulk and tag deploys. |
| `write` | Create and change resources (POST/PUT/PATCH), container terminals. |
| `delete` | DELETE requests. |
| `secrets` | Reveal secret values: `?reveal=true`, resolved and linked env vars, generated service vars, container file reads, backup downloads, project and DB exports. |
| `admin` | Instance and team administration, host access (server files and terminal, reboot, patching, Docker install and cleanup). Implies every other scope. |

Scopes do not imply each other except `admin`. A CI token usually needs `read,deploy`. A token never exceeds its owner's account and team permissions; the role check runs after the scope check. A missing scope returns `403` with `{"error":{"code":"insufficient_scope", ...}}`.

Optional restrictions narrow a token: `team_id` limits it to one team, and `resources` limits it to listed projects, apps, databases, or services. Restricted tokens cannot call admin routes or use MCP. Tokens support `expires_at`, pause and resume, and roll with a grace period. A paused token gets `401`. Omitting `scopes` on creation grants every scope.

### API access policy

Admins can turn token authentication on or off and allow only listed source addresses under **Settings > Advanced**. The settings are `api_access_enabled` and `api_allowed_ips` (IPs or CIDRs; an empty list allows every source). The policy applies to the admin token and API tokens, not dashboard sessions, so an admin cannot lock themselves out of the dashboard.

```json
{"error":{"code":"api_access_denied","message":"API access is not allowed from this IP address"}}
```

## Rate limits

Defaults, configurable under `[rate_limit]` in `rivetr.toml`:

| Tier | Default | Applies to |
|------|---------|------------|
| API | 100 requests/min | Protected `/api` routes and auth-info reads |
| Webhook | 500 requests/min | `/webhooks/*` |
| Auth | 20 requests/min | Login, register, 2FA, OAuth flows |

Responses carry `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset`. Exceeding a limit returns `429` with `Retry-After`. Login and 2FA validation also lock an account after 5 failures in 15 minutes, with exponential backoff up to 15 minutes.

## Pagination and errors

Most collection routes return a JSON array of every visible row: `/api/apps`, `/api/databases`, `/api/services`, `/api/projects`, and similar. Three log routes paginate with `page` (1-indexed) and `per_page`: `/api/audit` (default 50, max 100), `/api/webhook-events` (default 50, max 200), and `/api/proxy/logs` (default 100, max 1000). Paginated responses use `{"items": [], "total": 0, "page": 1, "per_page": 50, "total_pages": 0}`; proxy logs also include `total_capped`.

Errors use one envelope, with optional field-level `details`:

```json
{
  "error": {
    "code": "validation_error",
    "message": "Validation failed for 1 field",
    "details": {"name": ["Name cannot be empty"]}
  }
}
```

Common codes: `bad_request`, `unauthorized`, `forbidden`, `not_found`, `conflict`, `validation_error`, `too_many_requests`, `two_factor_required`, `internal_error`, `service_unavailable`, `insufficient_scope`, `api_access_denied`.

## Streaming

App logs stream over SSE at `GET /api/apps/{id}/logs/stream` with `Accept: text/event-stream`. Events are `connected`, `log`, `end`, and `error`; a `keep-alive` comment is sent while idle. WebSocket routes authenticate with `?token=`:

| Route | Purpose |
|-------|---------|
| `/api/deployments/{id}/logs/stream` | Deployment logs |
| `/api/apps/{id}/terminal` | App container terminal |
| `/api/servers/{id}/terminal` | Remote server terminal |
| `/api/services/{id}/start-stream` | Service start logs |
| `/api/databases/{id}/start-stream` | Database start logs |
| `/api/services/{id}/containers/{container}/terminal` | Service container terminal |

## Endpoint catalog

### Core resources

| Area | Endpoints |
|------|-----------|
| Apps | `GET, POST /api/apps`; `GET, PUT, DELETE /api/apps/{id}`; `GET /api/apps/statuses`; `GET /api/apps/{id}/status`; `POST /api/apps/{id}/start`, `/stop`, `/restart`; `GET /api/apps/{id}/stats`; `GET, POST /api/apps/{id}/snapshots`; `GET, PUT /api/apps/{id}/placement` |
| Deployments | `POST /api/apps/{id}/deploy`; `POST /api/apps/{id}/deploy/upload`; `GET /api/apps/{id}/deployments` (and `/pending`); `GET /api/deployments/{id}` (and `/logs`, `/diff`); `POST /api/deployments/{id}/rollback`; `POST /api/deployments/{id}/approve`, `/reject`; `POST /api/apps/{app_id}/deployments/{id}/cancel`; `GET, POST /api/apps/{id}/freeze-windows` |
| Databases | `GET, POST /api/databases`; `GET, PUT, DELETE /api/databases/{id}`; `POST /api/databases/{id}/start`, `/stop`; `GET /api/databases/{id}/logs`, `/stats`; `GET, POST /api/databases/{id}/extensions`; `POST /api/databases/{id}/import` |
| Services | `GET, POST /api/services`; `GET, PUT, DELETE /api/services/{id}`; `POST /api/services/{id}/start`, `/stop`, `/restart`, `/deploy`; `GET /api/services/{id}/deployments` (rollback under `/{deployment_id}/rollback`); `GET /api/services/{id}/containers`; `GET, POST /api/services/{id}/env-vars`; `GET, PUT /api/services/{id}/deploy-config`; `GET /api/templates` (deploy with `POST /api/templates/{id}/deploy`) |

### Platform resources

| Area | Endpoints |
|------|-----------|
| Servers | `GET, POST /api/servers`; `GET, PUT, DELETE /api/servers/{id}`; `POST /api/servers/{id}/check`, `/install-docker`; `GET, PUT /api/servers/{id}/files/content`; `GET, POST /api/servers/{id}/apps`; `GET, POST /api/build-servers` |
| Projects | `GET, POST /api/projects`; `GET, PUT, DELETE /api/projects/{id}`; `GET, POST /api/projects/{id}/environments` (clone under `/{env_id}/clone`); `GET /api/projects/{id}/export`; `POST /api/projects/{id}/import` |
| Environment variables | `GET, POST /api/apps/{id}/env-vars`; `GET /api/apps/{id}/env-vars/resolved`; `GET, PUT, DELETE /api/apps/{id}/env-vars/{key}`; `GET, POST /api/projects/{id}/env-vars`; same pattern under `/api/environments/{id}` and `/api/teams/{id}` |
| Domains | `GET, POST /api/routes`; `GET, DELETE /api/routes/{domain}`; `GET /api/routes/domains`; `GET /api/apps/{id}/certificates`; `PUT /api/apps/{id}/certificates/{domain}`; `POST /api/apps/{id}/certificates/{domain}/custom`; `GET, POST /api/dns-providers`; `GET, PUT /api/certificates/wildcard` (same certificate routes under `/api/services/{id}`) |

### Operations

| Area | Endpoints |
|------|-----------|
| Backups | `GET, POST /api/databases/{id}/backups`; `GET, DELETE /api/databases/{id}/backups/{backup_id}` (download under `/download`); `GET, POST, DELETE /api/databases/{id}/backups/schedule`; `GET, POST /api/volumes/{id}/backups` (restore under `/{backup_id}/restore`); `POST /api/system/backup`, `/api/system/backup/full`; `POST /api/system/restore`; `GET, POST /api/backups/schedules`; `GET, POST /api/s3/configs` |
| Teams | `GET, POST /api/teams`; `GET, PUT, DELETE /api/teams/{id}`; `GET, POST /api/teams/{id}/members`; `GET, PUT /api/teams/{id}/members/{user_id}/permissions`; `GET, POST /api/teams/{id}/roles`; `GET, POST /api/teams/{id}/invitations`; `PUT /api/teams/{id}/2fa-enforcement` |
| Tokens | `GET, POST /api/tokens`; `PATCH, DELETE /api/tokens/{id}`; `POST /api/tokens/{id}/pause`, `/resume`, `/roll` |
| System | `GET /health`; `GET /metrics`; `GET /api/system/health`; `GET /api/system/stats`; `POST /api/system/update/check`, `/download`, `/apply`; `GET /api/audit`, `/api/webhook-events`, `/api/proxy/logs`; `POST /api/system/log-cleanup`, `/docker-cleanup`; `GET, PUT /api/settings/advanced` |

## Examples

Create a scoped token. The secret is returned once as `token`:

```bash
curl -X POST https://rivetr.example.com/api/tokens \
  -H "Authorization: Bearer $RIVETR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"ci-deploy","scopes":["read","deploy"],"expires_at":"2027-01-01T00:00:00Z"}'
```

List apps, deploy, and stream logs:

```bash
curl -H "Authorization: Bearer $RIVETR_TOKEN" \
  https://rivetr.example.com/api/apps

curl -X POST -H "Authorization: Bearer $RIVETR_TOKEN" \
  https://rivetr.example.com/api/apps/$APP_ID/deploy

curl -N -H "Accept: text/event-stream" \
  "https://rivetr.example.com/api/apps/$APP_ID/logs/stream?token=$RIVETR_TOKEN"
```

Open a container terminal over WebSocket:

```bash
websocat "wss://rivetr.example.com/api/apps/$APP_ID/terminal?token=$RIVETR_TOKEN"
```

## Related pages

- [CLI](/docs/cli) for `status`, `apps`, `deploy`, and `logs` against the same API.
- [MCP Server](/docs/mcp-server) for the 11 tools exposed at `POST /mcp`.
