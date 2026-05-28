# Quick Start

Get Rivetr running and deploy your first app in under 10 minutes.

## Prerequisites

- A Linux server (Ubuntu 22.04+ or Debian 12+ recommended) with root access
- A Git repository you want to deploy (GitHub, GitLab, Gitea, or Bitbucket)
- Ports 80, 443, and 8080 open in your firewall

---

## Step 1: Install Rivetr

Run the one-line installer on your server:

```bash
curl -fsSL https://raw.githubusercontent.com/KwaminaWhyte/rivetr/main/install.sh | sudo bash
```

The script:
1. Installs Docker (if not already present)
2. Downloads the Rivetr binary from GitHub Releases
3. Installs build tools: Git, Nixpacks, Railpack, Pack CLI
4. Creates a `rivetr` system user
5. Writes `/opt/rivetr/rivetr.toml` with a generated admin token
6. Registers and starts a systemd service
7. Opens firewall ports 80, 443, and 8080

After it finishes:

```
Dashboard:   http://your-server-ip:8080
Config:      /opt/rivetr/rivetr.toml
Data:        /var/lib/rivetr
Logs:        sudo journalctl -u rivetr -f
```

To install a specific version:

```bash
RIVETR_VERSION=v0.2.6 curl -fsSL https://raw.githubusercontent.com/KwaminaWhyte/rivetr/main/install.sh | sudo bash
```

---

## Step 2: Create Your Admin Account

Open `http://your-server-ip:8080` in your browser. On the first visit you will be prompted to create an admin account. Fill in a username, email, and password.

Once created, you are logged in and on the dashboard.

---

## Step 3: Connect Your Git Repository

### Option A — Personal Access Token (simplest)

1. Go to **Settings → Git Providers** and click **Add Provider**.
2. Choose your provider (GitHub, GitLab, Gitea, or Bitbucket).
3. Paste a personal access token with repo-read permissions.
4. Click **Save**.

### Option B — GitHub App (recommended for GitHub)

1. Go to **Settings → GitHub Apps** and click **Create GitHub App**.
2. Follow the manifest flow — Rivetr creates the app on your behalf.
3. Install it on the repositories you want to deploy.

---

## Step 4: Create Your First App

1. Click **New App** from the dashboard.
2. Select the connected Git provider and pick your repository.
3. Choose the branch to deploy (e.g. `main`).
4. Set the **port** your app listens on (e.g. `3000`).
5. Pick a **build type** (Rivetr auto-detects if you leave it on Auto).
6. Click **Deploy**.

Rivetr will clone the repo, build it, start the container, run a health check, and switch the proxy — all in one pipeline.

---

## Step 5: Set Up a Webhook (Automatic Deploys)

To deploy automatically on every `git push`:

1. Open your app in the dashboard and go to the **Webhooks** tab.
2. Copy the webhook URL shown (e.g. `https://your-server:8080/webhooks/github`).
3. In your GitHub repository go to **Settings → Webhooks → Add webhook**.
4. Paste the URL, set content type to `application/json`, and enter the secret shown in the dashboard.
5. Select **Just the push event** and save.

From now on, every push to the tracked branch triggers a deploy automatically.

---

## What's Next?

| Topic | Where to look |
|-------|--------------|
| Build types (Dockerfile, Nixpacks, Heroku…) | [Build Types](/docs/build-types) |
| Custom domains and HTTPS | [Domains & HTTPS](/docs/domains-and-https) |
| Environment variables | [Environment Variables](/docs/environment-variables) |
| Databases | [Databases](/docs/databases) |
| Full configuration reference | [Configuration](/docs/configuration) |
| REST API | [REST API](/docs/api) |
