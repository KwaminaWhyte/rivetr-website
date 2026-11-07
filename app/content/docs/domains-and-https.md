# Domains and HTTPS

Rivetr ships an embedded reverse proxy. It terminates TLS, routes by hostname, and obtains certificates per domain, so you do not need Traefik, Caddy, or nginx in front of it.

## How routing works

The proxy listens on two ports from `rivetr.toml`:

| Key | Default | Purpose |
|---|---|---|
| `server.proxy_port` | `80` | Plain HTTP |
| `server.proxy_https_port` | `443` | HTTPS |

Each domain maps to a backend host and port. When a deployment swaps containers, the route table is updated atomically, and the old container is drained for up to `proxy.drain_timeout_secs` (default 30, `0` disables draining). WebSocket tunnels are not waited for.

The HTTPS listener offers HTTP/2 and HTTP/1.1 through ALPN. The plain listener accepts HTTP/2 with prior knowledge (h2c). WebSocket upgrades use HTTP/1.1. Backends are always reached over HTTP/1.1.

## Adding a domain

Add domains on an app's Domains page or a service's Network page. An app can have several domains; the certificate is chosen per connection from the TLS SNI name.

Each domain entry can set:

- Whether it is the primary domain, used for the app's `RIVETR_URL`.
- A container port other than the app port.
- www redirect mode: allow both, redirect www to non-www, or redirect non-www to www, with a 301 or 302.
- Whether search engines may index it. When disabled, the proxy adds `X-Robots-Tag: noindex, nofollow`.

A service has one domain and port. Both apps and services route through the same proxy.

## Automatic HTTPS

Automatic HTTPS is off until it is configured:

```toml
[proxy]
acme_enabled = true
acme_email = "admin@example.com"
```

The HTTPS listener starts when `acme_enabled` is true and `acme_email` is set, or when at least one custom certificate has been uploaded.

Every hostname gets its own certificate. On each TLS connection the proxy selects, in order:

1. An exact certificate for the SNI name.
2. A one-label wildcard certificate.
3. The instance domain certificate.
4. A self-signed fallback.

There is no shared-certificate limit on the number of domains. Certificates live under `<acme_cache_dir>/domains/<domain>/`, and per-domain state (status, expiry, last error, next attempt) is tracked in the database.

HTTP is redirected to HTTPS only for hosts that already have a certificate. A domain whose certificate is still pending stays reachable over HTTP.

## Certificate modes

Set the mode per domain:

| Mode | How it works |
|---|---|
| Automatic | HTTP-01 order for that hostname through Let's Encrypt. |
| Wildcard | DNS-01 through a DNS provider. Issues both `name` and `*.name`. |
| Custom | Upload a PEM certificate chain and private key. The key is encrypted with the instance encryption key. A custom certificate wins over ACME. |

Use a wildcard when many subdomains share one parent. HTTP-01 cannot issue a wildcard certificate, and the rate limits below make per-subdomain orders impractical at scale.

## DNS providers and wildcards

DNS providers are configured under **Integrations > DNS providers** (`/integrations/dns`). Supported providers:

- Cloudflare
- AWS Route 53
- Hetzner Cloud DNS
- DigitalOcean

The same page holds the wildcard instance domain, for example `*.apps.example.com`, which is normally `*.<base_domain>`. One wildcard certificate covers auto-generated and preview domains.

DNS-01 propagation is checked against the resolvers in **Settings > Advanced > DNS servers**, or against `1.1.1.1` and `8.8.8.8` when none are configured.

## Renewal and rate limits

Renewal starts 30 days before expiry, with a stable per-domain jitter of up to 72 hours. A failed order backs off per domain from 15 minutes, doubling to 24 hours, without blocking other domains.

New orders are capped at 250 per 3 hours and at 45 new certificates per registered domain per week. Let's Encrypt allows 50 per registered domain per week, so Rivetr stays below the limit. If you need many subdomains under one domain, use a wildcard.

