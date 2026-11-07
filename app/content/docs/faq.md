# Frequently Asked Questions

## What is Rivetr?

Rivetr is a self-hosted platform as a service. It deploys applications from Git and runs them in Docker or Podman containers. The control plane is a single Rust binary: the REST API, React dashboard, deployment engine, reverse proxy with automatic HTTPS, and an embedded SQLite database all live in that one process. It does not need Redis, PostgreSQL, or Traefik.

It handles webhooks from GitHub, GitLab, Gitea, Bitbucket, and Docker Hub, and does zero-downtime deployments with health checks and automatic rollback. It also provisions 365 service templates and 9 managed database engines.

## Is Rivetr production ready?

Version 1.0.0, released 2026-11-05, is the first 1.0 release. It changed dashboard URLs; API paths stayed the same, and old dashboard URLs redirect.

The features you need for production are present: health checks, rollback, deployment freeze windows, instance and database backups, audit logs, teams and RBAC, TOTP 2FA and passkeys, and automatic TLS. As with any self-hosted control plane, keep backups, test upgrades on a staging instance, and do not treat a release number as a substitute for your own risk assessment.

## Which operating systems are supported?

| Target | Support |
|--------|---------|
| Production | Linux x86_64 or aarch64 |
| Development | macOS and Windows |
| Installer | Ubuntu, Debian, Fedora, CentOS, RHEL |
| Container runtime | Docker Engine or Podman |
| Host memory | 512 MB minimum, 1 GB or more recommended |

Ports 80 and 443 serve proxied apps, and 8080 serves the API and dashboard. A host that only runs the Rivetr process still needs room for application containers, images, and builds.

## How much memory does Rivetr use?

Measured on Ubuntu 24.04 x86_64 with Rivetr 1.0.0 managing 30 containers: 52 MB RSS across 8 threads. The release binary is 47 MB. Those figures cover the Rivetr process, not the containers it manages.

This is the main difference from control planes that ship PostgreSQL, Redis, and Traefik as separate services. Memory use grows with deployments, builds, and log volume, but the idle control plane is small.

## Do I need Redis, PostgreSQL, or Traefik?

No. Rivetr embeds SQLite in WAL mode for state, an in-process Tokio queue for deployments, and a Hyper/rustls proxy for HTTP and HTTPS. Automatic HTTPS is handled by the embedded proxy with per-domain certificates. Managed PostgreSQL, MySQL, MariaDB, MongoDB, Redis, DragonflyDB, KeyDB, ClickHouse, and LibSQL databases are optional, and run as containers when you create them.

## Docker or Podman?

Both are supported, and the runtime is detected at startup. Force one in `rivetr.toml`:

```toml
[runtime]
runtime_type = "auto"   # auto, docker, or podman
```

Docker talks to the daemon over its socket using Bollard. Podman is driven through the `podman` command line, so the binary must be installed and on the `PATH` of the user running Rivetr. With `auto`, Docker is preferred when both are available; set `runtime_type = "podman"` to force Podman.

## How does Rivetr compare with Coolify and Dokploy?

| | Rivetr | Coolify | Dokploy |
|---|---|---|---|
| Control plane memory | 52 MB RSS with 30 containers | No published figure; docs ask for 2 GB RAM | No published figure; docs ask for 2 GB RAM |
| Services it runs | None besides the binary | PostgreSQL, Redis, Traefik or Caddy | PostgreSQL, Traefik on Docker Swarm |
| Single binary | Yes | No | No |
| Container runtimes | Docker, Podman | Docker | Docker |
| Preview deployments | All four Git providers | All four Git providers | GitHub only |
| MCP server | Built in | Built in | Separate `@dokploy/mcp` package |
| Web terminal | Containers and servers | Containers and servers (v4.0+) | Containers and servers |
| License | MIT | Apache 2.0 | Apache 2.0, with source-available `/proprietary` features |

Details checked against vendor docs and releases on 2026-11-07: Coolify v4.6.0 and Dokploy v0.31.0. All three deploy from Git, run previews, and provide a dashboard terminal. Coolify and Dokploy have larger feature surfaces in some areas; Rivetr's difference is the single-binary footprint and the absence of supporting services.

## What does Rivetr cost?

Rivetr is MIT licensed and free to self-host. There is no paid edition or license key. You pay for the server and any external services you choose, such as S3 storage or a Git provider.

## Can I migrate from Coolify or Dokploy?

