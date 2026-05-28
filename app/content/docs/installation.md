# Installation

## Requirements

- **OS**: Linux x86_64 or aarch64 (production); macOS or Windows for development
- **Runtime**: Docker Engine 24+ or Podman 4+
- **Ports**: 80 (HTTP proxy), 443 (HTTPS proxy), 8080 (API and dashboard)

The install script handles Docker installation automatically on Ubuntu, Debian, Fedora, CentOS, and RHEL.

## One-line install

```bash
curl -fsSL https://rivetr.dev/install.sh | sh
```

The script does the following:

1. Installs Docker if not already present
2. Downloads and installs the Rivetr binary from GitHub Releases
3. Installs build tools: Git, Nixpacks, Railpack, Pack CLI
4. Creates a `rivetr` system user with Docker group access
5. Writes `/opt/rivetr/rivetr.toml` with a generated admin token
6. Registers a systemd service with auto-restart enabled
7. Opens firewall ports 80, 443, and 8080

After installation:

```
Dashboard:  http://your-server-ip:8080
Config:     /opt/rivetr/rivetr.toml
Data:       /var/lib/rivetr
Logs:       sudo journalctl -u rivetr -f
```

## Install a specific version

```bash
RIVETR_VERSION=v0.2.6 curl -fsSL https://rivetr.dev/install.sh | sh
```

## First-run setup

Open `http://your-server-ip:8080` in a browser. On the first visit, you will be prompted to create an admin account (username, email, password). After setup, you will be logged into the dashboard.

> **Tip**: Before creating the admin account, note the `admin_token` in `/opt/rivetr/rivetr.toml`. This token is used for API access and the CLI. Keep it secret.

## Service management

```bash
sudo systemctl status rivetr
sudo systemctl restart rivetr
sudo systemctl stop rivetr
sudo journalctl -u rivetr -f
```

## Upgrading

Rivetr checks for updates every 6 hours by default. The dashboard shows a banner when a new version is available. To apply an update via the API:

```bash
# Check for an update
curl -H "Authorization: Bearer <token>" https://your-instance/api/system/update/check

# Apply the update
curl -X POST -H "Authorization: Bearer <token>" https://your-instance/api/system/update/apply
```

Or re-run the install script: it is idempotent and upgrades in place.

## Development setup

**Prerequisites**: Rust 1.75+, Node.js 20+, Docker or Podman.

```bash
git clone https://github.com/KwaminaWhyte/rivetr.git
cd rivetr
cp rivetr.example.toml rivetr.local.toml

# Backend (auto-reload on file changes)
cargo install cargo-watch  # once
cargo watch -x "run -- --config rivetr.local.toml"

# Frontend dev server (separate terminal)
cd frontend
npm install
npm run dev
```

The backend API and dashboard are on `http://localhost:8080`. The Vite dev server runs on `http://localhost:5173` and proxies API calls to the backend, giving you hot-module reload for React.

## Ansible provisioning

For automated server provisioning on Ubuntu/Debian:

```bash
ansible-playbook ansible/rivetr.yml -i your-server-ip,
```

The playbook installs Docker, downloads Rivetr, writes the config, and enables the systemd service.
