# MCP Server

Rivetr has a built-in MCP server for AI assistants. It exposes 11 tools over HTTP at `POST /mcp`, so an assistant can list resources, inspect deployments, read logs, trigger a deploy, or restart an app. The server is part of the same binary as the API and dashboard.

## Enable and disable

The MCP server is controlled by the `mcp_enabled` instance setting under **Settings > Advanced**. Fresh installs start with it off. Installations upgraded from a pre-1.0 release keep it on.

Enable it from the dashboard, or with the settings API as an admin:

```bash
curl -X PUT https://rivetr.example.com/api/settings/advanced \
  -H "Authorization: Bearer $RIVETR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"mcp_enabled": true}'
```

While it is off, `POST /mcp` returns `404`:

```json
{"error":{"code":"mcp_disabled","message":"The MCP server is disabled. An admin can turn it on in Settings > Advanced."}}
```

## Endpoint and authentication

```text
POST https://rivetr.example.com/mcp
Authorization: Bearer rvt_...
Content-Type: application/json
```

Authentication is required. Send a personal API token (`rvt_...`), the admin token from `rivetr.toml`, or a dashboard session token as `Authorization: Bearer`. `X-API-Key` is also accepted. The API access policy (on/off and IP allowlist) applies to the MCP endpoint.

A personal API token needs these scopes:

| Tools | Scope |
|-------|-------|
| `list_apps`, `get_app_status`, `get_deployment_logs`, `list_deployments`, `get_deployment_status`, `list_services`, `list_databases`, `list_tags`, `list_projects` | `read` |
| `deploy_app`, `restart_app` | `deploy` |

`admin` implies every scope. `tools/list` only returns the tools the caller's token may use. A call to a tool without the needed scope returns an error for that tool. Tokens restricted to a team or to specific resources cannot use MCP at all.

## Protocol

Requests are JSON `POST` bodies with a `method` and optional `params`.

Discover tools:

```bash
curl -s -X POST https://rivetr.example.com/mcp \
  -H "Authorization: Bearer $RIVETR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"method":"tools/list"}'
```

The response lists each tool with `name`, `description`, and `input_schema`:

```json
{
  "result": {
    "tools": [
      {
        "name": "list_apps",
        "description": "List all deployed applications with their tags",
        "input_schema": {"type": "object", "properties": {}}
      }
    ]
  },
  "error": null
}
```

Call a tool:

```json
{
  "method": "tools/call",
  "params": {
    "name": "list_apps",
    "input": {"project_id": "project-uuid"}
  }
}
```

`result` holds the tool output. On failure, `result` is `null` and `error` is a message. Unknown methods and tool names return an error in the same envelope.

## Tools

| Tool | Purpose | Input | Scope |
|------|---------|-------|-------|
| `list_apps` | List apps with their tags, up to 50. | `project_id`, `tag` (optional filters) | `read` |
| `deploy_app` | Queue a deployment for an app. | `app_id` (required) | `deploy` |
| `get_app_status` | Get an app record. | `app_id` (required) | `read` |
| `get_deployment_logs` | Get the last 500 log entries for a deployment. | `deployment_id` (required) | `read` |
| `list_deployments` | List recent deployments, newest first. | `app_id` (optional), `limit` (default 20, max 100) | `read` |
| `get_deployment_status` | Get a deployment record. | `deployment_id` (required) | `read` |
| `list_services` | List Docker Compose and template services with tags, up to 100. | `project_id`, `tag` (optional filters) | `read` |
| `list_databases` | List managed databases with tags, up to 100. Credentials are masked. | `project_id`, `tag` (optional filters) | `read` |
| `list_tags` | List tags with the number of resources carrying each. | none | `read` |
| `list_projects` | List projects, up to 100. | none | `read` |
| `restart_app` | Queue a fresh deployment of the app's current config. | `app_id` (required) | `deploy` |

`deploy_app` and `restart_app` both enqueue a deployment and return immediately:

```json
{"result":{"deployment_id":"uuid","status":"queued"},"error":null}
```

Poll `get_deployment_status` or `get_deployment_logs` to follow the result. Deployments are subject to the same queue, health checks, freeze windows, and rollback behavior as a dashboard deploy.

## Example session

```bash
# List the tools this token can call
curl -s -X POST https://rivetr.example.com/mcp \
  -H "Authorization: Bearer $RIVETR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"method":"tools/list"}'

# Find an app
curl -s -X POST https://rivetr.example.com/mcp \
  -H "Authorization: Bearer $RIVETR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"method":"tools/call","params":{"name":"list_apps","input":{}}}'

# Deploy it
curl -s -X POST https://rivetr.example.com/mcp \
  -H "Authorization: Bearer $RIVETR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"method":"tools/call","params":{"name":"deploy_app","input":{"app_id":"APP_UUID"}}}'

# Follow the deployment
curl -s -X POST https://rivetr.example.com/mcp \
  -H "Authorization: Bearer $RIVETR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"method":"tools/call","params":{"name":"get_deployment_status","input":{"deployment_id":"DEPLOYMENT_UUID"}}}'
```

## Client configuration

A generic remote MCP client entry looks like this. Field names vary by client; the endpoint needs the URL and an `Authorization` header.

```json
{
  "mcpServers": {
    "rivetr": {
      "url": "https://rivetr.example.com/mcp",
      "headers": {
        "Authorization": "Bearer rvt_your_token_here"
      }
    }
  }
}
```

The endpoint reads `method` and `params` from the JSON body. A `jsonrpc` field and an `id` are ignored, and responses use the `{result, error}` envelope above rather than JSON-RPC framing. If your client only launches stdio servers, use its HTTP bridge and point it at `/mcp`; the request body must reach Rivetr unchanged.

## Security notes

- MCP is a control plane. A credential that can use it can list every app, service, database, project, and tag in the instance, and with `deploy` can deploy or restart any app. Tool results are not team-scoped. Treat MCP access as instance-level access.
- Use a dedicated token with the minimum scopes. A read-only assistant needs `read`; add `deploy` only when it should deploy. Team- and resource-restricted tokens cannot use MCP.
- Keep port `8080` on a private network or behind a VPN. If the API is reachable from the internet, terminate TLS at the proxy and restrict `/mcp` at the firewall or proxy.
- Turn the MCP server off when it is not in use. The toggle takes effect immediately.
- The token secret is shown once at creation. Rolling a token invalidates the old secret after the grace period.
- Rivetr sends no telemetry. The only update-related outbound call is the optional release check against GitHub.

## Related pages

- [REST API](/docs/api) for the same operations over typed HTTP routes.
- [API tokens](/docs/api) for scopes, restrictions, expiry, and rolling.
- [Teams and RBAC](/docs/teams-and-rbac) for team roles and resource overrides.
