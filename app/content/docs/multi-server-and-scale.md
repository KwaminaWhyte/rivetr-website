# Remote Servers and Scale

Rivetr can run an app on the local Docker host and on additional servers over SSH. The embedded proxy load balances across every healthy container, builds happen once, and deployments roll out in batches with per-container health checks and automatic rollback.

Remote servers are optional. A single-host install uses the same deployment pipeline with one target.

## Adding a server

Open Servers and choose Add Server. Enter a name, host or IP, SSH port, username and either an SSH private key or a password. Credentials are encrypted at rest with AES-256-GCM. Rivetr tests the SSH connection and checks that Docker is available before saving.

Servers are managed with:

| Method | Path |
|---|---|
| GET, POST | `/api/servers` |
| GET, PUT, DELETE | `/api/servers/{id}` |
| POST | `/api/servers/{id}/check` |
| POST | `/api/servers/{id}/install-docker` |
| POST | `/api/servers/{id}/fetch-details` |
| POST | `/api/servers/{id}/network-check` |
| DELETE | `/api/servers/{id}/host-key` |

The server list shows reachability, Docker status, container counts and resource usage. `localhost` refers to the machine running Rivetr.

## Non-root SSH users and sudo

Rivetr can connect as root or as an ordinary user. For a non-root user, every privileged command runs through `sudo -n`, which never prompts for a password. Docker commands go directly to `docker` when the user is in the `docker` group, and through `sudo -n docker` otherwise.

```bash
# On the server, as root. Replace deploy with your SSH user.
sudo adduser --disabled-password --gecos "" deploy
sudo mkdir -p /home/deploy/.ssh
echo "ssh-ed25519 AAAA... rivetr" | sudo tee /home/deploy/.ssh/authorized_keys
sudo chown -R deploy:deploy /home/deploy/.ssh
sudo chmod 700 /home/deploy/.ssh && sudo chmod 600 /home/deploy/.ssh/authorized_keys

echo "deploy ALL=(ALL) NOPASSWD: ALL" | sudo EDITOR='tee' visudo -f /etc/sudoers.d/rivetr
sudo chmod 440 /etc/sudoers.d/rivetr
sudo usermod -aG docker deploy
```

Verify as the SSH user with `sudo -n true && echo ok`. The connection check reports one of four privilege states: `Root user`, `Passwordless sudo`, `Sudo missing` (a password is required) or `Sudo missing (not installed)`. For the missing states the dashboard shows the exact sudoers line to add.

If you do not grant `NOPASSWD: ALL`, include at least `docker` (unless the user is in the docker group), `systemctl`, the host package manager, `ufw` or `firewall-cmd`, `ss`, `grep`, `tee`, `mkdir`, `sed` and `usermod`. Features whose command is not allowed fail without changing the server.

## Private networking with Tailscale

Set Connect via Tailscale when adding a server, or later in the server's Network section. Enter the Tailscale IP (`100.x.y.z`) or MagicDNS name. SSH health checks, server operations, the terminal and the file browser then use the tailnet address.

```bash
# On the Rivetr host and on each server
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up
tailscale ip -4
```

Rivetr does not manage the tailnet: it does not create auth keys, approve devices or edit ACLs. Both machines must already be on the same tailnet, and ACLs must allow the Rivetr host to reach SSH.

Check connectivity with `POST /api/servers/{id}/network-check`. It reports Tailscale status on the Rivetr host, a `tailscale ping` to the server, and whether the SSH port is reachable on the address Rivetr actually uses.

With private binding enabled (the default), remote app ports are published only on the Tailscale interface, for example `-p 100.x.y.z::<port>`, and the proxy connects over the tailnet. Without a private address the port is published on every interface and the proxy uses the public host; the deployment log and Servers card warn about this.

## One app on several servers

Open the app's Resources section and use the Servers card. Add the local host and/or registered servers, each with 1 to 10 containers, up to 20 servers total. An empty list keeps single-host behavior. For older API clients, `apps.server_id` remains the primary server, meaning the first placement entry.

Placement changes apply on the next deploy. Load balancing changes apply to the live pool when saved.

### What a deploy does

1. Build once, on the Rivetr host, the app's build server, or by pulling a registry image.
2. Distribute the image to every remote server.
3. Start containers in batches. Batch size is `max_unavailable` (default 1). Slots alternate between servers, so a batch does not land on one host only. Pre-deploy commands run once in the first container.
4. Health check every new container from the Rivetr host, against the address the proxy will use. Rivetr uses the app's HTTP or command health check, or a TCP readiness wait when none is configured.
5. Shift traffic after each batch. Healthy new containers join the proxy pool; old containers on the same slots leave it.
6. Roll back or finish. If the configured failure percentage is reached, every new container is removed and the previous containers keep serving. A value of 0 means any failure triggers rollback. Otherwise old containers drain and are removed. Post-deploy commands run once.

The deployment page lists each target with its batch, status, upstream address, error and logs. `GET /api/deployments/{id}/targets` returns the same data. Start, stop, restart and delete act on every server.

### Image distribution

Choose the mode on the Servers card:

