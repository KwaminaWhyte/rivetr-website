# FAQ

Answers to common questions about Rivetr.

---

## General

### What is Rivetr?

Rivetr is a self-hosted PaaS that deploys applications from Git in a single binary. It handles the full lifecycle: clone → build → start → health check → atomic proxy switch, with zero external dependencies (no Redis, no PostgreSQL, no Traefik).

### Is Rivetr production-ready?

Yes. Rivetr includes the features expected of a production deployment platform: zero-downtime deploys, automatic rollback, TLS with auto-renewal, crash recovery, RBAC, audit logging, and S3 backups. It is MIT-licensed and actively maintained.

### What operating systems does Rivetr support?

Rivetr runs on Linux (x86_64 and aarch64) in production. macOS and Windows are supported for development (building from source and running the CLI/TUI against a remote instance).

---

## Resource Usage

### How much RAM does Rivetr use?

Rivetr uses approximately 30–80 MB of RAM at idle. This is significantly less than alternatives:

| | RAM idle |
|---|---|
| Rivetr | ~30–80 MB |
| Coolify | 400–800 MB |
| Dokploy | ~300 MB |

The low footprint comes from using an embedded SQLite database instead of PostgreSQL, and Rust's efficient async runtime instead of Node.js or a JVM.

### Does Rivetr need Docker?

Docker Engine 24+ (or Podman 4+) is required on the deployment server: Rivetr uses it to build and run application containers. The Rivetr binary itself does not need to run inside Docker.

---

## Docker vs Podman

### Can I use Podman instead of Docker?

Yes. Rivetr supports both Docker (via the Bollard crate for socket API calls) and Podman (via a CLI wrapper). Set `runtime_type` in `rivetr.toml`:

```toml
[runtime]
runtime_type = "podman"    # "docker", "podman", or "auto"
```

`auto` (the default) tries Docker first, then falls back to Podman.

### Why would I choose Podman over Docker?

Podman runs daemonless and rootless, which is useful in security-hardened environments. The trade-off is that some Bollard-based features (such as real-time event streaming) are not available in the Podman CLI wrapper mode.

---

## Comparison to Coolify and Dokploy

### How does Rivetr compare to Coolify?

| | Rivetr | Coolify |
|---|---|---|
| RAM idle | ~30–80 MB | 400–800 MB |
| External dependencies | None | PostgreSQL, Redis, Traefik |
| Single binary | Yes | No |
| Container runtimes | Docker + Podman | Docker |
| MCP server | Yes | No |
| Terminal UI (TUI) | Yes | No |
| Remote filesystem browser | Yes | No |
| License | MIT | Apache 2.0 |

### How does Rivetr compare to Dokploy?

| | Rivetr | Dokploy |
|---|---|---|
| RAM idle | ~30–80 MB | ~300 MB |
| External dependencies | None | PostgreSQL |
| Single binary | Yes | No |
| Container runtimes | Docker + Podman | Docker |
| Preview deployments | Yes | No |
| MCP server | Yes | No |
| Gitea support | Yes | No |
| License | MIT | MIT |

---

## Cost and Licensing

### What does Rivetr cost?

Rivetr is free and open-source under the MIT license. You pay only for the server(s) you run it on. There is no hosted SaaS version, no per-seat fee, and no feature gating.

### Can I use Rivetr commercially?

Yes. The MIT license permits commercial use, modification, and redistribution without restriction.

---

## Configuration

### Where is the config file?

The production install script writes `/opt/rivetr/rivetr.toml`. You can override the path with `--config`:

```bash
rivetr --config /etc/rivetr/rivetr.toml
```

### Do I need to set an encryption key?

It is strongly recommended for production. Without `auth.encryption_key`, environment variable values are stored in plaintext in the SQLite database. See the [Environment Variables](/docs/environment-variables) page.

---

## Migration

### Can I migrate from Coolify or Dokploy to Rivetr?

There is no automated migration tool. The typical steps are:

1. Install Rivetr on the same or a new server.
2. Recreate apps by connecting your Git repositories.
3. Copy environment variables from the old platform.
4. Update DNS records to point to Rivetr's proxy.
5. Provision managed databases via Rivetr's one-click templates.

Rivetr supports exporting and importing project configurations as JSON (`GET /api/projects/:id/export`) which can speed up recreating app settings.

### Can I back up Rivetr and restore it on a new server?

Yes. Use `rivetr backup` to create a `.tar.gz` archive of the database, config, and SSL certificates, then `rivetr restore` on the new server. See the [Backups](/docs/backups) page.

---

## Troubleshooting

### The install script failed: how do I check logs?

```bash
sudo journalctl -u rivetr -f
```

### Rivetr is running but the dashboard is blank.

Check that port 8080 is open in your firewall:

```bash
sudo ufw allow 8080/tcp
```

### My app deployed but I can't reach it.

1. Confirm the app's health check passed in the deployment logs.
2. Check that the domain or generated subdomain is correct in **App → Settings → Domains**.
3. Verify port 80/443 are open and the DNS A record points to the server.
4. Check the proxy route: `GET /api/routes/<domain>`.
