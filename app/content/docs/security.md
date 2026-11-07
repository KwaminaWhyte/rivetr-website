# Security

Rivetr is a self-hosted platform, so the security boundary is the host you run it on. Apps run in containers with memory, PID and OOM limits and are reachable only through the embedded proxy unless a port is published explicitly. Containers still share the host kernel, and Docker access is root-equivalent. Treat deployed code as trusted, and give Rivetr a dedicated host or VM when possible.

This page describes the controls in Rivetr 1.0.0 and the settings that matter in production.

## Encryption at rest

Sensitive values are encrypted with AES-256-GCM before they are written to SQLite. This includes environment variables, SSH keys and passwords, OAuth and provider secrets, registry and S3 credentials, TOTP secrets, GitHub App secrets and external secret manager credentials.

New values use the `ENC2:` format. A per-install random salt in `<data_dir>/.encryption_salt` (mode `0600`) is combined with the encryption key through HKDF-SHA256 to derive the data key. Older `ENC:` values use the legacy KDF and remain readable. Plaintext values written before a key existed also remain readable. Values are re-encrypted in the current format when they are next written.

Key resolution at startup, first match wins:

1. `[auth] encryption_key` in `rivetr.toml`.
2. `<data_dir>/.encryption_key`, if present.
3. On a fresh install with neither, Rivetr generates a random 256-bit key and writes it to `<data_dir>/.encryption_key` with mode `0600`, created atomically and never overwritten.
4. On an existing install with neither, values stay in plaintext and a startup warning prints the line to add.

Back up `.encryption_key` and `.encryption_salt` together with the database. Without them, encrypted values cannot be recovered. The salt file is never regenerated when the database already contains `ENC2:` values, because a new salt would orphan them.

To encrypt an existing install, stop Rivetr, back up the database and key files, then run:

```bash
rivetr --config rivetr.toml db encrypt-secrets          # dry run
rivetr --config rivetr.toml db encrypt-secrets --execute
```

The command creates a key and salt if needed, re-encrypts every supported value in one transaction, decrypts each value back to verify it, and rolls back on any mismatch. It is safe to run again. Older database backups taken before this step still contain plaintext.

There is no in-place key rotation command in 1.0.0. Changing the key without re-encrypting makes existing ciphertext unreadable. Treat the key as long-lived and restrict access to it.

## Secrets in deployments

Environment variables are masked in the dashboard and API. External secret managers can supply values at deploy time with `secret://<connection>/<path>#<key>` for Vault or OpenBao, Infisical, Doppler and AWS Secrets Manager. Resolved values are masked as `********` in deploy output and are not written to the database. Connection credentials are encrypted and write-only after creation.

Secret manager failure policies choose between failing the deployment and using the last known value. Use fail-closed for production credentials. The outbound policy in Advanced settings restricts webhook and log-drain requests from reaching internal CIDRs; localhost is blocked by default.

## SSH host key pinning

Rivetr pins SSH host keys on first connection (`accept-new`) and stores them in `<data_dir>/ssh/known_hosts`. Later connections to a different key fail. A changed key is a real signal: verify the new fingerprint out of band before using Reset host key. Pinned keys are stored per address, so switching a server to Tailscale pins the new address separately, and a reset forgets both. Build servers pin the host they are configured to use.

First use is trust on first use. If you need stronger guarantees, verify the fingerprint from the server console before the first connection.

## API tokens

Tokens use the `rvt_` prefix and are stored as SHA-256 hashes, never plaintext. The plaintext value is shown once, on creation or roll. Tokens support:

- Scopes: `read`, `deploy`, `write`, `delete`, `secrets`, `admin`. `admin` implies all others.
- Optional expiry, team restriction and project/resource restriction.
- Pause, resume, and roll with a grace period (60 minutes by default, seven days maximum).
- Last-used tracking and a non-secret token hint.

A token can never exceed its owner's role and resource overrides. Use one token per automation, grant the smallest scope that works, and set an expiry. Prefer `deploy` for CI rather than `admin`.

The Advanced settings API access policy (`api_access_enabled`, `api_allowed_ips`) can restrict token-authenticated requests to specific IPs or CIDRs. An empty list allows every source. This policy does not affect dashboard sessions. Denied token requests fail with `api_access_denied`.

## Authentication

- Passwords are hashed with Argon2.
- Password reset tokens are single-use, expire after 30 minutes, and revoke all sessions when used.
- TOTP enrollment produces 10 hashed recovery codes. Passkeys use WebAuthn challenges that expire after five minutes, and a passkey login satisfies a team's 2FA requirement.
- OIDC SSO and OAuth logins bind the callback to the browser with a short-lived state cookie. Account linking requires a verified email; an unverified address is not used to link or take over an account.
- New OIDC users are created only when registration is enabled, and receive a Personal team as owner.
- Failed logins are throttled per account: 5 failures in 15 minutes triggers a 30-second lockout that doubles up to 15 minutes. `/api/auth/login` and `/api/auth/2fa/validate` return `429` while locked. The counter clears on success. Lockout state is in memory and resets when the process restarts; IP rate limits remain in force.

IP rate limiting has separate buckets for general API, webhook and auth traffic. Defaults are 100 API requests, 500 webhook requests and 20 auth requests per 60-second window. `trusted_proxies` controls when `X-Forwarded-For` and `X-Real-IP` are honored. Forwarded headers are read right to left, skipping trusted hops, so values a client prepends are ignored. List only proxies that untrusted clients cannot connect from.