The legacy shared certificate under `<acme_cache_dir>/certs/<instance_domain>/` keeps serving its names during an upgrade. It is no longer renewed and can be deleted once every domain shows "Issued".

## Automatic subdomains and sslip.io

Set `proxy.base_domain` to give new apps a subdomain automatically:

```toml
[proxy]
base_domain = "apps.example.com"
```

An app named `my-app` gets `my-app.apps.example.com`. You can also request a generated domain for an existing app:

```
POST /api/apps/:id/generate-domain
```

That endpoint returns a random 8-character prefix under `base_domain`. With no base domain, `sslip_enabled` true, and `server_ip` set, it returns `<prefix>.<server-ip>.sslip.io`. With no base domain and no sslip, `server_ip` set, it returns a `traefik.me` style `<prefix>-<ip-with-dashes>.traefik.me`. With none of these configured it returns an error.

`proxy.instance_domain` maps a hostname to the Rivetr dashboard and API through the same proxy.

## Preview URLs

Pull request previews use a distinct base domain:

```toml
[proxy]
preview_domain = "preview.example.com"
```

A preview for PR 123 of `my-app` is served at:

```
pr-123.my-app.preview.example.com
```

If `preview_domain` is unset, the fallback base is `preview.localhost`, which is only useful locally.

## Proxy route API

The proxy exposes its live route table:

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/routes` | All routes with backend, health, and failure count |
| POST | `/api/routes` | Add a route: `{domain, backend_host, backend_port, container_id, healthcheck_path?}` |
| GET | `/api/routes/domains` | Domain names only |
| GET | `/api/routes/health` | Route health summary |
| GET, DELETE | `/api/routes/:domain` | Read or remove one route |
| PUT | `/api/routes/:domain/health` | Set `{healthy}` |

Routes added this way live in memory and are not tied to an app. A restart rebuilds routes from the database.

## Certificate and DNS API

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/apps/:id/certificates` | Per-domain status for an app |
| PUT | `/api/apps/:id/certificates/:domain` | Set `{mode, dns_provider_id?}` |
| POST, DELETE | `/api/apps/:id/certificates/:domain/custom` | Upload or remove a custom certificate |
| GET | `/api/services/:id/certificates` | Per-domain status for a service |
| PUT | `/api/services/:id/certificates/:domain` | Set the mode |
| POST, DELETE | `/api/services/:id/certificates/:domain/custom` | Upload or remove a custom certificate |
| GET, POST | `/api/dns-providers` | List or create DNS providers |
| PUT, DELETE | `/api/dns-providers/:id` | Update or delete a provider |
| POST | `/api/dns-providers/:id/verify` | Verify provider credentials |
| GET, PUT | `/api/certificates/wildcard` | Read or set the wildcard instance domain |
| GET | `/api/domains/check?domain=` | Resolve a domain and compare it with the server IP |

## Troubleshooting

- **Domain does not resolve.** Create an A or AAAA record pointing at the server. `GET /api/domains/check?domain=` reports the resolved IPs, whether they match the configured server IP, and whether DNS validation is disabled in Settings > Advanced.
- **Certificate stays pending.** Port 80 must be reachable from the internet for HTTP-01, and no other service may hold it. Check the per-domain status and last error. For DNS-01, check that the provider credentials can edit the zone and that the authoritative nameservers have propagated.
- **Issuance is blocked by a CAA record.** The domain's CAA set must allow the ACME certificate authority.
- **Rate limited while testing.** Set `proxy.acme_staging = true` to use the Let's Encrypt staging environment, then turn it off for production certificates.
- **HTTPS listener does not start.** Set both `acme_enabled` and `acme_email`, or upload a custom certificate.
- **A wildcard is needed.** HTTP-01 cannot issue one. Configure a DNS provider and switch the domain to wildcard mode, or set the wildcard instance domain.
