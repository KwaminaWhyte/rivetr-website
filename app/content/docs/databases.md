# Databases

Rivetr can provision and manage database containers on your server with one click. Each database runs in its own container alongside your apps.

## Supported databases

| Database | Type | Notes |
|----------|------|-------|
| **PostgreSQL** | Relational | Latest stable; extension management via API |
| **MySQL** | Relational | |
| **MongoDB** | Document | |
| **Redis** | Key-value cache | |
| **DragonFlyDB** | Redis-compatible | Higher throughput, lower memory usage than Redis |
| **KeyDB** | Redis-compatible | Multi-threaded Redis fork |
| **ClickHouse** | Column-store analytics | |
| **LibSQL** | Embedded SQLite-compatible | Turso-compatible; embeds well in edge deployments |

---

## Provisioning a database

From the dashboard, go to **Databases → New Database**, select the engine, choose a version, and click **Create**. Rivetr:

1. Pulls the official container image
2. Generates a random password and stores it encrypted (AES-256-GCM)
3. Starts the container on a private port
4. Makes the connection string available to your apps

Via the API:

```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "my-postgres", "engine": "postgres", "version": "16"}' \
  https://your-instance/api/databases
```

---

## Linking a database to an app

Link a database to an app and Rivetr automatically injects the connection string as environment variables into the app container, no manual copy-pasting.

From the dashboard: **App → Environment → Link Database**.

Via the API:

```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"database_id": "<db-id>"}' \
  https://your-instance/api/apps/<app-id>/links
```

The injected variables follow standard naming conventions:

```
DATABASE_URL=postgres://user:password@localhost:5432/mydb
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=rivetr
POSTGRES_PASSWORD=<generated>
POSTGRES_DB=mydb
```

---

## Backups

### Manual backup

```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  https://your-instance/api/databases/<id>/backups
```

### Scheduled backups

Set a cron schedule for automatic backups:

```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"cron": "0 3 * * *", "retention_count": 7}' \
  https://your-instance/api/databases/<id>/backups/schedule
```

### S3-compatible backup destinations

Store backups on AWS S3, Cloudflare R2, MinIO, or any S3-compatible endpoint:

```bash
# Add an S3 config
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "r2-backups",
    "endpoint": "https://your-account.r2.cloudflarestorage.com",
    "bucket": "rivetr-backups",
    "region": "auto",
    "access_key": "...",
    "secret_key": "..."
  }' \
  https://your-instance/api/s3/configs
```

Once an S3 config is saved, you can target it when scheduling backups.

---

## Importing and exporting

### Import a dump

```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -F "file=@dump.sql" \
  https://your-instance/api/databases/<id>/import
```

### Export a dump

```bash
curl -H "Authorization: Bearer <token>" \
  https://your-instance/api/databases/<id>/backups/<backup-id>/download \
  -o dump.sql
```

---

## PostgreSQL extensions

List and install extensions on a PostgreSQL database:

```bash
# List available extensions
curl -H "Authorization: Bearer <token>" \
  https://your-instance/api/databases/<id>/extensions

# Install an extension
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "pgvector"}' \
  https://your-instance/api/databases/<id>/extensions
```

---

## Real-time logs

Stream database startup and runtime logs:

```bash
# REST log history
curl -H "Authorization: Bearer <token>" \
  https://your-instance/api/databases/<id>/logs

# WebSocket stream
wscat -H "Authorization: Bearer <token>" \
  wss://your-instance/api/databases/<id>/start-stream
```
