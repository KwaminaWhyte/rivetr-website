# Multi-Server and Scale

Rivetr can deploy to multiple remote servers, offload builds to dedicated build nodes, scale apps with container replicas and round-robin load balancing, and coordinate clusters with Docker Swarm.

---

## Registering Remote Servers

Any Linux server accessible over SSH can be registered as a deployment target.

1. Go to **Settings → Servers → Add Server**.
2. Enter the server hostname/IP, SSH port, and SSH credentials (password or key).
3. Click **Check Connection** to verify.
4. Optionally click **Install Docker** to have Rivetr install Docker Engine on the server automatically.

Via the API:

```bash
curl -X POST https://your-server/api/servers \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "prod-eu",
    "host": "185.0.0.1",
    "port": 22,
    "username": "root",
    "private_key": "-----BEGIN OPENSSH PRIVATE KEY-----\n..."
  }'
```

Check server health:

```bash
curl -X POST https://your-server/api/servers/<id>/check \
  -H "Authorization: Bearer <token>"
```

---

## Assigning Apps to Servers

By default, apps deploy to the local server. To deploy to a remote server, assign the app:

```bash
curl -X POST https://your-server/api/servers/<server_id>/apps/<app_id> \
  -H "Authorization: Bearer <token>"
```

The deployment pipeline runs on the remote server: clone, build, start, health check, and proxy update all happen there.

---

## Browser-Based Remote Terminal and Filesystem

Once a server is registered, you can:

- **Open a terminal** in the browser — `wss://your-server/api/servers/<id>/terminal?token=<token>`
- **Browse, read, write, and delete files** on the remote server via the dashboard or API:

```bash
# Browse files
curl "https://your-server/api/servers/<id>/files?path=/var/log" \
  -H "Authorization: Bearer <token>"

# Read file content
curl "https://your-server/api/servers/<id>/files/content?path=/etc/nginx/nginx.conf" \
  -H "Authorization: Bearer <token>"

# Write file content
curl -X PUT "https://your-server/api/servers/<id>/files/content?path=/etc/nginx/nginx.conf" \
  -H "Authorization: Bearer <token>" \
  --data-binary @nginx.conf
```

---

## Build Servers

Offload builds to a dedicated node so your production server's CPU is not consumed during builds.

```bash
# Register a build server
curl -X POST https://your-server/api/build-servers \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "builder-1",
    "host": "10.0.0.5",
    "port": 22,
    "username": "root",
    "private_key": "..."
  }'

# Check build server health
curl -X POST https://your-server/api/build-servers/<id>/check \
  -H "Authorization: Bearer <token>"
```

When a build server is registered and healthy, Rivetr routes new builds to it and copies the resulting image to the target server after build.

---

## Container Replicas and Load Balancing

Scale an app horizontally by running multiple container replicas. The embedded proxy distributes traffic across replicas using round-robin.

```bash
# Set replica count
curl -X PUT https://your-server/api/apps/<app_id>/replicas/count \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"count": 3}'

# List replicas
curl https://your-server/api/apps/<app_id>/replicas \
  -H "Authorization: Bearer <token>"

# Restart a specific replica
curl -X POST https://your-server/api/apps/<app_id>/replicas/<index>/restart \
  -H "Authorization: Bearer <token>"
```

All replicas are started from the same image on the same server. For cross-server distribution, use Docker Swarm.

---

## Docker Swarm

For cluster-level orchestration, Rivetr can initialize and manage a Docker Swarm.

### Initialize a Swarm

```bash
curl -X POST https://your-server/api/swarm/init \
  -H "Authorization: Bearer <token>"
```

### Manage Nodes

```bash
# List nodes
curl https://your-server/api/swarm/nodes \
  -H "Authorization: Bearer <token>"

# Sync nodes from Docker
curl -X POST https://your-server/api/swarm/sync-nodes \
  -H "Authorization: Bearer <token>"

# Update node availability
curl -X PUT https://your-server/api/swarm/nodes/<id>/availability \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"availability": "active"}'
```

### Swarm Services

```bash
# Create a Swarm service
curl -X POST https://your-server/api/swarm/services \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "my-api", "image": "my-api:latest", "replicas": 3}'

# Scale a service
curl -X POST https://your-server/api/swarm/services/<id>/scale \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"replicas": 5}'

# Stream service logs
curl https://your-server/api/swarm/services/<id>/logs \
  -H "Authorization: Bearer <token>"
```

---

## Container Registry Push

After building an image, Rivetr can push it to a container registry before deploying. Configure this in the app settings or `deploy.toml`:

```toml
[build]
registry = "registry.example.com"
registry_image = "my-org/my-api"
```

Useful when you want to pull the image on a remote server without transferring the build context directly.

---

## Automated Server Provisioning with Ansible

For repeatable, automated setup of Ubuntu/Debian servers, Rivetr ships an Ansible playbook:

```bash
# Clone the repo
git clone https://github.com/KwaminaWhyte/rivetr.git

# Edit inventory
vim ansible/inventory.ini

# Run the playbook
ansible-playbook -i ansible/inventory.ini ansible/rivetr.yml
```

The playbook installs Docker, downloads the Rivetr binary, configures systemd, and opens the required ports.
