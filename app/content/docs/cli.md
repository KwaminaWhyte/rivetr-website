# CLI Reference

Rivetr ships a command-line interface that can control any running Rivetr instance, local or remote. All subcommands accept `--api-url` and `--token` flags, or the environment variables `RIVETR_API_URL` and `RIVETR_TOKEN`.

---

## Installation

The CLI is the same binary as the server. Download a pre-built release:

```bash
# macOS (Apple Silicon)
curl -Lo rivetr https://github.com/KwaminaWhyte/rivetr/releases/latest/download/rivetr-macos-arm64
chmod +x rivetr
sudo mv rivetr /usr/local/bin/

# Linux (x86_64)
curl -Lo rivetr https://github.com/KwaminaWhyte/rivetr/releases/latest/download/rivetr-linux-x86_64
chmod +x rivetr
sudo mv rivetr /usr/local/bin/
```

Or build from source:

```bash
git clone https://github.com/KwaminaWhyte/rivetr.git
cd rivetr
cargo build --release --features tui
sudo cp target/release/rivetr /usr/local/bin/
```

---

## Global Flags

| Flag | Env var | Default | Description |
|------|---------|---------|-------------|
| `--config <path>` | - | `rivetr.toml` | Config file (server mode only) |
| `--api-url <url>` | `RIVETR_API_URL` | `http://localhost:8080` | Rivetr instance URL |
| `--token <token>` | `RIVETR_TOKEN` | - | API authentication token |
| `--log-level <level>` | - | `info` | Log verbosity |

Set environment variables to avoid passing flags on every command:

```bash
export RIVETR_API_URL=https://rivetr.example.com
export RIVETR_TOKEN=rvt_your_token_here
```

---

## Starting the Server

Running `rivetr` with no subcommand (or `rivetr server`) starts the server:

```bash
rivetr --config /opt/rivetr/rivetr.toml
```

---

## `rivetr status`

Show instance health, version, and uptime:

```bash
rivetr status
# or against a remote instance:
rivetr status --api-url https://rivetr.example.com --token rvt_…
```

---

## `rivetr apps`

### `rivetr apps list`

List all applications:

```bash
rivetr apps list
```

### `rivetr apps show <app>`

Show details for a specific app by name or ID:

```bash
rivetr apps show my-api
```

---

## `rivetr deploy <app>`

Trigger a deployment for an app by name or ID:

```bash
rivetr deploy my-api
```

---

## `rivetr logs <app>`

Stream or tail application logs:

```bash
# Show last 100 lines (default)
rivetr logs my-api

# Show last 50 lines
rivetr logs my-api -n 50

# Follow (stream new logs as they arrive)
rivetr logs my-api --follow
```

---

## `rivetr backup`

Create a full instance backup (SQLite database + config + SSL certificates):

```bash
# Save to default location (data/backups/)
rivetr backup --config /opt/rivetr/rivetr.toml

# Save to a specific path
rivetr backup --config /opt/rivetr/rivetr.toml --output ./rivetr-$(date +%Y%m%d).tar.gz
```

The server does **not** need to be stopped for a backup.

---

## `rivetr restore <backup_file>`

Restore from a backup archive. **Stop the server before restoring.**

```bash
sudo systemctl stop rivetr
rivetr restore ./rivetr-20260101.tar.gz --config /opt/rivetr/rivetr.toml
sudo systemctl start rivetr
```

The command restores the database, config, and SSL certificates and prints a summary of what was restored.

---

## `rivetr config check`

Validate the config file and print any errors:

```bash
rivetr config check --config /opt/rivetr/rivetr.toml
```

---

## `rivetr db migrate-teams`

One-time migration that assigns unassigned resources (apps, databases, services, projects) to their creator's first team. Run this once after upgrading to a version that introduced multi-tenancy.

```bash
# Dry run (shows what would be migrated, makes no changes)
rivetr db migrate-teams --config rivetr.toml

# Execute the migration
rivetr db migrate-teams --config rivetr.toml --execute
```

---

## `rivetr tui`

Launch the keyboard-driven terminal dashboard. Requires a build with `--features tui` (included in all pre-built release binaries).

```bash
rivetr tui --url https://rivetr.example.com --token rvt_…
```

Or using environment variables:

```bash
export RIVETR_URL=https://rivetr.example.com
export RIVETR_TOKEN=rvt_your_token_here
rivetr tui
```

### TUI Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Tab` / `1–4` | Switch tabs: Apps / Deployments / Servers / Logs |
| `↑` / `↓` | Navigate list |
| `d` | Deploy selected app |
| `s` | Stop selected app |
| `r` | Restart selected app |
| `?` | Toggle help overlay |
| `q` / `Ctrl-C` | Quit |

Data refreshes every 5 seconds. The status bar shows the connected instance URL and live connection state.
