# Backups

Rivetr backs up three things: managed databases, app volumes, and the Rivetr instance itself. Each can be kept on the Rivetr host, copied to S3-compatible storage, and restored from either place.

## What is backed up

| | Manual | Scheduled | Local | S3 | Restore | Retention |
|---|---|---|---|---|---|---|
| Database | Yes | Hourly, daily, weekly | Always | Optional copy | Yes | Keep last N locally and in the bucket |
| Volume | Yes | Cron | Yes | Yes | Yes | Keep last N (1 to 365) |
| Instance | Yes | Cron | Always | Optional copy | Upload or S3 | `retention_days`, always keeping the newest |

Database dumps cover PostgreSQL, MySQL, MariaDB, MongoDB, Redis, DragonflyDB, and KeyDB. ClickHouse and LibSQL are not supported. Restore is supported for PostgreSQL, MySQL, MariaDB, MongoDB, Redis, and KeyDB, with a 256 MiB limit per dump.

Volume backups cover app volumes. Compose service volumes are not covered yet.

## S3-compatible storage

Add an S3 configuration under **Integrations > S3**. Fields:

| Field | Notes |
|---|---|
| Name | A label for the configuration |
| Provider | Preset for AWS, Cloudflare R2, MinIO, Backblaze B2, or Google Cloud Storage, or a custom endpoint |
| Endpoint URL | Required for every provider except AWS; pre-filled by the presets |
| Bucket | Bucket name |
| Region | Defaults to `us-east-1`; use the bucket's region, for example `auto` for R2 |
| Access key, secret key | Stored encrypted. A default config can be used for manual instance backups. |
| Path prefix | Optional prefix inside the bucket |

Multiple configurations can exist. One can be marked as the default.

Object keys, relative to the path prefix:

| Kind | Key |
|---|---|
| Database | `backups/database/<database_id>/<name>_<YYYYMMDD_HHMMSS>.<sql\|archive\|rdb>` |
| Volume | `backups/volume/<volume_id>/<volume>-<YYYYMMDD-HHMMSS>.tar.gz` |
| Instance | `backups/instance/rivetr-backup-<YYYYMMDD-HHMMSS>.tar.gz` |

Uploads stream from disk. Each upload records its size and SHA-256. A restore from S3 streams the object to a temp file and refuses it when the size or checksum does not match.

Use **Scan S3** on a Backups page to list objects in the bucket that Rivetr has no record of, for example after a reinstall, and import them into the catalog so they can be restored. Imported objects have no stored checksum, so only the size reported by S3 is checked.

## Database backups

Open a database's Backups section.

- **Create Backup** dumps the database now. PostgreSQL uses `pg_dump`, MySQL `mysqldump`, MariaDB `mariadb-dump`, MongoDB `mongodump --archive`, and Redis, DragonflyDB, and KeyDB an RDB file.
- **Schedule** runs hourly, daily, or weekly at a chosen UTC hour. Set the retention count and a destination: local only, or local plus an S3 configuration. The same retention is applied to the bucket copies.
- **Copy to S3** uploads an existing local backup.
- **Restore** starts a background job. The database must be running, and Rivetr takes a safety backup of its current data first. The safety backup appears as a manual backup.

Restores use the same per-engine code as rollback with data:

- PostgreSQL drops the public schema and replays the dump in one transaction.
- MySQL and MariaDB drop tables and views, then replay the dump.
- MongoDB validates the archive with `mongorestore --dryRun`, then drops and restores.
- Redis and KeyDB stop the container, swap `dump.rdb` in the data volume, and start it again.

The page shows the latest restore job and whether it succeeded.

## Volume backups

Open an app's Storage section, then Volume Backups.

- **Back up now** writes to local disk or an S3 configuration. Local archives live in `<data_dir>/backups/volumes/<volume_id>/`. An S3 run keeps no local copy.
- **Snapshot mode**: `live` (default) tars the volume from a throwaway `alpine:3` helper container that mounts it read-only with no network while the app keeps running. Files being written during the copy can be caught mid-write. `stop` stops the app's containers for the duration of the copy and starts them again, which gives a consistent snapshot.
- **Schedule** uses a standard five-field cron expression in UTC, for example `0 3 * * *`. Weekday `0` or `7` is Sunday. Set the retention count (1 to 365), destination, and snapshot mode. Runs have history, including failures.

Restore checks the archive first (readable gzip tar, no absolute or `..` paths), stops the app's containers, takes a safety backup of the current content, empties the volume, extracts the archive with a helper container, and starts the containers again whatever happened. Safety copies are kept as `pre_restore`, with the last three per volume. The container monitor leaves those containers alone during the restore. Volume restores are limited to 50 GiB.

Bind mounts (absolute host paths) and named Docker or Podman volumes both work.

## Instance backups

Instance backups live under **Settings > Backup**.

