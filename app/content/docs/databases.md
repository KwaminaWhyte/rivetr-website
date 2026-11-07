# Databases

Rivetr provisions and manages nine database engines as containers on the same network as your apps. Each database gets a generated password, a persistent volume, optional public access, and a one-click link that injects its connection details into an app.

## Supported engines

| Engine | Image | Versions | Default | Port |
|---|---|---|---|---|
| PostgreSQL | `postgres` | 18, 17, 16, 15, 14, 13, 12 | 17 | 5432 |
| MySQL | `mysql` | 8.0, 8.4, 5.7 | 8.0 | 3306 |
| MariaDB | `mariadb` | 11, 10.11, 10.6, 10.5 | 11 | 3306 |
| MongoDB | `mongo` | 7, 6, 5, 4.4 | 7 | 27017 |
| Redis | `redis` | 7, 7.2, 6, 6.2 | 7 | 6379 |
| DragonflyDB | `docker.dragonflydb.io/dragonflydb/dragonfly` | latest | latest | 6379 |
| KeyDB | `eqalpha/keydb` | latest | latest | 6379 |
| ClickHouse | `clickhouse/clickhouse-server` | latest, 24, 23 | latest | 8123 |
| LibSQL | `ghcr.io/tursodatabase/libsql-server` | latest | latest | 8080 |

Requesting version `latest` resolves to the engine default for engines that have a fixed default, so PostgreSQL becomes 17, MySQL 8.0, MariaDB 11, MongoDB 7, and Redis 7. DragonflyDB, KeyDB, ClickHouse, and LibSQL use the `latest` tag.

## Provisioning

Create a database from the dashboard or with `POST /api/databases`. The request accepts:

| Field | Notes |
|---|---|
| `name` | Required. Letters, numbers, and hyphens. |
| `db_type` | `postgres`, `mysql`, `mariadb`, `mongodb`, `redis`, `dragonfly`, `keydb`, `clickhouse`, or `libsql` |
| `version` | Engine version or tag. Defaults to `latest`. |
| `public_access` | Publish a host port for external clients. |
| `username`, `password`, `database` | Optional. Generated when omitted. |
| `root_password` | MySQL and MariaDB only. Generated when omitted. |
| `memory_limit`, `cpu_limit` | Default `512mb` and `0.5`. |
| `project_id`, `team_id` | Placement. |
| `custom_image` | Overrides the default image, for example a TimescaleDB image. |
| `init_commands` | JSON array of SQL statements run after the first start. |

Rivetr generates a username such as `user_48213` and a 24-character alphanumeric password. MySQL and MariaDB also get a 32-character root password. Credentials are stored with the database record and shown in the dashboard.

## Linking a database to an app

Create a link from the app's database section or with `POST /api/apps/:app_id/links`, passing `database_id` and an optional `env_prefix`.

The prefix is uppercased and may contain letters, digits, and underscores. It must start with a letter; an empty prefix is allowed.

Injected variables:

| Key | Meaning |
|---|---|
| `<PREFIX>DATABASE_URL` | URL for PostgreSQL, MySQL, MariaDB, ClickHouse, and LibSQL |
| `<PREFIX>REDIS_URL` | URL for Redis, DragonflyDB, and KeyDB |
| `<PREFIX>MONGODB_URL` | URL for MongoDB |
| `<PREFIX>HOST` | Container hostname on the shared network |
| `<PREFIX>PORT` | Internal port |
| `<PREFIX>USER` | Username |
| `<PREFIX>PASSWORD` | Password |
| `<PREFIX>DB` | Database name |

The variables are merged at container start, so a deploy or restart applies them. Values defined directly on the app win over linked values. If both the app and the database have a project, the projects must match.

Use `GET /api/apps/:app_id/linked-env-vars` to preview the keys a link would add and whether an existing app variable would override each one.

## Connection strings

`GET /api/databases/:id` returns the database record with `internal_connection_string` and, when public access is enabled, `external_connection_string`. The internal URL uses the stable container hostname and the internal port. It is reachable from apps and services on the shared Docker network, not from the host.

Examples of the generated shapes:

```
postgresql://user_48213:<password>@rivetr-db-1a2b3c4d:5432/user_48213
mysql://user_48213:<password>@rivetr-db-1a2b3c4d:3306/user_48213
mongodb://user_48213:<password>@rivetr-db-1a2b3c4d:27017/user_48213?authSource=admin
redis://:<password>@rivetr-db-1a2b3c4d:6379
clickhouse://user_48213:<password>@rivetr-db-1a2b3c4d:8123/user_48213
http://rivetr-db-1a2b3c4d:8080
```

