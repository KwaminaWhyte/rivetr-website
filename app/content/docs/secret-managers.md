# Secret Managers

Rivetr can read environment variable values from an external secret manager at deploy time. The variable stores a reference; the value is fetched during the deployment, held in memory for that run, masked in logs, and never written to the Rivetr database.

Supported providers:

- HashiCorp Vault
- OpenBao
- Infisical
- Doppler
- AWS Secrets Manager

Manage connections under **Integrations > Secret managers** (`/integrations/secrets`).

## Reference syntax

```
secret://<connection>/<path>#<key>
```

| Part | Meaning |
|---|---|
| `<connection>` | Connection name: lowercase letters, digits, `-`, and `_`. Resolved in the resource's team first, then in instance-wide connections. |
| `<path>` | Provider path. May be empty. |
| `#<key>` | One key of the secret. Required except for AWS Secrets Manager, where omitting it uses the whole `SecretString`. |

Provider paths:

| Provider | Path | Example |
|---|---|---|
| Vault, OpenBao | KV v2 secret path inside the connection's mount | `secret://vault-prod/myapp/config#DATABASE_URL` |
| Infisical | Folder, empty for the project root | `secret://infisical/backend#STRIPE_KEY` |
| Doppler | Empty for the token's config, or `project/config` | `secret://doppler/#API_KEY` |
| AWS Secrets Manager | Secret name or ARN | `secret://aws/prod/db#password` |

A reference can appear in:

- App variables, environment variables, and project or team shared variables. All layers are resolved for the app at deploy, rollback, zero-downtime restart, and preview deploys.
- Compose service variables, which are written to the service's managed `.env` on deploy, start, and restart.
- App build secrets, which are passed to Dockerfile builds as BuildKit `--secret` values.

References are not resolved in:

- Build-time environment passed to Nixpacks, Railpack, buildpacks, or static builds. Those builders receive the stored reference text.
- Replica scale-up from the Replicas page.
- Managed databases, which do not have custom environment variables.

## Importing a whole path

The Secret manager card on an app's, service's, or project's environment page can link every key at a path. Each key becomes a variable named `<prefix><KEY>`. Keys that are not valid variable names are skipped with a warning.

Precedence:

1. Variables you define yourself always win.
2. App imports win over project imports.
3. Project imports apply to every app in the project, but not to compose services, which do not inherit project variables.

## Compose services

A secret reference in a service variable stays as `${KEY}` in the rendered `docker-compose.yml`. Compose fills it from the Rivetr-managed `.env` file, which is written with mode 0600.

Use `${KEY}` rather than `${KEY:?message}` for imported keys. Compose's required-variable check only sees variables defined directly on the service, not imported ones.

## When a provider fails

The policy is set per app or service on the Secret manager card.

| Policy | Behaviour |
|---|---|
| Fail the deploy (default) | The deploy, restart, or service start stops before any running container is touched. The error names the variable and the reason, never the value. |
| Use the last resolved values | After each successful resolution the values are stored encrypted with the instance encryption key. If the provider is unreachable later, those values are used and the deployment log shows a warning with the time they were resolved. A reference added since the last success still fails. |

Switching back to fail deletes the stored values. Without an encryption key nothing is stored, so the fallback policy cannot work.

## Security model

- Provider credentials are write-only. They are encrypted with the instance encryption key, and an encryption key is required before a connection can be added. The API only reports which credential fields are set.
- Team admins and owners manage their team's connections. Instance-wide connections, which have no team, require an instance administrator.
- Any team member can test a connection and browse it, but browsing returns folder and key names only. Secret values never reach the browser.
- For non-admins, connection URLs go through the outbound policy under **Settings > Advanced > Outbound**. A Vault on a private address needs its CIDR allowed there.
- Resolved values are masked as `********` in deployment logs, log drains, and stored deployment errors. Values of four or more characters are masked, as is each line of eight or more characters in a multi-line value.
- Each deploy reads a path once. The cache is dropped when the deployment ends.
- Creating, updating, and deleting connections, imports, and policies is recorded in the audit log.