A manual backup creates `rivetr-backup-<timestamp>.tar.gz` containing:

- The SQLite database after a WAL checkpoint.
- `rivetr.toml`.
- ACME certificates.

It is written to `<data_dir>/backups/`, and copied to S3 when a default configuration exists.

Instance schedules run on a cron expression. For an `instance` schedule, choose an S3 configuration to copy to and set `retention_days`. Older local instance backups and older copies in that S3 configuration are deleted, but the newest is always kept.

Restore from an uploaded archive with `POST /api/system/restore`, or from S3 with `POST /api/s3/backups/:id/restore`. An S3 restore takes a local safety backup of the instance first. Restart Rivetr after either restore.

## Pre-deploy snapshots and rollback with data

An app can snapshot its linked managed databases before a deploy. Enable `snapshot_before_deploy` on the app. The pipeline dumps every linked database just before the new container starts, stores each dump as a normal backup row of type `pre_deploy`, and ties it to the deployment that was about to start and to the deployment that last used the data.

A snapshot failure never blocks the deploy. The problem is written to the deployment log and the deploy continues.

To roll back code and data together:

```bash
curl -X POST https://rivetr.example.com/api/deployments/$DEPLOYMENT_ID/rollback \
  -H "Authorization: Bearer $RIVETR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"restore_data": true}'
```

Rivetr restores the newest snapshot for each linked database whose `source_deployment_id` matches the target deployment, so the data is as that deployment left it. Writes made after the snapshot are lost, so a safety backup is taken before the restore.

Snapshots are supported for PostgreSQL, MySQL, MariaDB, MongoDB, Redis, and KeyDB. DragonflyDB, ClickHouse, and LibSQL are not snapshotted. A restore requires the snapshot to be complete, the file to exist, the dump to be at most 256 MiB, and the database to be running. Redis and KeyDB additionally need a local data volume and AOF persistence off.

Old snapshots are pruned by `data_retention.deployment_snapshots_keep`, which defaults to 3 deployments per app.

## Schedules and missed runs

Database schedules are checked every 60 seconds by default (`database_backup.check_interval_seconds`). Volume and instance schedules use cron.

A `backup_missed` event fires once per missed run when an enabled schedule is more than 15 minutes (plus the scheduler interval) overdue and still has not run. This covers the server being down, database backups disabled in configuration, and a scheduled database backup skipped because the database was not running. The check runs every 5 minutes.

## Notifications

Subscribe a notification channel to `backup_succeeded`, `backup_failed`, or `backup_missed`. Subscriptions can be limited to databases, volumes, or the instance, or to one database or volume. Every channel renders the resource, trigger, size, duration, destination, and error.

Manual and scheduled backups notify. Safety backups and pre-deploy snapshots do not.

## CLI

The CLI backs up and restores the instance from the server itself, reading its `rivetr.toml`:

```bash
rivetr --config /opt/rivetr/rivetr.toml backup --output ./my-backup.tar.gz
rivetr --config /opt/rivetr/rivetr.toml restore ./my-backup.tar.gz
```

Stop Rivetr before restoring, and start it afterwards.

## API

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/databases/:id/backups/catalog?scan=` | Local and S3 backups together |
| POST | `/api/databases/:id/backups/:backup_id/restore` | Restore, body `{ "source": "local" \| "s3" }` (202) |
| POST | `/api/databases/:id/backups/:backup_id/upload-s3` | Copy a local backup to S3 |
| GET | `/api/databases/:id/backups/restores` | Recent restore jobs |
| GET | `/api/volumes/:id/backups?scan=` | Volume backup history |
| POST | `/api/volumes/:id/backups` | Create one: `{destination, s3_config_id, snapshot_mode}` (202) |
| POST | `/api/volumes/:id/backups/:backup_id/restore` | Restore, body `{ "source" }` (202) |
| GET, PUT, DELETE | `/api/volumes/:id/backup-schedule` | Per-volume schedule |
| POST | `/api/s3/backup` | Back up `instance`, `database`, or `volume` with `source_id` |
| POST | `/api/s3/backups/:id/restore` | Restore a database, volume, or instance backup |
| GET, POST | `/api/backups/schedules` | List or create instance, database, and volume schedules |
| DELETE | `/api/backups/schedules/:id` | Delete a schedule |
| PUT | `/api/backups/schedules/:id/toggle` | Enable or disable a schedule |
| POST | `/api/backups/schedules/:id/run` | Run a schedule now |

Create a database backup and then restore it:

```bash
curl -X POST https://rivetr.example.com/api/databases/$DATABASE_ID/backups \
  -H "Authorization: Bearer $RIVETR_TOKEN"

curl -X POST https://rivetr.example.com/api/databases/$DATABASE_ID/backups/$BACKUP_ID/restore \
  -H "Authorization: Bearer $RIVETR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"source":"local"}'
```
