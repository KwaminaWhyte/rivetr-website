# Installation

Rivetr runs on Linux in production. macOS and Windows are supported for development only.

## Requirements

| Requirement | Detail |
|---|---|
| Operating system | Linux x86_64 or aarch64 for production; macOS or Windows for development |
| Container runtime | Docker Engine or Podman |
| Ports | 80 (HTTP proxy), 443 (HTTPS proxy), 8080 (API and dashboard) |
| Memory | 512 MB minimum, 1 GB or more recommended |
| Build from source | Rust 1.95+ and Node.js 22.22+ |

The installer detects Ubuntu, Debian, Fedora, CentOS, RHEL, Rocky Linux and AlmaLinux. It installs Docker if it is missing, configures a systemd service and opens the firewall. Root access is required.

## One-line install

```bash
curl -fsSL https://raw.githubusercontent.com/KwaminaWhyte/rivetr/main/install.sh | sudo bash
```

To install a specific release:

```bash
curl -fsSL https://raw.githubusercontent.com/KwaminaWhyte/rivetr/main/install.sh | sudo RIVETR_VERSION=v1.0.0 bash
```

`RIVETR_VERSION` defaults to `latest`, which resolves to the newest GitHub release. The installer builds from source if the release download fails.

## What the installer does

1. Detects the distribution and architecture (`x86_64` or `aarch64`).
2. Installs Docker if it is not already present.
3. Installs Git, Nixpacks, Railpack and the Pack CLI used for Cloud Native Buildpacks.
4. Configures swap.
5. Creates the `rivetr` system user with Docker socket access and a home directory.
6. Creates `/opt/rivetr` and `/var/lib/rivetr`.
7. Downloads the release binary, or builds it from source as a fallback, then grants it `CAP_NET_BIND_SERVICE` with `setcap` so it can bind ports 80 and 443 without running as root.
8. Writes `/opt/rivetr/rivetr.toml` with a randomly generated admin token.
9. Creates and starts the `rivetr` systemd service and opens ports 80, 443 and 8080 in UFW or firewalld.

Paths and commands after install:

| Item | Location |
|---|---|
| Binary | `/opt/rivetr/rivetr` |
| Configuration | `/opt/rivetr/rivetr.toml` |
| Data directory | `/var/lib/rivetr` |
| SQLite database | `/var/lib/rivetr/rivetr.db` |
| Service | `rivetr.service` |
| Logs | `sudo journalctl -u rivetr -f` |

The generated systemd unit runs as the `rivetr` user with `Restart=always` and `RestartSec=10`, sets `RUST_LOG=info`, and restricts the service with `ProtectSystem=strict`, `ProtectHome=read-only`, `PrivateTmp=true` and `ReadWritePaths=/var/lib/rivetr /home/rivetr`. Only the `CAP_NET_BIND_SERVICE` capability is retained.

## First run

Open `http://your-server-ip:8080`. On a fresh instance the dashboard redirects to `/setup`, where you create the first user. That user becomes the instance admin and the owner of a default Personal team.

The admin token printed by the installer is for API access and offline tasks. It is not the dashboard login.

If the server has a public hostname, set `[proxy] instance_domain` and configure HTTPS before exposing the dashboard. See [Domains and HTTPS](/docs/domains-and-https).

## Service management

```bash
sudo systemctl status rivetr
sudo systemctl start rivetr
sudo systemctl stop rivetr
sudo systemctl restart rivetr

sudo journalctl -u rivetr -f
sudo journalctl -u rivetr -n 100 --no-pager
```

Configuration edits in `/opt/rivetr/rivetr.toml` require a restart. Instance settings changed from the dashboard are stored in the database and apply without a restart. Per-app settings live in the database too.

## Re-running the installer

The installer preserves the existing config and data, replaces the binary and starts the service. It does not restart an already running service, so after an in-place update run:

```bash
sudo systemctl restart rivetr
```

See [Upgrading](/docs/upgrading) for backups, version pinning and rollback caveats.

## Manual installation

Use this when you want to control the runtime, config or service unit yourself.

### 1. Install the runtime

Ubuntu or Debian:

```bash
sudo apt update && sudo apt install -y docker.io git
sudo systemctl enable --now docker
```

