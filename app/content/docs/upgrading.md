# Upgrading

Rivetr 1.0.0 is a single binary. Upgrading means replacing that binary and restarting the systemd service. Database migrations run automatically at startup, so there is no separate migration command.

## Before you upgrade

Take a backup of the data directory and the config. This captures the SQLite database, certificates, encryption key material and settings:

```bash
sudo systemctl stop rivetr

sudo tar -czf rivetr-pre-upgrade-$(date +%Y%m%d-%H%M%S).tar.gz \
  /var/lib/rivetr \
  /opt/rivetr/rivetr.toml

sudo systemctl start rivetr
```

The built-in backup command runs without stopping the service and archives the database, config, certificates and service database dumps:

```bash
rivetr --config /opt/rivetr/rivetr.toml backup --output ./rivetr-backup.tar.gz
```

It does not include `.encryption_key` or `.encryption_salt`. Copy those separately, or use the full data directory archive above.

At minimum, keep these files:

| File | Why |
|---|---|
| `<data_dir>/rivetr.db` | Applications, deployments, users, settings |
| `<data_dir>/.encryption_key` | Decrypts secrets stored in the database |
| `<data_dir>/.encryption_salt` | Salt for the ENC2 encryption format |
| `/opt/rivetr/rivetr.toml` | Server configuration |
| `<data_dir>/acme/` | ACME account and certificates |

Read the release notes for the target version before starting. Check the instance is healthy and no deployment or backup is running.

## Built-in update check and apply

Rivetr checks GitHub Releases for a newer version and can download and install it. In the dashboard, open **Settings > Updates**. The same operations are available over the API:

```bash
# Current version and update status
curl -s http://localhost:8080/api/system/version \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Check now
curl -X POST http://localhost:8080/api/system/update/check \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Download the latest binary
curl -X POST http://localhost:8080/api/system/update/download \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Replace the binary
curl -X POST http://localhost:8080/api/system/update/apply \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

`apply` replaces `/opt/rivetr/rivetr`, marks the previous binary as a `.bak` file next to it (or `/tmp/rivetr.bak`) and returns `restart_required: true`. It does not restart the service. The new version starts only after an external restart:

```bash
sudo systemctl restart rivetr
```

This split is deliberate: the API cannot reliably restart the process that is serving the request. The dashboard states that the restart causes a short downtime.

### Automatic updates

The `[auto_update]` table controls the background checker:

```toml
[auto_update]
enabled = true
auto_apply = false
check_interval_hours = 6
github_repo = "KwaminaWhyte/rivetr"
include_prereleases = false
```

With `auto_apply = true`, the background loop downloads and replaces the binary on its schedule, but it still does not restart the service. The new binary takes effect at the next manual restart, reboot or service restart. Update channel (stable or beta) and schedules are also set in **Settings > Updates**.

## Re-run the installer

The one-line installer is the simplest manual upgrade path. It preserves `/opt/rivetr/rivetr.toml` and `/var/lib/rivetr`, replaces the binary and leaves the service definition in place:

```bash
curl -fsSL https://raw.githubusercontent.com/KwaminaWhyte/rivetr/main/install.sh | sudo RIVETR_VERSION=v1.0.0 bash
```

The installer calls `systemctl start rivetr`, which is a no-op on an already running service. Restart it explicitly:

```bash
sudo systemctl restart rivetr
```

Omitting `RIVETR_VERSION` installs the latest release. To stay on a specific version, pass it on every run.

## Version pinning

`RIVETR_VERSION` accepts a release tag such as `v1.0.0`. It defaults to `latest`. Pin production installs so an unplanned installer run does not move the binary. Upgrade by changing the value, and downgrade by running the installer again with the older tag, subject to the caveats below.

The binary itself reports its version at the CLI and through `GET /api/system/version`.

## Database migrations

Migrations are numbered SQL files embedded in the binary. They run in order at startup, inside the service start, before the API begins serving. A failed migration stops startup; inspect `journalctl -u rivetr` and restore the pre-upgrade backup before retrying.

Restoring an older database backup and starting a newer binary is safe: the newer binary replays any migrations the backup has not seen. The reverse, an older binary against a newer schema, is not a supported upgrade path.

## Rollback and downgrade caveats

Keep the previous binary until the new version has run for a while. The built-in updater writes a `.bak` file; a re-installed or manually replaced binary does not. To roll back the binary:

```bash
sudo systemctl stop rivetr
sudo mv /opt/rivetr/rivetr /opt/rivetr/rivetr.failed
sudo cp /opt/rivetr/rivetr.bak /opt/rivetr/rivetr
sudo systemctl start rivetr
```

Two 1.0 changes affect downgrades.

### Secrets in ENC2 format

New and updated secrets are written with an `ENC2:` prefix. The format uses AES-256-GCM with a subkey derived through HKDF-SHA256; the salt lives in `<data_dir>/.encryption_salt`. Back up that file together with `.encryption_key` and the database.

An older Rivetr binary cannot read `ENC2:` values. After the new version has saved any secret, downgrading will leave env vars, SSH keys or provider credentials unreadable. If you must downgrade, restore the pre-upgrade database and key material as well as the old binary, and expect to re-enter any secrets created since the backup.

### SSH host key pinning

Rivetr pins SSH host keys on first connection. The first connection to each remote server or build server after upgrading pins whatever key that host presents. Verify the fingerprints out of band before upgrading, otherwise a changed host key is silently trusted once.

To clear a pin and accept a new key:

```bash
# Remote server
curl -X DELETE http://localhost:8080/api/servers/SERVER_ID/host-key \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Build server
curl -X DELETE http://localhost:8080/api/build-servers/SERVER_ID/host-key \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

Git clone connections are unchanged by this behavior.

## Downtime

The API, dashboard, scheduler and embedded reverse proxy all live in the Rivetr process. Restarting it drops the proxy listener and the control plane for the length of the restart, typically a few seconds. Application containers keep running throughout; only inbound traffic through the proxy fails while the listener is down.

Plan the restart for a quiet period. On a multi-server install, containers on remote servers also keep running, but Rivetr cannot reconcile or deploy while it is down.

## Verify the upgrade

```bash
sudo systemctl status rivetr
sudo journalctl -u rivetr -n 100 --no-pager

curl -s http://localhost:8080/api/system/version \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

Then confirm in the dashboard that the version is the expected one, apps report healthy, and a deployment completes. If startup fails, restore the backup from the first section and the previous binary.
