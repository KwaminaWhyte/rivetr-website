# Troubleshooting

Start with the service and its logs, then narrow to the layer that failed: install, startup, proxy or certificate, deploy, webhook, database, or remote server.

```bash
sudo systemctl status rivetr
sudo journalctl -u rivetr -n 200 --no-pager
curl -s http://localhost:8080/health
curl -s http://localhost:8080/api/system/health
```

Useful checks:

```bash
# Validate the config and print a summary with warnings
rivetr --config /opt/rivetr/rivetr.toml config check

# Query a running instance through its API
rivetr --api-url http://localhost:8080 --token "$RIVETR_TOKEN" status
```

## Install script failures

The installer must run as root on x86_64 or aarch64, on Ubuntu, Debian, Fedora, CentOS, RHEL, Rocky or AlmaLinux. It fails immediately if Docker cannot be installed or if Nixpacks cannot be installed. Railpack and Pack CLI failures are warnings. If the release binary cannot be downloaded, the script falls back to building from source, which needs Rust and Node.

Re-running the installer is safe and preserves `/opt/rivetr/rivetr.toml` and `/var/lib/rivetr`. To install a specific release:

```bash
curl -fsSL https://raw.githubusercontent.com/KwaminaWhyte/rivetr/main/install.sh \
  | sudo RIVETR_VERSION=v1.0.0 bash
```

If the script stops, read its last lines for the failing package or download. Check that ports 80, 443 and 8080 are free before retrying.

## Service will not start

- Validate the file: `rivetr --config /opt/rivetr/rivetr.toml config check`.
- Check ports: `sudo ss -tlnp | grep -E ':(80|443|8080)'`. Change `api_port`, `proxy_port` or `proxy_https_port` if another process owns them.
- Check Docker: `sudo systemctl status docker` and `sudo docker info`. Rivetr cannot start its runtime without it.
- Check permissions: the `rivetr` user must read the config, write `data_dir`, and read `.encryption_key` and `.encryption_salt`.
- If the log says the salt file is missing while the database contains `ENC2:` values, restore the original `.encryption_salt`. Rivetr refuses to generate a new salt because that would orphan every encrypted value.
- If binding port 80 fails with permission denied, grant the capability and restart:

```bash
sudo setcap 'cap_net_bind_service=+ep' /opt/rivetr/rivetr
sudo systemctl restart rivetr
```

Re-apply `setcap` after replacing the binary. To see a startup error immediately, stop the service and run the binary in the foreground as the service user.

## Dashboard is blank or login loops

- Confirm `/health` and `/api/system/health` respond. If the API is down, fix the service first.
- After an upgrade, hard-refresh the browser. The embedded dashboard uses hashed asset names, and an old tab can request files that no longer exist.
- Open the browser console and network tab. CSP violations and failed API calls are shown there. The dashboard CSP allows scripts only from the origin and hashes of its inline bootstrap scripts.
- Behind a reverse proxy, forward the original `Host` header and set `X-Forwarded-Proto: https`. Do not rewrite HTML or response bodies.
- WebSockets must be allowed for logs and the terminal. Ensure the proxy upgrades connections for the dashboard path.
- A login loop after OAuth or SSO often means the browser cannot return the state cookie. Check cookie settings, clock skew, and that the callback URL matches the provider configuration.
- Set `instance_domain` when the dashboard is served through the embedded proxy, and add the outer proxy to `trusted_proxies` when one is used.

## App is unreachable

- Check the deployment status first. A failed health check can leave the previous version serving while the new one is discarded.
- Confirm the container is running: `sudo docker ps -a | grep rivetr`.
- The app must listen on `0.0.0.0` inside the container, not `127.0.0.1`, and on the port Rivetr detects or you configured. A process bound only to loopback is unreachable from the proxy.
- Confirm the domain is attached to the app and its DNS record points at the Rivetr host.
- Apps are reachable through the proxy. Direct container ports are not published unless configured.
- Read deployment logs from the deployment page or `GET /api/deployments/{id}/logs`, then container logs with `sudo docker logs <container>`.
- On a multi-server app, check that the remote port is reachable from the Rivetr host. With private binding on, it is published only on the Tailscale address. Check the server firewall.