## Provider setup

### HashiCorp Vault and OpenBao

Fields: address, KV v2 mount (default `secret`), optional namespace, and auth method.

Token auth needs a policy that can read the secret path:

```hcl
path "secret/data/myapp/*"     { capabilities = ["read"] }
path "secret/metadata/myapp/*" { capabilities = ["list"] }
```

The `list` capability on `metadata` is only needed to browse. The connection test calls `auth/token/lookup-self`.

AppRole auth takes a role ID and secret ID. The AppRole mount defaults to `approle`. Enable AppRole, create a role with a short token TTL, and enter its role ID and secret ID. Rivetr logs in once per deploy.

The namespace is sent as `X-Vault-Namespace`. Only KV version 2 is supported.

### Infisical

Create a machine identity with Universal Auth and give it read access to the project. Enter:

- Site URL (default `https://app.infisical.com`; change it for self-hosted or EU)
- Project ID
- Environment slug (`dev`, `staging`, `prod`)
- Client ID and client secret

The path is the folder. Secret references and imports inside Infisical are expanded.

### Doppler

Create a service token for the config (`dp.st.<config>.<...>`). Project and config are optional because the token is already scoped. Set them when using a personal or service account token, or override per reference with `secret://doppler/<project>/<config>#KEY`.

### AWS Secrets Manager

Fields: region, auth, and an optional endpoint override for a VPC endpoint.

Auth options:

- Access key: an IAM user or role key pair, plus a session token for temporary credentials.
- EC2 instance role: credentials come from the instance metadata service (IMDSv2). This only works when Rivetr runs on EC2 with an instance profile.

The IAM policy needs `secretsmanager:GetSecretValue` on the secret ARNs. `secretsmanager:ListSecrets` is only needed to browse; the connection test succeeds without it. JSON secrets are split into keys for `#key` references. Plain-text secrets are used whole. Binary secrets are not supported. Requests are signed with SigV4 by Rivetr itself, without the AWS SDK.

## API

All routes are under `/api` with bearer token auth.

| Method | Path | Notes |
|---|---|---|
| GET | `/secret-connections?team_id=` | Team connections plus instance-wide connections |
| POST | `/secret-connections` | `{team_id, name, provider, config, credentials}` |
| GET, PUT, DELETE | `/secret-connections/:id` | Blank credential fields keep the stored value |
| POST | `/secret-connections/:id/test` | Test a stored connection |
| POST | `/secret-connections/test` | Test unsaved settings |
| GET | `/secret-connections/:id/browse?path=` | Folder and key names, no values |
| GET, POST | `/{apps,services,projects}/:id/secret-imports` | List or create imports: `{connection_id, path, prefix}` |
| DELETE | `/{apps,services,projects}/:id/secret-imports/:import_id` | Remove an import |
| GET, PUT | `/{apps,services}/:id/secret-policy` | `{failure_policy: "fail" \| "last_known"}` |

Providers are `vault`, `openbao`, `infisical`, `doppler`, and `aws_secrets_manager`.

Config fields are `auth_method`, `address`, `mount`, `namespace`, `role_id`, `approle_mount`, `site_url`, `project_id`, `environment`, `client_id`, `api_url`, `project`, `config`, `region`, `access_key_id`, and `endpoint`. Credential fields are `token`, `secret_id`, `client_secret`, `secret_access_key`, and `session_token`.

Create a Vault token connection:

```bash
curl -X POST https://rivetr.example.com/api/secret-connections \
  -H "Authorization: Bearer $RIVETR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "vault-prod",
    "provider": "vault",
    "config": {
      "auth_method": "token",
      "address": "https://vault.example.com",
      "mount": "secret"
    },
    "credentials": {
      "token": "hvs..."
    }
  }'
```

Then reference a key from an app variable:

```
DATABASE_URL=secret://vault-prod/myapp/config#DATABASE_URL
```
