# MCP Server

Rivetr includes a built-in [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server that exposes infrastructure management tools to AI assistants such as Claude Desktop, Claude Code, and any other MCP-compatible client.

---

## What Is MCP?

MCP is an open protocol that lets AI assistants call tools on external systems using a structured JSON API. Rivetr's MCP server exposes deployment and monitoring operations as callable tools, so an AI assistant can list your apps, check deployment status, trigger a deploy, or fetch logs — directly from a conversation.

---

## The `/mcp` Endpoint

The MCP server is a single HTTP endpoint:

```
POST /mcp
```

It is public (no `Authorization` header required at the transport level). Access control is enforced at the Rivetr database level — the MCP handler queries the same SQLite database as the REST API and only returns data that exists.

> **Security note:** Expose `/mcp` only to trusted clients. If your Rivetr API port (8080) is publicly accessible, consider restricting `/mcp` at the firewall or reverse-proxy level.

---

## Protocol

All requests are JSON `POST` bodies with a `method` field and an optional `params` object.

### Discover available tools — `tools/list`

```bash
curl -X POST https://your-server:8080/mcp \
  -H "Content-Type: application/json" \
  -d '{"method": "tools/list"}'
```

Response:

```json
{
  "result": {
    "tools": [
      {
        "name": "list_apps",
        "description": "List all deployed applications",
        "input_schema": { ... }
      },
      ...
    ]
  },
  "error": null
}
```

### Call a tool — `tools/call`

```bash
curl -X POST https://your-server:8080/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "method": "tools/call",
    "params": {
      "name": "list_apps",
      "input": {}
    }
  }'
```

---

## Available Tools

| Tool | Description | Required input |
|------|-------------|----------------|
| `list_apps` | List all deployed applications (up to 50) | `project_id` (optional filter) |
| `get_app_status` | Get the current status of an application | `app_id` |
| `deploy_app` | Trigger a deployment for an application | `app_id` |
| `get_deployment_logs` | Get logs for a specific deployment (up to 500 lines) | `deployment_id` |

### `list_apps`

```json
{
  "method": "tools/call",
  "params": {
    "name": "list_apps",
    "input": {
      "project_id": "optional-project-id"
    }
  }
}
```

### `get_app_status`

```json
{
  "method": "tools/call",
  "params": {
    "name": "get_app_status",
    "input": {
      "app_id": "app-uuid-here"
    }
  }
}
```

### `deploy_app`

Queues a new deployment for the given app. Returns a `deployment_id` you can use to poll logs.

```json
{
  "method": "tools/call",
  "params": {
    "name": "deploy_app",
    "input": {
      "app_id": "app-uuid-here"
    }
  }
}
```

Response:

```json
{
  "result": {
    "deployment_id": "uuid",
    "status": "queued"
  }
}
```

### `get_deployment_logs`

```json
{
  "method": "tools/call",
  "params": {
    "name": "get_deployment_logs",
    "input": {
      "deployment_id": "deployment-uuid-here"
    }
  }
}
```

---

## Connecting Claude Desktop

Add Rivetr as an MCP server in your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "rivetr": {
      "url": "https://your-server:8080/mcp"
    }
  }
}
```

Restart Claude Desktop. You can now ask Claude things like:

- "List my Rivetr apps"
- "Deploy the `my-api` app"
- "Show me the logs for the last deployment of `my-api`"

---

## Connecting Claude Code

In a project where you work with Rivetr, add to `.claude/settings.json`:

```json
{
  "mcpServers": {
    "rivetr": {
      "url": "https://your-server:8080/mcp"
    }
  }
}
```

Or use the CLI:

```bash
claude mcp add rivetr https://your-server:8080/mcp
```

---

## Error Handling

If a tool call fails (e.g. app not found), the response has a non-null `error` field:

```json
{
  "result": null,
  "error": "App not found: bad-id"
}
```

Unknown methods or tool names also return a descriptive error in the `error` field.