## DNS and certificate failures

- HTTP-01 requires a public A or AAAA record pointing at the Rivetr host and port 80 reachable from the internet.
- If a CAA record exists, it must allow `letsencrypt.org`.
- At Cloudflare, SSL/TLS mode `Flexible` causes redirect loops and can break issuance. Use `Full (strict)` once the origin certificate exists, or temporarily switch the record to DNS only while troubleshooting.
- A pending certificate does not block HTTP access. Rivetr redirects a host to HTTPS only after its certificate exists.
- Wildcard certificates require DNS-01 through a configured DNS provider (Cloudflare, Route 53, Hetzner or DigitalOcean). Check the provider credentials, the domain, and the resolvers under Settings > Advanced > DNS servers.
- Certificate state, expiry and the last error are shown per domain in the dashboard and recorded in `domain_certificates`.
- Let's Encrypt rate limits apply: 250 new orders per 3 hours and 45 certificates per registered domain per week. Failed orders back off per domain from 15 minutes up to 24 hours. Use `acme_staging = true` while testing issuance.
- For a custom certificate, upload the full PEM chain and key. A custom certificate wins over ACME. Check its expiry and subject names.

## Health check failures

- HTTP checks need the right path, expected status and, when set, expected response body. The app must answer within the timeout.
- Command checks must exit 0. Verify the command exists in the container and works as the container user.
- Defaults are a 5-second interval, 5-second timeout, 10 retries and a 5-second start period. Increase the start period for slow boots.
- Deployment-level `[runtime] health_check_timeout_secs` defaults to 20 and is checked every 2 seconds. Raise it for apps that run migrations on boot.
- On multi-server apps, every container is checked from the Rivetr host against the address the proxy will use. A container that is healthy locally can still fail if its published port is blocked.

## Build failures and memory limits

- Read the full build log first. Exit code 137 usually means the build was OOM-killed. Raise `[runtime] build_memory_limit` (default `2g`) or reduce what the build does in parallel.
- `build_cpu_limit` defaults to `"2"`. Raise it for CPU-heavy compilation.
- `max_concurrent_deployments` defaults to 2. Extra deploys queue; they are not failing, just waiting.
- Add or fix `.dockerignore`. A large context slows uploads, especially to a build server.
- Check builder detection. Nixpacks and Railpack infer a build from the repository; if detection is wrong, select a Dockerfile or pin the build settings for the app.
- On a build server, check disk space, SSH connectivity, rsync and Docker. The image is streamed back with `docker save | gzip` and loaded locally.

## Webhooks are not triggering

- Confirm the repository webhook points at `/api/webhooks/github`, `/gitlab`, `/gitea`, `/bitbucket` or `/dockerhub` on the Rivetr URL.
- Inspect `GET /api/webhook-events` for the delivery, status and error. A rejected signature is recorded there.
- Webhook verification fails closed. Set `[webhooks] github_secret`, `gitlab_token`, `gitea_secret` or `bitbucket_secret`, or connect a GitHub App for GitHub. DockerHub requires `dockerhub_secret` in the URL as `?token=`.
- Branches must match exactly. Tag pushes and branch deletions are ignored.
- Commit messages containing `[skip ci]`, `[ci skip]`, `[skip cd]`, `[cd skip]`, `[skip deploy]` or `[no deploy]` skip the deploy.
- Watch paths are glob patterns. A push that changes no matching file does not deploy.
- Freeze windows are evaluated in UTC and apply to every trigger. Previews are exempt unless the window has `include_previews` enabled.
- A proxy or CDN must not modify the request body, or the HMAC signature will not match.

## Database connection issues