| Mode | Behavior | Tradeoff |
|---|---|---|
| `auto` | Registry when the build was pushed, SSH streaming otherwise | Default, no extra configuration |
| `registry` | Push once, then `docker pull` on every server after a `docker login` fed on stdin | Fast and cache-friendly; every server must reach the registry |
| `ssh` | `docker save \| gzip` on the Rivetr host, piped into `gunzip \| docker load` over SSH | No registry; the full image crosses the network once per server per deploy |

Enable registry push for the app in its Rollback settings to make `auto` choose the registry path. Registry credentials are sent on stdin, never on a command line.

### Data and configuration

Env vars from the app, environment, project, team and linked databases are applied on every server. Values containing line breaks cannot be passed through the deployment env file and are skipped with a warning.

Volumes are per server. Each container mounts the app's volume paths on its own host; nothing is replicated or shared. Use a managed database, object storage or another shared service for state that must be common.

Per-domain internal ports are not published on remote servers. Domains route to the app port.

### Placement API

```bash
curl -X PUT https://rivetr.example.com/api/apps/APP_ID/placement \
  -H "Authorization: Bearer $RIVETR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "placements": [
      { "server_id": "localhost", "replicas": 2 },
      { "server_id": "SERVER_ID", "replicas": 1 }
    ],
    "settings": {
      "max_unavailable": 1,
      "failure_threshold_pct": 50,
      "distribution": "auto",
      "lb_policy": "round_robin",
      "sticky_sessions": false,
      "bind_private": true
    }
  }'
```

`GET /api/apps/{id}/placement` returns the placement, settings, server count and live upstreams. `GET /api/apps/placement-counts` returns a map of app ID to server count. An empty placements list turns multi-server mode off.

## Load balancing and replicas

The proxy balances a domain across every healthy container:

- `round_robin` (default) or `least_connections`.
- Passive health: a container that refuses or drops a connection is skipped for 10 seconds. Periodic proxy health checks still watch the pool.
- Sticky sessions: a `rivetr_upstream` cookie pins a browser to one container. The cookie holds an opaque hash, not the address, and is reassigned when the container is unhealthy.

Single-server apps can run 1 to 10 replicas with `PUT /api/apps/{id}/replicas/count` and a body such as `{"count": 3}`. An app with more than one server placement must be scaled through the Servers card or the placement API instead.

## Build servers

A build server offloads Docker builds over SSH. Register one under Servers > Build servers (`/servers/build`, API under `/api/build-servers`). Choose it per app.

The flow is: sync the build context with `rsync`, run `docker build` on the build server, then stream the image back with `docker save | gzip` into a local `docker load`. The deployment continues on the Rivetr host as usual. A build server uses its configured host, even when app servers connect over Tailscale.

Check a build server with `POST /api/build-servers/{id}/check`. Host keys are pinned per address; reset a changed key from the server's settings.

## Docker Swarm

Swarm support covers the cluster control plane and service lifecycle:

- `POST /api/swarm/init`, `GET /api/swarm/status`, `POST /api/swarm/leave`.
- `GET /api/swarm/nodes`, `POST /api/swarm/sync-nodes`, `PUT /api/swarm/nodes/{id}/availability`.
- `GET/POST /api/swarm/services`, `DELETE /api/swarm/services/{id}`, `POST /api/swarm/services/{id}/scale`, `GET /api/swarm/services/{id}/logs`.

The dashboard exposes the same operations under Servers > Swarm. Init and leave reset Docker's networking layer, which clears the container name records behind embedded DNS. Rivetr reconnects every container on the `rivetr` and `rivetr-app-*` networks before returning, so apps keep resolving databases and services by name.

Per-app advanced service settings cover placement constraints, update and rollback configuration, resource reservations and restart policy. App-bound services follow the app's access rules; host-wide Swarm operations are instance-admin only.

Overlay networking is not implemented. Rivetr does not create or attach Swarm services to overlay networks; containers stay on the standard Docker networks Rivetr manages. Do not expect a Swarm service to reach an app over an overlay network.

## Log drains

Each app can stream logs to an external provider under its Log Drains settings:

- Axiom
- New Relic
- Datadog
- Better Stack (Logtail)
- Generic HTTP endpoint

Drains are managed with `GET/POST /api/apps/{id}/log-drains`, `PUT/DELETE /api/apps/{id}/log-drains/{drain_id}`, and `POST /api/apps/{id}/log-drains/{drain_id}/test`. Test a drain after creating it and after rotating provider credentials.

## Server maintenance

The server page provides operational controls:

- Images: inventory of images and reclaimable space, with per-image deletion.
- Docker cleanup: settings under `/api/servers/{id}/maintenance`, manual runs with `POST /cleanup`, and history with `GET /cleanup/runs`.
- OS patching: check for updates, apply security updates, inspect installed patches (`/patching`, `/patching/check`, `/patching/update`, `/patches`).
- Security check: baseline checks on SSH, firewall and Docker (`/security-check`).
- Reboot: `POST /api/servers/{id}/reboot`.

Operations against `localhost` require instance-admin access. Containers are created with `--restart=unless-stopped`, so they return after a reboot.

## Remote terminal and file browser

Servers > [server] > Terminal opens an interactive SSH session in the browser. The Files tab browses and edits the remote filesystem. Both use the server's pinned host key and configured SSH credentials. Access is limited to instance administrators, or API tokens with the `admin` scope.
