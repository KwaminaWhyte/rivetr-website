# Environment Variables

Rivetr provides per-app environment variables with AES-256-GCM encryption at rest, plus a shared-variable inheritance chain so common config flows down from team to project to environment to app.

---

## Per-App Variables

Set variables for a single app in the dashboard under **App → Environment Variables**, or via the API:

```bash
# Create a variable
curl -X POST https://your-server/api/apps/<app_id>/env-vars \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"key": "DATABASE_URL", "value": "postgres://..."}'

# List variables (values are masked)
curl https://your-server/api/apps/<app_id>/env-vars \
  -H "Authorization: Bearer <token>"

# Get resolved variables (app + inherited)
curl https://your-server/api/apps/<app_id>/env-vars/resolved \
  -H "Authorization: Bearer <token>"
```

Variables are injected into the container at deploy time. You must redeploy the app after changing a variable for the new value to take effect.

---

## Encryption at Rest

When `auth.encryption_key` is set in `rivetr.toml`, all secret values are encrypted with **AES-256-GCM** before being stored in SQLite:

```toml
[auth]
encryption_key = "a-strong-32-character-random-key!!"
```

Use a key of at least 32 characters. Generate one with:

```bash
openssl rand -base64 32
```

If `encryption_key` is not set, values are stored in plaintext (backwards compatible, but not recommended for production).

---

## Shared Variables and Inheritance

Variables defined at a higher scope are automatically available to all resources below that scope. The inheritance order is:

```
Team vars
  └── Project vars
        └── Environment vars
              └── App vars  ← highest priority, wins on conflict
```

### Team-level variables

Go to **Team → Environment Variables**. These apply to all apps owned by the team.

```bash
curl -X POST https://your-server/api/teams/<team_id>/env-vars \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"key": "LOG_LEVEL", "value": "info"}'
```

### Project-level variables

Go to **Project → Environment Variables**. These apply to all apps in the project.

```bash
curl -X POST https://your-server/api/projects/<project_id>/env-vars \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"key": "REGION", "value": "us-east-1"}'
```

### Environment-level variables

Environments (e.g. `production`, `staging`) sit inside a project. Variables defined here override project-level ones for apps in that environment.

```bash
curl -X POST https://your-server/api/environments/<env_id>/env-vars \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"key": "API_URL", "value": "https://api.example.com"}'
```

### App-level variables

App-level variables take highest priority and override anything from higher scopes.

---

## Database Link Variables

When you link a managed database to an app, Rivetr automatically injects the connection string as an environment variable. No manual copy-paste needed.

1. Go to **App → Database Links**.
2. Click **Link Database** and select the managed database.
3. Choose the env var name (default: `DATABASE_URL`).
4. Rivetr injects the value at deploy time, encrypted.

Preview what will be injected:

```bash
curl https://your-server/api/apps/<app_id>/linked-env-vars \
  -H "Authorization: Bearer <token>"
```

---

## Secrets vs Plain Variables

All variables support encryption: there is no separate "secrets" type. The distinction is whether `encryption_key` is configured in `rivetr.toml`. When it is, every value is stored encrypted regardless of key name.

For variables that contain credentials, use the encryption key and limit API token scope so only the owning app's team can read them. RBAC roles (developer and above) can read and write env vars; viewer-role members cannot.

---

## Best Practices

- Set `auth.encryption_key` in production before creating any variables.
- Keep infrastructure-wide values (e.g. `SMTP_HOST`) at team level; keep per-app secrets at app level.
- Never commit secrets to your repository; use env vars instead.
- After rotating a secret, update the variable value and redeploy the app.
