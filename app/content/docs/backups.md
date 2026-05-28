# Backups

Rivetr supports S3-compatible object storage as a backup destination for volumes, managed databases, and full instance snapshots. All backups can be automated on a schedule with configurable retention.

---

## S3-Compatible Destinations

Any S3-compatible service works as a backup destination:

| Provider | Notes |
|----------|-------|
| AWS S3 | Standard AWS endpoint |
| Cloudflare R2 | No egress fees; custom endpoint required |
| MinIO | Self-hosted; any endpoint |
| Any S3-compatible API | Set a custom endpoint URL |

### Adding an S3 Config

Go to **Settings → S3 Storage → Add Config**, or use the API:

```bash
curl -X POST https://your-server/api/s3/configs \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "my-r2",
    "endpoint": "https://<account>.r2.cloudflarestorage.com",
    "bucket": "rivetr-backups",
    "region": "auto",
    "access_key": "...",
    "secret_key": "..."
  }'
```

For AWS S3, omit `endpoint` (it defaults to the standard AWS regional endpoint).

Test the connection:

```bash
curl -X POST https://your-server/api/s3/configs/<id>/test \
  -H "Authorization: Bearer <token>"
```

---

## Database Backups

Managed databases (PostgreSQL, MySQL, MongoDB, Redis, etc.) can be backed up on demand or on a schedule.

### On-Demand Backup

```bash
curl -X POST https://your-server/api/databases/<db_id>/backups \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"s3_config_id": "<s3_config_id>"}'
```

### Scheduled Backups

```bash
# Create a schedule (cron expression)
curl -X POST https://your-server/api/databases/<db_id>/backups/schedule \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "cron": "0 2 * * *",
    "s3_config_id": "<s3_config_id>",
    "retention_days": 30
  }'
```

The above creates a daily backup at 02:00 UTC, keeping the last 30 days of backups. Older backups are pruned automatically.

### Restore a Database Backup

```bash
curl -X POST https://your-server/api/s3/backups/<backup_id>/restore \
  -H "Authorization: Bearer <token>"
```

---

## Volume Backups

App volumes (persistent directories mounted into containers) can also be backed up to S3.

```bash
curl -X POST https://your-server/api/volumes/<volume_id>/backup \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"s3_config_id": "<s3_config_id>"}'
```

---

## Full Instance Backup

A full instance backup captures everything needed to restore Rivetr on a new server:

- The SQLite database (`rivetr.db`)
- The config file (`rivetr.toml`)
- All TLS certificates and ACME account data

### From the API

```bash
curl -X POST https://your-server/api/system/backup/full \
  -H "Authorization: Bearer <token>"
```

### From the CLI

```bash
# Create and save locally
rivetr backup --config /opt/rivetr/rivetr.toml --output ./rivetr-backup.tar.gz

# Restore (server must be stopped)
sudo systemctl stop rivetr
rivetr restore ./rivetr-backup.tar.gz --config /opt/rivetr/rivetr.toml
sudo systemctl start rivetr
```

Upload a local backup to S3:

```bash
curl -X POST https://your-server/api/system/backups/<name>/upload-to-s3 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"s3_config_id": "<s3_config_id>"}'
```

---

## Backup Schedules

Global backup schedules (across databases and volumes) are managed separately from per-database schedules:

```bash
# List schedules
curl https://your-server/api/backups/schedules \
  -H "Authorization: Bearer <token>"

# Create a schedule
curl -X POST https://your-server/api/backups/schedules \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "nightly-all",
    "cron": "0 3 * * *",
    "s3_config_id": "<s3_config_id>",
    "retention_days": 14
  }'

# Run a schedule immediately
curl -X POST https://your-server/api/backups/schedules/<id>/run \
  -H "Authorization: Bearer <token>"

# Toggle a schedule on/off
curl -X PUT https://your-server/api/backups/schedules/<id>/toggle \
  -H "Authorization: Bearer <token>"
```

---

## Retention Policy

The `database_backup` section in `rivetr.toml` controls scheduling infrastructure behavior:

```toml
[database_backup]
enabled = true
check_interval_seconds = 60   # how often Rivetr checks for due schedules
backup_dir = "backups"        # local staging dir, relative to data_dir
timeout_seconds = 3600        # max time for a single backup run
```

Per-schedule `retention_days` controls how many days of backups are kept in S3. Rivetr automatically deletes older objects when a new backup completes.