## Authorization

Every resource route runs through team-scoped authorization. A member's role, a custom role, and per-resource allow/deny overrides are combined; deny anywhere on the resource, its app or its project wins. An allow override can widen only read, deploy and write access to apps, services, databases and projects, never delete, secret reading or team administration. Custom roles cannot grant abilities their creator does not hold; the owner is exempt.

App shares between teams are view-only in 1.0.0. A team that enforces 2FA blocks members without TOTP or a passkey from team resources, returning `two_factor_required`.

The team and permission model is covered in [/docs/teams-and-rbac](/docs/teams-and-rbac).

## Audit logging

Team audit entries record the actor, action, resource type and ID, details and timestamp, and require the `team.audit` ability to read. They do not record a client IP. The instance-wide audit API at `/api/audit` is admin-only and does include the client IP, resolved through trusted proxies.

`audit_logs` and `team_audit_logs` are retained for 90 days by default. Proxy access logs are retained for 14 days and webhook events for 30 days. All are configurable under `[data_retention]`.

## Browser and transport protections

Responses carry:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY` and CSP `frame-ancestors 'none'`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Cache-Control: no-store, max-age=0` for API responses

The dashboard CSP allows scripts only from the origin plus SHA-256 hashes of the inline bootstrap scripts embedded in the served HTML. It does not use `unsafe-inline` or `unsafe-eval` for scripts. Styles allow inline styles because the dashboard and white-label CSS set style attributes. `object-src` is `none`, `base-uri` is `self`, and form submissions are limited to the origin plus GitHub for App setup. Non-HTML responses get the stricter API policy: `default-src 'none'`.

HSTS is sent as `max-age=31536000` only when the request arrived over HTTPS. It deliberately omits `includeSubDomains`, because app subdomains deployed under the same parent may be served over HTTP.

TLS certificates are issued per hostname by SNI, using ACME HTTP-01 for normal domains or DNS-01 for wildcards, or uploaded manually. HTTP is redirected to HTTPS only after a certificate exists, so a pending domain stays reachable while issuance completes. Backends are reached over HTTP/1.1; on the Rivetr host, app containers bind to `127.0.0.1`. Remote servers should use private binding and a private network such as Tailscale.

Inbound webhooks fail closed. Configure `[webhooks]` secrets for GitHub, GitLab, Gitea and Bitbucket, or connect a GitHub App. DockerHub requires `webhooks.dockerhub_secret` in the webhook URL and rejects requests when it is unset. Unsigned or mismatched requests are rejected.

## Updates and telemetry

Rivetr contains no analytics or telemetry SDK. The update check queries only the GitHub Releases API for `KwaminaWhyte/rivetr`. `[auto_update] enabled` defaults to true; `auto_apply` defaults to false, so updates are detected but not installed. Prereleases are excluded unless `include_prereleases` is enabled. Set `enabled = false` for an air-gapped install and update manually.

## Backups and encryption

Rivetr does not encrypt backup archives. An instance backup is a gzip tar containing `rivetr.db`, `rivetr.toml`, the ACME certificate directory, and dumps of running Compose service databases.

- If the encryption key is set in `rivetr.toml`, the archive contains the key alongside the encrypted database.
- If the key is in `<data_dir>/.encryption_key`, that file and `.encryption_salt` are not added to the archive. Back them up separately, or encrypted values cannot be restored.
- S3 uploads record size and SHA-256 and verify them on restore, but Rivetr does not set server-side encryption. Enable default encryption on the bucket and restrict access.
- Database and volume backups are also unencrypted. Encrypt them at the destination, or store them only on encrypted volumes.

A backup may contain plaintext legacy values, the encrypted database, and the key itself. Treat archives with the same care as the live database and key files.

## Production hardening checklist

1. Serve the dashboard and API over HTTPS. Set `external_url`, `instance_domain` and `acme_email`, and do not expose port 8080 to the internet.
2. Set a stable `[auth] admin_token` instead of relying on the per-start random value.
3. Provide an encryption key, back up `.encryption_key`, `.encryption_salt` and the database, and restrict file permissions to the service user.
4. Configure webhook secrets for every Git provider you use, and a DockerHub token if you use DockerHub triggers.
5. Require 2FA or passkeys for owner and admin accounts, and enable team 2FA enforcement for production teams.
6. Issue scoped, expiring API tokens per automation. Pause tokens that are no longer used and roll them if exposed.
7. Keep `registration_enabled` off unless you need self-service signup, and review OIDC and OAuth providers regularly.
8. Set `trusted_proxies` to the exact proxies in front of Rivetr. Never list ranges untrusted clients can connect from.
9. Put remote servers on a private network, keep `bind_private` on, firewall published app ports to the Rivetr host, and verify host-key changes before resetting them.
10. Keep Docker, the host OS and Rivetr patched. Enable update checks, or track GitHub Releases manually in air-gapped setups.
11. Encrypt backup destinations, restrict who can download archives, and rotate any credential that appears in an old plaintext backup.
12. Review the audit log for role changes, token creation and server access, and alert on disk and container monitor warnings.

Passwordless sudo and membership in the `docker` group are both root-equivalent on a server. Grant them only to the Rivetr SSH user, and keep other workloads off that host.