There is no automatic importer. Migration means rebuilding the deployment on Rivetr:

1. Install Rivetr on a clean host, or stop the old platform first if you must reuse ports 80 and 443.
2. Create projects and apps from the same Git repositories. Pick the build type: Dockerfile, Nixpacks, Railpack, Cloud Native Buildpacks, static site, or prebuilt image.
3. Copy environment variables and re-enter secrets. Secret values are not exported from the old platform.
4. Recreate Docker Compose stacks as Compose services.
5. Dump each database with its native tool and restore it into a Rivetr-managed database.
6. Deploy, verify health and domains, then move DNS.

Between Rivetr instances, `GET /api/projects/{id}/export` and `POST /api/projects/{id}/import` move project and app configuration. The export excludes secrets, so re-enter them after import. To move a whole instance, use the backup and restore commands instead.

## How do backups work?

Rivetr has three backup layers:

| Layer | What it covers |
|-------|----------------|
| Instance backup | SQLite database, `rivetr.toml`, TLS/ACME certificates, and dumps from Compose service databases |
| Managed database backup | A single PostgreSQL, MySQL, MariaDB, MongoDB, Redis, DragonflyDB, KeyDB, ClickHouse, or LibSQL database |
| Volume backup | An app or service volume, live or with the app stopped |

Instance and database backups can run on a schedule, be kept locally, copied to S3-compatible storage, and pruned by retention. Restore from the dashboard or the CLI. A CLI backup and restore looks like this:

```bash
rivetr --config /opt/rivetr/rivetr.toml backup --output ./rivetr-backup.tar.gz
sudo systemctl stop rivetr
rivetr --config /opt/rivetr/rivetr.toml restore ./rivetr-backup.tar.gz
sudo systemctl start rivetr
```

The instance archive does not include the encryption key. Copy `.encryption_key` and `.encryption_salt` separately; without them, encrypted values cannot be recovered. See [Backups](/docs/backups) for schedules and S3 setup.

## Does Rivetr send telemetry?

No. Rivetr does not collect usage data, metrics, or analytics about your instance. Its update check asks the GitHub releases API for the latest version every 6 hours by default. Disable it in `rivetr.toml`:

```toml
[auto_update]
enabled = false
```

You can also turn it off under **Settings > Updates**. The check sends no application data; it only asks GitHub for the latest release tag.

## Where does configuration live?

The installer writes `/opt/rivetr/rivetr.toml` and stores data in `/var/lib/rivetr`. The SQLite database is `/var/lib/rivetr/rivetr.db`. Server settings such as ports, the data directory, proxy and ACME, runtime limits, rate limits and retention come from `rivetr.toml`. Instance settings changed in the dashboard, such as registration, API access, updates, email, AI and branding, are stored in the database. Restart the systemd service after editing the file:

```bash
sudo systemctl restart rivetr
sudo journalctl -u rivetr -f
```

Configuration keys are documented in [Configuration](/docs/configuration). Per-app settings live in the dashboard or the API.

## What is the encryption key and where is it stored?

The encryption key protects secrets at rest: environment variables, SSH keys and passwords, S3 keys, TOTP secrets, and GitHub App secrets. Resolution order:

1. `[auth] encryption_key` in `rivetr.toml`, if set.
2. `<data_dir>/.encryption_key`, if the file exists.
3. On a fresh install with no existing users or secrets, Rivetr generates a random 256-bit key and writes it to `<data_dir>/.encryption_key` with mode `0600`.

A `.encryption_salt` file sits next to it. Back up both files with the database and store them off the server. If the key is lost, encrypted values cannot be decrypted. If you upgraded from a version that stored secrets in plaintext, `rivetr db encrypt-secrets --execute` encrypts them in place after a dry run.

## Where can I get help?

- Read the docs starting at [Introduction](/docs/introduction), then [Troubleshooting](/docs/troubleshooting).
- Search or open an issue at [github.com/KwaminaWhyte/rivetr/issues](https://github.com/KwaminaWhyte/rivetr/issues).
- Report security vulnerabilities privately through [GitHub Security Advisories](https://github.com/KwaminaWhyte/rivetr/security/advisories/new), not a public issue.

## Related pages

- [Installation](/docs/installation) for the install script and manual setup.
- [Upgrading](/docs/upgrading) for backups, version pinning, and rollback.
- [Security](/docs/security) for auth, TLS, and hardening.
