# CLI

The Rivetr binary is both the server and a command-line client. With no subcommand it starts the server; with a subcommand it runs a CLI command and exits. Version 1.0.0 has two groups of commands:

- **Remote commands** talk to a running instance over its REST API, from any machine.
- **Local commands** read `rivetr.toml` and the SQLite database directly on the host.

## Installation

The production install script places the binary at `/opt/rivetr/rivetr` and runs it as a systemd service. Add that directory to `PATH` or call the full path. Prebuilt release binaries are also published for Linux and macOS.

The terminal UI is behind the `tui` Cargo feature. Release binaries are built without it, so build from source to use `rivetr tui`:

```bash
git clone https://github.com/KwaminaWhyte/rivetr.git
cd rivetr
cargo build --release --features tui
```

## Global flags

Flags go before the subcommand: `rivetr --api-url ... status`, not `rivetr status --api-url ...`.

| Flag | Environment variable | Default | Used by |
|------|----------------------|---------|---------|
| `--api-url <url>` | `RIVETR_API_URL` | `http://localhost:8080` | Remote commands |
| `--token <token>` | `RIVETR_TOKEN` | none | Remote commands |
| `--config <path>` | none | `rivetr.toml` | Server and local commands |
| `--log-level <level>` | none | Config value (`info` by default) | Server mode |
| `--skip-checks` | none | off | Server mode only; skips startup self-checks |

Set the environment variables once to avoid repeating flags:

```bash
export RIVETR_API_URL=https://rivetr.example.com
export RIVETR_TOKEN=rvt_your_token_here
```

## Remote commands

| Command | Purpose | Token scope |
|---------|---------|-------------|
| `rivetr status` | Health, version, component status, app/database/service counts, CPU, memory, uptime. | `read` |
| `rivetr apps list` | List apps with ID, name, environment, domain, and port. | `read` |
| `rivetr apps show <app>` | Show one app by name or UUID. | `read` |
| `rivetr deploy <app>` | Trigger a deployment and print the deployment ID and status. | `read`, `deploy` |
| `rivetr logs <app>` | Stream app logs over SSE with `--follow`. | `read` |

`status` calls `GET /api/system/health` and `GET /api/system/stats`. `apps` and `logs` resolve an app by UUID first, then by case-insensitive name.

`logs` only prints output with `--follow`; without it the command prints a hint instead of a historical tail. The `-n/--lines` flag is accepted, but the current streaming path does not use it.

```bash
rivetr --api-url https://rivetr.example.com --token rvt_... status

rivetr apps list
rivetr apps show my-api
rivetr deploy my-api
rivetr logs my-api --follow
```

An admin token or dashboard session token also works, but a personal API token with the scopes above is the safer choice for scripts and CI.

## Local commands

Local commands run on the Rivetr host and read the database at `<data_dir>/rivetr.db` and the config file passed with `--config`. Stop the server where noted.

| Command | Purpose |
|---------|---------|
| `rivetr backup` | Create an instance backup. |
| `rivetr restore <file>` | Restore an instance backup. |
| `rivetr reset-password <email>` | Reset a user's password offline. |
| `rivetr config check` | Validate `rivetr.toml` and print a summary. |
| `rivetr db encrypt-secrets` | Encrypt secrets stored before an encryption key existed. |
| `rivetr db migrate-teams` | Assign legacy team-less resources to their creator's first team. |

### `backup`

```bash
rivetr --config /opt/rivetr/rivetr.toml backup
rivetr --config /opt/rivetr/rivetr.toml backup --output ./rivetr-backup.tar.gz
```

The default output is `<data_dir>/backups/rivetr-backup-<timestamp>.tar.gz`. The archive contains the SQLite database, `rivetr.toml`, TLS/ACME certificates, and dumps of databases run by Docker Compose services. The command checkpoints the SQLite WAL first and can run while the server is up. Run it as the user that owns `data_dir`.

### `restore`

```bash
sudo systemctl stop rivetr
rivetr --config /opt/rivetr/rivetr.toml restore ./rivetr-backup.tar.gz
sudo systemctl start rivetr
```

Restore replaces the database, config, and certificates. Stop the server first, and restart it afterwards. The command prints what was restored and any warnings.

### `reset-password`

```bash
rivetr --config /opt/rivetr/rivetr.toml reset-password admin@example.com
rivetr --config /opt/rivetr/rivetr.toml reset-password admin@example.com --password 'new-password'
```

This is offline admin recovery for when SMTP is not configured or the admin is locked out. If `--password` is omitted, the command prompts. Passwords must be at least 12 characters. All of the user's sessions are revoked.

### `config check`

```bash
rivetr --config /opt/rivetr/rivetr.toml config check
```

Prints the parsed server, runtime, security, and feature settings plus warnings for a missing encryption key or webhook secrets. An invalid file exits `1`. A missing file is reported but is not an error; the server would start with defaults.

### `db encrypt-secrets`

```bash
rivetr --config /opt/rivetr/rivetr.toml db encrypt-secrets
rivetr --config /opt/rivetr/rivetr.toml db encrypt-secrets --execute
```

Dry run by default. With `--execute`, creates `<data_dir>/.encryption_key` if needed and encrypts env vars, SSH keys and passwords, S3 keys, TOTP secrets, and GitHub App secrets in one transaction. Each value is decrypted back and compared before it is written, and rerunning the command changes nothing. Stop the server first, and back up the database and key files.

### `db migrate-teams`

```bash
rivetr --config /opt/rivetr/rivetr.toml db migrate-teams
rivetr --config /opt/rivetr/rivetr.toml db migrate-teams --execute
```

Dry run by default. Assigns apps, projects, databases, and services with no team to their creator's first team. This is a one-time migration for older installations.

## Terminal UI

The TUI connects to a running instance and refreshes every 5 seconds. It uses `RIVETR_URL` for the instance URL, not `RIVETR_API_URL`. `RIVETR_TOKEN` is shared with the CLI.

```bash
rivetr tui --url https://rivetr.example.com --token rvt_...
```

| Key | Action |
|-----|--------|
| `Tab` / `Shift-Tab`, `→` / `←` | Switch between Apps, Deployments, Servers, and Logs tabs |
| `↑` / `↓`, `k` / `j` | Navigate the list |
| `Enter` | Select |
| `d` | Deploy the selected app |
| `s` | Stop the selected app |
| `r` | Restart the selected app |
| `R` | Refresh now |
| `?` | Toggle the help overlay |
| `q` / `Esc` / `Ctrl-C` | Quit |

## Exit codes

| Code | Meaning |
|------|---------|
| `0` | Command succeeded. |
| `1` | Runtime failure: connection error, non-2xx API response, app not found, invalid config, missing database, or a startup self-check failure in server mode. The error is printed to stderr. |
| `2` | Command-line usage error from clap: unknown subcommand or flag, or a missing argument. |

## Related pages

- [REST API](/docs/api) for the endpoints behind the remote commands.
- [Backups](/docs/backups) for database, volume, and instance backup schedules.
- [Configuration](/docs/configuration) for `rivetr.toml`.