Fedora, RHEL or Rocky Linux:

```bash
sudo dnf install -y docker git
sudo systemctl enable --now docker
```

Podman works instead of Docker. Rivetr selects a runtime with `[runtime] runtime_type` (`auto`, `docker` or `podman`).

### 2. Download the binary

Download the release asset for your architecture from the [GitHub releases page](https://github.com/KwaminaWhyte/rivetr/releases). Assets are named `rivetr-<version>-linux-<arch>`, for example `rivetr-v1.0.0-linux-x86_64`.

```bash
sudo mkdir -p /opt/rivetr
sudo curl -L -o /opt/rivetr/rivetr \
  https://github.com/KwaminaWhyte/rivetr/releases/download/v1.0.0/rivetr-v1.0.0-linux-x86_64
sudo chmod +x /opt/rivetr/rivetr
sudo setcap 'cap_net_bind_service=+ep' /opt/rivetr/rivetr
```

Re-apply `setcap` after replacing the binary.

### 3. Create the service user and directories

```bash
sudo useradd --system --create-home --shell /usr/sbin/nologin rivetr
sudo usermod -aG docker rivetr
sudo mkdir -p /var/lib/rivetr
sudo chown -R rivetr:rivetr /opt/rivetr /var/lib/rivetr
```

### 4. Write the configuration

```bash
ADMIN_TOKEN=$(openssl rand -hex 32)

sudo tee /opt/rivetr/rivetr.toml > /dev/null << EOF
[server]
host = "0.0.0.0"
api_port = 8080
proxy_port = 80
proxy_https_port = 443
data_dir = "/var/lib/rivetr"

[auth]
admin_token = "$ADMIN_TOKEN"

[runtime]
runtime_type = "auto"

[proxy]
acme_enabled = true
acme_email = "admin@example.com"

[logging]
level = "info"
EOF

echo "Admin token: $ADMIN_TOKEN"
```

Every key is documented in the configuration reference. Instance settings in the database override the file.

### 5. Create the systemd service

```bash
sudo tee /etc/systemd/system/rivetr.service > /dev/null << 'EOF'
[Unit]
Description=Rivetr PaaS
After=network-online.target docker.service
Requires=docker.service

[Service]
Type=simple
User=rivetr
WorkingDirectory=/opt/rivetr
ExecStart=/opt/rivetr/rivetr --config /opt/rivetr/rivetr.toml
Restart=always
RestartSec=10
Environment=RUST_LOG=info
AmbientCapabilities=CAP_NET_BIND_SERVICE
CapabilityBoundingSet=CAP_NET_BIND_SERVICE
ProtectSystem=strict
ProtectHome=read-only
PrivateTmp=true
ReadWritePaths=/var/lib/rivetr /home/rivetr

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable --now rivetr
```

### 6. Open the firewall

```bash
# UFW (Ubuntu, Debian)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 8080/tcp

# firewalld (Fedora, RHEL, Rocky)
sudo firewall-cmd --permanent --add-port={80,443,8080}/tcp
sudo firewall-cmd --reload
```

Then open `http://your-server-ip:8080` and complete setup.

## Development setup

Backend and frontend run separately. The backend serves the API and the compiled dashboard; the Vite dev server proxies `/api/` to it.

```bash
git clone https://github.com/KwaminaWhyte/rivetr.git
cd rivetr
cp rivetr.example.toml rivetr.local.toml
cargo watch -x "run -- --config rivetr.local.toml"
```

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` for hot module reload, or `http://localhost:8080` for the embedded build. `cargo watch` is optional; `cargo run -- --config rivetr.local.toml` works without it.

Checks before committing:

```bash
cargo fmt --check
cargo clippy
cargo test

cd frontend
npm run lint
npm run build
```

## Ansible

The repository includes `ansible/rivetr.yml` for automated provisioning on Ubuntu 22.04, Ubuntu 24.04 and Debian 12.

```bash
ansible-playbook -i inventory rivetr.yml
```

Set the inventory host group `rivetr`, then adjust the playbook vars for domain, admin email and password, JWT secret, version, data directory, install directory and ports. Tags select parts of the run: `setup`, `docker`, `rivetr` and `firewall`.