- Confirm the managed database container is running and use the host, port, database and credentials shown on its page. Apps on the same Rivetr network can reach other containers by name.
- Managed MySQL containers start with `--skip-ssl`. Do not require TLS from the client. The old `?ssl-mode=DISABLED` workaround is no longer needed and can be removed.
- PostgreSQL 18 and newer mount `/var/lib/postgresql`. PostgreSQL 12 to 17 mount `/var/lib/postgresql/data`. Pinning the wrong path looks like an empty data directory or an initdb loop after an upgrade.
- After changing a database password, update the linked environment variables and redeploy the app. Existing containers keep the old value.
- Connection refused from outside the host is expected unless the port is published. Prefer connecting from an app on the same network.
- If a backup or restore fails, check free disk space and the backup timeout (`[database_backup] timeout_seconds`, default 3600).

## Remote server connection failures

- A changed host key blocks the connection. Verify the new fingerprint on the server console, then use Reset host key. The reset forgets both the public and Tailscale addresses.
- Non-root users need passwordless sudo. Check as the SSH user with `sudo -n true`. The connection check reports `Sudo missing` or `Sudo missing (not installed)` with the exact sudoers line.
- Docker must be installed. Use the install action on the server page or install it manually, then add the user to the `docker` group or allow `sudo -n docker`.
- For Tailscale, confirm both machines are on the same tailnet, ACLs allow the SSH port, and the server is registered with its `100.x.y.z` address. Run Check connectivity.
- If Rivetr itself runs in Docker, it needs host networking or a Tailscale sidecar to reach the tailnet.
- Remote app ports are reachable only from the Rivetr host when private binding is on. Open the firewall for the Rivetr host or tailnet, not the public internet.

## Update failures

- Update checks require outbound access to the GitHub Releases API. Air-gapped installs should set `[auto_update] enabled = false`.
- `auto_apply` defaults to false. Trigger an update with `POST /api/system/update` using an admin token, or swap the binary manually and restart the service.
- If the binary cannot be replaced, check ownership and permissions on `/opt/rivetr/rivetr`, then replace it as root while the service is stopped.
- Re-apply `setcap` after a manual swap. Keep the old binary until the new one starts cleanly; swapping it back is the rollback.
- Migrations run at startup. Back up the database before upgrading. `GET /api/system/version` reports the running version.

## Disk is full

```bash
df -h
sudo du -sh /var/lib/rivetr/*
sudo docker system df
```

Common causes are old deployment images, unbounded container logs, backups, and proxy or webhook history.

- Set `[runtime] default_log_max_size` (default `"10m"`) and `default_log_max_file` (default 3).
- Review the server Images page and Docker cleanup runs. Run cleanup from the server page rather than a blind `docker system prune -a`, which also removes images you may need for rollback.
- Lower `[cleanup] max_deployments_per_app` and retention values under `[data_retention]`.
- Move backups off the host or reduce how many are kept.
- Remove unused volumes only after confirming no app, database or service uses them.

## Logs and diagnostics

| What | Where |
|---|---|
| Service logs | `sudo journalctl -u rivetr -f` |
| Config validation | `rivetr --config rivetr.toml config check` |
| Server status from the CLI | `rivetr --api-url URL --token TOKEN status` |
| App logs | Dashboard app logs, or `rivetr --api-url URL --token TOKEN logs <app> -n 200 --follow` |
| Deployment logs | `GET /api/deployments/{id}/logs` |
| Webhook deliveries | `GET /api/webhook-events` |
| Proxy access logs | Dashboard proxy logs, retained 14 days by default |
| Health | `GET /health`, `GET /api/system/health` |
| Stats and resources | `GET /api/system/stats`, `/api/system/resources`, `/api/system/disk` |
| Version | `GET /api/system/version` |
| Audit trail | `GET /api/audit` (admin), team audit page |
| Container logs | `sudo docker logs <container>` |

For a locked-out administrator without SMTP, run `rivetr --config /opt/rivetr/rivetr.toml reset-password <email>` as the service user. It needs at least 12 characters and revokes all of that user's sessions.
