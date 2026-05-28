# Domains and HTTPS

Rivetr ships with an embedded reverse proxy that handles custom domains, automatic HTTPS certificate provisioning via Let's Encrypt, and zero-downtime atomic route switching.

---

## How the Embedded Proxy Works

The proxy listens on ports 80 and 443 (configurable) and routes incoming requests to the correct container based on the `Host` header. Routes are stored in an in-memory table backed by `ArcSwap`, so switching traffic to a new container after a deployment is atomic: no reload, no dropped connections.

```toml
[server]
proxy_port = 80
proxy_https_port = 443
```

---

## Automatic HTTPS with Let's Encrypt

Enable ACME in `rivetr.toml`:

```toml
[proxy]
acme_enabled = true
acme_email = "admin@example.com"
acme_staging = false      # set true to test without hitting rate limits
acme_cache_dir = "./data/acme"
```

When a custom domain is added to an app, Rivetr automatically:
1. Attempts an ACME HTTP-01 challenge on port 80
2. Obtains a certificate from Let's Encrypt
3. Serves traffic on HTTPS and redirects HTTP → HTTPS
4. Renews the certificate before it expires (Let's Encrypt certificates are valid for 90 days; Rivetr renews at ~60 days)

No external Traefik or Nginx is required.

> **Staging mode:** Use `acme_staging = true` during development to avoid the Let's Encrypt [rate limits](https://letsencrypt.org/docs/rate-limits/). Staging certificates are not trusted by browsers but are otherwise identical.

---

## Adding a Custom Domain

1. Point your DNS `A` record to the server's public IP.
2. Open the app in the dashboard → **Settings → Domains**.
3. Click **Add Domain** and enter the hostname (e.g. `api.example.com`).
4. Rivetr immediately begins the ACME challenge and issues a certificate.

DNS propagation can take a few minutes. Rivetr retries the challenge automatically.

Via the API:

```bash
curl -X POST https://your-server/api/apps/<app_id> \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"domain": "api.example.com"}'
```

---

## Multiple Domains per App

An app can have multiple domains, all routing to the same container. Add them one at a time in the dashboard or via successive API calls. Each domain gets its own certificate.

---

## Auto-Generated Subdomains

If you set `base_domain` in the proxy config, Rivetr generates a subdomain automatically for every new app:

```toml
[proxy]
base_domain = "apps.example.com"
auto_subdomain_enabled = true
```

A new app named `my-api` gets `my-api.apps.example.com`. You need a wildcard DNS record (`*.apps.example.com → server IP`) and a wildcard certificate for this to work end-to-end.

---

## sslip.io Domains

For quick testing without DNS configuration, enable `sslip_enabled`:

```toml
[proxy]
sslip_enabled = true
```

Each app gets an auto-generated `sslip.io` domain based on the server's IP address (e.g. `abc123.192-168-1-1.sslip.io`). These resolve through the public `sslip.io` DNS service, no DNS setup needed.

---

## Preview URLs for Pull Requests

When pull-request preview deployments are enabled, each PR gets its own subdomain:

```toml
[proxy]
preview_domain = "preview.example.com"
```

A PR `#42` for an app `my-app` gets `pr-42.my-app.preview.example.com`. The subdomain is deleted automatically when the PR is closed or merged.

---

## Proxy Route Management

View and manage routes via the API:

```bash
# List all routes
curl https://your-server/api/routes \
  -H "Authorization: Bearer <token>"

# Get a route by domain
curl https://your-server/api/routes/api.example.com \
  -H "Authorization: Bearer <token>"

# List all routed domains
curl https://your-server/api/routes/domains \
  -H "Authorization: Bearer <token>"
```

---

## Troubleshooting

**Certificate not issued:** Check that port 80 is publicly reachable and the DNS A record points to the correct IP. Let's Encrypt needs to reach `http://your-domain/.well-known/acme-challenge/...`.

**HTTP → HTTPS redirect loop:** If you have an upstream proxy (e.g. Cloudflare in proxy mode), set it to "Full (strict)" SSL mode so it does not re-terminate TLS.

**Staging certificates:** Remember to set `acme_staging = false` and remove the cached staging certificates in `acme_cache_dir` before going to production.
