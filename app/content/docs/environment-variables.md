# Environment Variables

Rivetr stores environment variables per app, with optional shared layers above the app. Values are encrypted at rest, masked in the API and logs, and injected into containers at deploy or restart.

## Where variables live

| Scope | Managed from | Applies to |
|---|---|---|
| Team | Team settings | Every app in the team |
| Project | Project settings | Every app in the project |
| Environment | Project environments | Every app in that environment |
| App | App's Environment tab | That app only |

Apps resolve all four layers. When the same key exists at more than one level, the more specific level wins: team, then project, then environment, then app. User-defined app variables also win over database link variables and imported secret-manager keys.

Compose services have their own variables, written to the service's managed `.env` file. Project, environment, and team variables are not inherited by services. Managed databases do not accept custom environment variables; their container settings come from the database configuration.

To inspect the final set for an app, use `GET /api/apps/:id/env-vars/resolved`. Each entry reports the key, a masked or plain value, whether it is secret, its source layer, and its description.

## Secrets and encryption

A variable can be marked secret. Secret values are masked as `********` in API responses unless the request adds `?reveal=true`, and as `***` in the resolved view. Revealing values through an API token needs the `secrets` scope, which maps to the `env.read_secrets` ability. A token never grants more than its owner has.

Stored values use AES-256-GCM:

- `ENC2:` values use an HKDF-SHA256 subkey derived from the master key and a random per-install salt stored in `<data_dir>/.encryption_salt`.
- Legacy `ENC:` values use PBKDF2-HMAC-SHA256 with 100,000 iterations and a fixed salt. They decrypt normally and are rewritten as `ENC2:` when their row is next updated.

The master key is resolved at startup in this order:

1. `[auth] encryption_key` in `rivetr.toml`.
2. `<data_dir>/.encryption_key`, if present.
3. On a fresh install, a random 256-bit key is generated and written to `<data_dir>/.encryption_key` with mode 0600.

Back up `.encryption_key` and `.encryption_salt` together with the SQLite database. Without both files, encrypted values cannot be recovered. An existing install with no key keeps reading plaintext values and logs a warning; values written after a key is configured are encrypted.

To encrypt values that already exist as plaintext, stop Rivetr, back up the database and key files, then run:

```bash
rivetr --config rivetr.toml db encrypt-secrets
rivetr --config rivetr.toml db encrypt-secrets --execute
```

The first command reports what would change. The second runs it in one transaction, decrypting each value back to verify it before writing. It is safe to run again.

## Build secrets

Dockerfile builds can use BuildKit build secrets. Add entries under `build_secrets` on the app:

```json
{
  "build_secrets": [
    { "key": "npm_token", "value": "secret://vault-prod/ci#NPM_TOKEN" }
  ]
}
```

Rivetr passes each entry as a BuildKit `--secret`, so the value is available to the build but is not baked into image layers. A build secret value can also be a `secret://` reference that is resolved only for that build.

Build-time environment passed to Nixpacks, Railpack, buildpacks, and static builds is not resolved from external secret managers; those builders receive the stored value.

## Database link variables

Linking a managed database to an app injects connection details into the app's environment on the next deploy or restart. Create a link from the app's database section or with the API.

The optional prefix is uppercased and may contain letters, digits, and underscores. It must start with a letter. An empty prefix is allowed.

| Injected key | Value |
|---|---|
| `<PREFIX>DATABASE_URL` | Connection URL for PostgreSQL, MySQL, MariaDB, ClickHouse, and LibSQL |
| `<PREFIX>REDIS_URL` | Connection URL for Redis, DragonflyDB, and KeyDB |
| `<PREFIX>MONGODB_URL` | Connection URL for MongoDB |
| `<PREFIX>HOST` | Database container hostname on the shared network |
| `<PREFIX>PORT` | Internal database port |
| `<PREFIX>USER` | Generated or configured username |
| `<PREFIX>PASSWORD` | Generated or configured password |
| `<PREFIX>DB` | Database name |

Values defined directly on the app take precedence over linked values with the same key. A link can only be created when the app and database are in the same project, if both have a project. Use `GET /api/apps/:id/linked-env-vars` to preview the keys a link would add and whether each one is already overridden.

## References to external secret managers

Any app, service, project, or team variable can hold a reference instead of a value:

```
secret://<connection>/<path>#<key>
```

Rivetr resolves the reference at deploy time, keeps the value in memory for that deployment, masks it in logs, and never stores it in the database. See [Secret Managers](/docs/secret-managers) for providers, path formats, imports, and failure policies.

## API examples

Create an app variable:

```bash
curl -X POST https://rivetr.example.com/api/apps/$APP_ID/env-vars \
  -H "Authorization: Bearer $RIVETR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"DATABASE_URL","value":"postgres://...","is_secret":true}'
```

List variables with secret values revealed (requires the `secrets` scope):

```bash
curl "https://rivetr.example.com/api/apps/$APP_ID/env-vars?reveal=true" \
  -H "Authorization: Bearer $RIVETR_TOKEN"
```

Read the resolved set for the app, including shared layers and database links:

```bash
curl "https://rivetr.example.com/api/apps/$APP_ID/env-vars/resolved" \
  -H "Authorization: Bearer $RIVETR_TOKEN"
```

Create a database link with a prefix:

```bash
curl -X POST https://rivetr.example.com/api/apps/$APP_ID/links \
  -H "Authorization: Bearer $RIVETR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"database_id":"'$DATABASE_ID'","env_prefix":"PRIMARY_"}'
```

Shared variables use the same shape under `/api/teams/:id/env-vars`, `/api/projects/:id/env-vars`, and `/api/environments/:id/env-vars`. Deleting or updating a project or environment variable takes an environment variable id, not a key.