LibSQL is auth-less by default and serves the HTTP/HRANA API on port 8080. Redis, DragonflyDB, and KeyDB use the password as `requirepass` and have no username or database name.

## Resource limits and live updates

Every database has a memory limit and a CPU limit. The defaults are `512mb` and `0.5` cores. Changing either limit on a running database applies it with `docker update`, so the container is not recreated and the data volume is untouched. Changes to other settings can restart the container.

The database page shows live CPU, memory, network, and storage usage. `GET /api/databases/:id/stats` returns the same figures, including `storage_bytes`, measured by walking the engine's data directory inside the container.

## PostgreSQL extensions

PostgreSQL databases have an Extensions section. Rivetr can install:

- pgvector (SQL name `vector`)
- PostGIS
- Apache AGE (SQL name `age`)
- TimescaleDB
- pg_cron
- pg_partman
- pgRouting
- RUM

Extensions that are not bundled in the official image get their OS package installed first (`postgresql-<version>-<extension>`), then `CREATE EXTENSION IF NOT EXISTS`. TimescaleDB also patches `shared_preload_libraries`. Built-in contrib extensions such as `pg_trgm`, `uuid-ossp`, and `hstore` need no package and work without this list.

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/databases/:id/extensions` | List installed extensions |
| POST | `/api/databases/:id/extensions` | Install `{ "extension": "pgvector" }` |

## Backups and storage

Database backups, schedules, S3 destinations, and restore are covered in [Backups](/docs/backups). In short:

- PostgreSQL, MySQL, MariaDB, MongoDB, Redis, DragonflyDB, and KeyDB can be dumped on demand or on an hourly, daily, or weekly schedule.
- ClickHouse backups are not supported yet. LibSQL backups are not supported.
- Restore is supported for PostgreSQL, MySQL, MariaDB, MongoDB, Redis, and KeyDB.
- Dumps and restores are limited to 256 MiB.
- A restore takes a safety backup of the current data first.

## Engine notes

- **PostgreSQL 18 and later.** The official image refuses a mount at `/var/lib/postgresql/data`. Rivetr mounts `/var/lib/postgresql` instead for version 18 and any image tag that is not a plain major version. Version 17 and earlier use `/var/lib/postgresql/data`.
- **MySQL below 8.4.** Rivetr starts these versions with `--skip-ssl`. MySQL 8 enables TLS by default with a self-signed certificate that many clients reject, and managed databases sit on a private network. Version 8.4 and later start without the flag.
- **MongoDB.** Backups use `mongodump --archive`, and restores validate the archive with `mongorestore --dryRun` before replacing data.
- **Redis and KeyDB.** Backups are RDB files. Restoring replaces `dump.rdb` in the database's local data volume, which requires the volume to be on this host and AOF persistence to be off. The container is stopped during the swap.
- **DragonflyDB.** Scheduled and manual RDB dumps work, but restore is not supported.
- **ClickHouse.** Automated and manual backups return "not yet supported"; use ClickHouse's own tooling.
- **LibSQL.** No generated credentials, no database name, no built-in backup. Clients connect over HTTP to port 8080.

## API

| Method | Path | Purpose |
|---|---|---|
| GET, POST | `/api/databases` | List or create databases |
| GET, PUT, DELETE | `/api/databases/:id` | Read, update, or delete |
| POST | `/api/databases/:id/start` | Start the container |
| POST | `/api/databases/:id/stop` | Stop the container |
| GET | `/api/databases/:id/logs` | Container logs |
| GET | `/api/databases/:id/stats` | CPU, memory, network, and storage |
| POST | `/api/databases/:id/import` | Import a dump into a running database |
| GET | `/api/apps/:app_id/links` | List an app's database links |
| POST | `/api/apps/:app_id/links` | Create a link |
| GET | `/api/apps/:app_id/linked-env-vars` | Preview injected variable names |

Create a PostgreSQL 17 database:

```bash
curl -X POST https://rivetr.example.com/api/databases \
  -H "Authorization: Bearer $RIVETR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "app-db",
    "db_type": "postgres",
    "version": "17",
    "memory_limit": "1gb",
    "cpu_limit": "1"
  }'
```
