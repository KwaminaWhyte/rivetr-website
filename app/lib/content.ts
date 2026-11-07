// Single source of truth for all marketing copy and data.
// Numbers verified against the Rivetr 1.0.0 README and changelog (2026-11-07).

export const SITE = {
  name: "Rivetr",
  version: "1.0.0",
  released: "5 November 2026",
  tagline: "Self-hosted PaaS in a single binary",
  description:
    "Deploy apps from Git with one binary. 52 MB RSS with 30 containers, no Redis, no PostgreSQL, no Traefik. Docker and Podman, automatic HTTPS, zero-downtime deploys. Open source, MIT.",
  github: "https://github.com/KwaminaWhyte/rivetr",
  releases: "https://github.com/KwaminaWhyte/rivetr/releases",
  docs: "/docs",
  repoDocs: "https://github.com/KwaminaWhyte/rivetr/tree/main/docs",
  license: "MIT",
  installCmd:
    "curl -fsSL https://raw.githubusercontent.com/KwaminaWhyte/rivetr/main/install.sh | sudo bash",
} as const;

export const HERO = {
  title: "Deploy from Git.\nOne binary. 52 MB.",
  subtitle:
    "Rivetr is a self-hosted platform as a service in a single Rust binary: embedded SQLite, embedded reverse proxy, automatic HTTPS, and 365 one-click services. No Redis. No PostgreSQL. No Traefik. Just Docker or Podman.",
  primaryCta: { label: "Get started", href: "/docs/quick-start" },
  secondaryCta: { label: "Star on GitHub", href: SITE.github },
} as const;

// What shipped in 1.0.0. Kept short; the changelog has the full list.
export const RELEASE_HIGHLIGHTS = [
  {
    icon: "LayoutDashboard",
    title: "A rebuilt dashboard",
    body: "Grouped sidebar, breadcrumb switchers, a status pill, and consistent sections across apps, databases, and services.",
    href: "/docs/quick-start",
  },
  {
    icon: "Wand2",
    title: "Projects canvas",
    body: "A zoomable map of every project, environment, and resource with live status. Switch between list, grid, and canvas.",
    href: "/features#features",
  },
  {
    icon: "Palette",
    title: "Make it yours",
    body: "Per-user theme customisation: light, dark, or system, accent, neutral, radius, density, font, and accessibility options.",
    href: "/features#features",
  },
  {
    icon: "Fingerprint",
    title: "Passkeys and traffic analytics",
    body: "Sign in with a passkey, then see per-app, per-server, and per-team traffic with optional GeoIP country breakdown.",
    href: "/features#features",
  },
  {
    icon: "Boxes",
    title: "Real Docker Compose deploys",
    body: "Deploy, build, hook, and roll back compose services by image digest, with encrypted env vars and per-container terminals.",
    href: "/docs/services",
  },
  {
    icon: "DatabaseBackup",
    title: "Rollback with data",
    body: "Snapshot linked PostgreSQL, MySQL, MariaDB, MongoDB, Redis, and KeyDB databases before a deploy, then restore on rollback.",
    href: "/docs/backups",
  },
] as const;

export type Feature = {
  title: string;
  description: string;
  icon: string;
  badge?: string;
};

export type FeatureGroup = {
  name: string;
  blurb: string;
  features: Feature[];
};

export const FEATURE_GROUPS: FeatureGroup[] = [
  {
    name: "Deploy from Git",
    blurb: "Clone, build, check, switch. The whole path from push to live.",
    features: [
      {
        title: "Git-native deploys",
        description:
          "GitHub, GitLab, Gitea, Bitbucket, or any Git URL. Webhook signature verification, deploy by branch, commit SHA, or tag.",
        icon: "GitBranch",
      },
      {
        title: "Any build type",
        description:
          "Dockerfile, Nixpacks, Railpack, Cloud Native Buildpacks, static sites, or a prebuilt image. Auto-detected per app.",
        icon: "Package",
      },
      {
        title: "Zero-downtime releases",
        description:
          "Health check, atomic proxy switch, then drain in-flight requests from the old container. Automatic rollback when the check fails.",
        icon: "RefreshCw",
      },
      {
        title: "Preview environments",
        description:
          "Every pull request gets its own subdomain, on all four Git providers. Preview apps are removed when the PR closes or merges.",
        icon: "GitPullRequest",
      },
    ],
  },
  {
    name: "Platform services",
    blurb: "The supporting infrastructure, provisioned from the same dashboard.",
    features: [
      {
        title: "Managed databases",
        description:
          "PostgreSQL 18, MySQL, MariaDB, MongoDB, Redis, DragonflyDB, KeyDB, ClickHouse, and LibSQL. Link one to an app and its env vars are injected.",
        icon: "Database",
      },
      {
        title: "Docker Compose services",
        description:
          "Deploy with a button, build from Git or a server path, run pre- and post-deploy hooks, and roll back by image digest.",
        icon: "Boxes",
        badge: "1.0",
      },
      {
        title: "365 service templates",
        description:
          "AI, analytics, CMS, monitoring, security, and more, across 26 categories. One click, encrypted variables, running.",
        icon: "LayoutGrid",
      },
      {
        title: "Scheduled jobs and restarts",
        description:
          "Cron-based commands inside running containers, plus zero-downtime scheduled restarts with run history and failure notifications.",
        icon: "Clock",
      },
    ],
  },
  {
    name: "Teams and security",
    blurb: "Multi-tenant from the first login, encrypted at rest, audited throughout.",
    features: [
      {
        title: "Passkeys, 2FA, and SSO",
        description:
          "Passkey sign-in, TOTP with recovery codes, OAuth through five providers, and any OpenID Connect provider for SSO.",
        icon: "Fingerprint",
        badge: "1.0",
      },
      {
        title: "Roles and permissions",
        description:
          "Five role presets built from 24 abilities, custom roles per team, per-member resource overrides, and view-only app sharing.",
        icon: "Users",
      },
      {
        title: "Encrypted secrets",
        description:
          "AES-256-GCM with a versioned format and per-install salt. External managers: Vault, OpenBao, Infisical, Doppler, AWS Secrets Manager.",
        icon: "ShieldCheck",
      },
      {
        title: "Scoped API tokens",
        description:
          "rvt_ tokens stored as SHA-256 hashes, with six scopes, optional team or project limits, expiry, pause, and roll.",
        icon: "KeyRound",
      },
    ],
  },
  {
    name: "Operations",
    blurb: "Know what is running, why it broke, and what to do next.",
    features: [
      {
        title: "Live logs and search",
        description:
          "Stream over WebSocket or SSE, search deployment history, and set per-app retention. Long lines stay inside the log pane.",
        icon: "ScrollText",
      },
      {
        title: "Metrics and traffic",
        description:
          "Prometheus /metrics, health-check latency, uptime, and per-app, per-server, and per-team traffic with optional GeoIP.",
        icon: "Activity",
        badge: "1.0",
      },
      {
        title: "Crash recovery",
        description:
          "Restart with exponential backoff and configurable limits. Apply CPU and memory limits live with docker update, no redeploy.",
        icon: "HeartPulse",
      },
      {
        title: "Deploy controls",
        description:
          "Approvals, freeze windows, scheduled deploys, watch paths, ZIP uploads, and cancellation of queued or running deployments.",
        icon: "GitMerge",
      },
    ],
  },
  {
    name: "Developer experience",
    blurb: "A dashboard, a terminal, an editor, and an API. Pick your surface.",
    features: [
      {
        title: "Projects canvas",
        description:
          "A zoomable view of projects, environments, and resources with live status, filters, and a side panel. Also list and grid views.",
        icon: "LayoutDashboard",
        badge: "1.0",
      },
      {
        title: "Browser terminal and files",
        description:
          "Shell into containers and remote SSH servers, and browse, read, write, or delete files on any registered server.",
        icon: "TerminalSquare",
      },
      {
        title: "TUI, CLI, and MCP",
        description:
          "rivetr tui for a keyboard-driven dashboard, a full CLI, and a built-in MCP server with 11 tools for AI assistants.",
        icon: "Bot",
      },
      {
        title: "Theme customisation",
        description:
          "Each user picks mode, accent, neutral, radius, density, font, sidebar style, reduced motion, and high contrast.",
        icon: "Palette",
        badge: "1.0",
      },
    ],
  },
  {
    name: "Scale and backup",
    blurb: "More servers, more replicas, and a way back when something goes wrong.",
    features: [
      {
        title: "Multi-server deploys",
        description:
          "Build once, then roll the image to servers in batches, with health checks per container and traffic shifting batch by batch.",
        icon: "Server",
      },
      {
        title: "Docker Swarm",
        description:
          "Initialise a swarm, manage nodes, scale services, and tune the service spec with placement, update, and rollback policy.",
        icon: "Network",
      },
      {
        title: "Build servers and registries",
        description:
          "Offload builds to dedicated nodes and push the finished image to any registry, or stream it over SSH when no registry is available.",
        icon: "Hammer",
      },
      {
        title: "Database, volume, and instance backups",
        description:
          "On a schedule, to local disk or S3-compatible storage, with retention and one-click restore. S3 downloads are checked against the stored size and SHA-256 first.",
        icon: "CloudUpload",
      },
    ],
  },
];

export type CompareRow = {
  feature: string;
  rivetr: string | boolean;
  coolify: string | boolean;
  dokploy: string | boolean;
};

// Verified against the vendors' docs and releases on 2026-11-07:
// Coolify v4.6.0, Dokploy v0.31.0.
export const COMPARE: CompareRow[] = [
  {
    feature: "Control plane memory",
    rivetr: "52 MB RSS (30 containers)",
    coolify: "Not published (2 GB requested)",
    dokploy: "Not published (2 GB requested)",
  },
  {
    feature: "Services it runs",
    rivetr: "None",
    coolify: "Postgres, Redis, Traefik or Caddy",
    dokploy: "Postgres, Traefik",
  },
  { feature: "Single binary", rivetr: true, coolify: false, dokploy: false },
  {
    feature: "Container runtimes",
    rivetr: "Docker and Podman",
    coolify: "Docker",
    dokploy: "Docker",
  },
  {
    feature: "Git providers",
    rivetr: "4 plus any Git URL",
    coolify: "4 plus any Git URL",
    dokploy: "4 plus any Git URL",
  },
  {
    feature: "Preview deployments",
    rivetr: "All 4 providers",
    coolify: "All 4 providers",
    dokploy: "GitHub only",
  },
  {
    feature: "MCP server",
    rivetr: "Built in",
    coolify: "Built in",
    dokploy: "Separate package",
  },
  {
    feature: "Web terminal",
    rivetr: "Containers and servers",
    coolify: "Yes (v4.0+)",
    dokploy: "Yes",
  },
  {
    feature: "Terminal UI and CLI",
    rivetr: "TUI and CLI",
    coolify: "CLI only",
    dokploy: "CLI only",
  },
  {
    feature: "File browser",
    rivetr: "Containers and servers",
    coolify: "Containers (beta)",
    dokploy: false,
  },
  {
    feature: "License",
    rivetr: "MIT",
    coolify: "Apache 2.0",
    dokploy: "Apache 2.0 plus proprietary",
  },
];

export const STEPS = [
  {
    n: "01",
    title: "Install the binary",
    body: "One command installs Docker if needed, build tools, the latest Rivetr binary, a systemd unit, and a config with a generated admin token.",
    code: "curl -fsSL https://raw.githubusercontent.com/KwaminaWhyte/rivetr/main/install.sh | sudo bash",
  },
  {
    n: "02",
    title: "Connect a repo",
    body: "Add a Git provider or GitHub App, create an app, and point it at a repository. Rivetr detects the build type or you pin one.",
    code: "rivetr deploy my-app",
  },
  {
    n: "03",
    title: "Push to deploy",
    body: "Every push builds, health checks, and swaps traffic atomically. Certificates are provisioned automatically for your domains.",
    code: "git push origin main   # live in seconds",
  },
];

export const FAQS = [
  {
    q: "How is Rivetr so lightweight?",
    a: "It is one Rust process. SQLite in WAL mode replaces PostgreSQL, the embedded proxy replaces Traefik, and Tokio handles the async work. The proxy keeps its route table in memory and swaps it atomically on deploy, so there is no proxy subprocess or message queue. Measured on 1.0.0 with 30 containers, the process used 52 MB RSS; the release binary is 47 MB.",
  },
  {
    q: "Is it production-ready?",
    a: "Yes. Rivetr 1.0.0 shipped on 5 November 2026 after more than a year of releases. It includes zero-downtime deploys with health checks and rollback, automatic HTTPS with per-domain certificates and HTTP/2, encrypted secrets, RBAC, audit logs, passkeys and 2FA, deploy approvals and freeze windows, multi-server deploys, Swarm, and scheduled backups with tested restores.",
  },
  {
    q: "Docker or Podman?",
    a: "Both. Rivetr auto-detects whichever is available. Docker uses the socket API; Podman is driven through its CLI. A few Docker-only conveniences, such as container storage usage and real-time event streaming, stay hidden or fall back under Podman.",
  },
  {
    q: "How does it compare to Coolify and Dokploy?",
    a: "All three are self-hosted PaaS tools with Git-driven deploys. Rivetr runs as a single binary with no Redis, PostgreSQL, or Traefik, uses 52 MB RSS in our measurement with 30 containers, supports Podman, and ships a TUI plus a built-in MCP server. Coolify also has a built-in MCP server and a web terminal; Dokploy's MCP server is a separate package and its preview deployments are GitHub-only. See the comparison table for the verified details.",
  },
  {
    q: "What changed in 1.0?",
    a: "A rebuilt dashboard with grouped navigation and a zoomable projects canvas, per-user theme customisation, passkey sign-in, traffic analytics, deployable Docker Compose services with rollback by digest, pre-deploy database snapshots restored on rollback, server operations (Docker cleanup and OS patching), and 365 service templates. The full list is in the changelog.",
  },
  {
    q: "Does Rivetr phone home?",
    a: "There is no usage telemetry. The only outbound check is an update check against GitHub Releases, every six hours by default. Set [auto_update] enabled = false to turn it off entirely.",
  },
  {
    q: "What does it cost?",
    a: "Nothing. Rivetr is MIT licensed. Self-host it on any server you own or rent, with no seat limits, paid tiers, or feature gates.",
  },
  {
    q: "Can I migrate from another platform?",
    a: "There is no automated importer. Most apps need a repository and a build type; Rivetr supports Dockerfile, Nixpacks, Railpack, Cloud Native Buildpacks, static sites, and prebuilt images. Projects can be exported and imported as JSON, and 365 service templates cover common supporting infrastructure.",
  },
];

// The platforms developers leave behind.
export const ALTERNATIVES = [
  "Vercel",
  "Heroku",
  "Netlify",
  "Railway",
  "Render",
  "Coolify",
  "Dokploy",
] as const;

export type TechItem = { name: string; slug: string };
export type TechRow = { label: string; items: TechItem[] };

export const TECH_STACK: TechRow[] = [
  {
    label: "Runtimes and languages",
    items: [
      { name: "Docker", slug: "docker" },
      { name: "Podman", slug: "podman" },
      { name: "Node.js", slug: "nodedotjs" },
      { name: "Python", slug: "python" },
      { name: "Go", slug: "go" },
      { name: "Rust", slug: "rust" },
      { name: "Ruby", slug: "ruby" },
      { name: "PHP", slug: "php" },
      { name: "Bun", slug: "bun" },
      { name: "Deno", slug: "deno" },
    ],
  },
  {
    label: "Databases",
    items: [
      { name: "PostgreSQL", slug: "postgresql" },
      { name: "MySQL", slug: "mysql" },
      { name: "MariaDB", slug: "mariadb" },
      { name: "MongoDB", slug: "mongodb" },
      { name: "Redis", slug: "redis" },
      { name: "ClickHouse", slug: "clickhouse" },
    ],
  },
  {
    label: "Git and registries",
    items: [
      { name: "GitHub", slug: "github" },
      { name: "GitLab", slug: "gitlab" },
      { name: "Gitea", slug: "gitea" },
      { name: "Bitbucket", slug: "bitbucket" },
      { name: "Docker Hub", slug: "docker" },
    ],
  },
];

export type TemplateCategory = {
  name: string;
  icon: string;
  examples: string[];
};

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  { name: "AI / LLM", icon: "Bot", examples: ["Ollama", "Open WebUI", "LiteLLM"] },
  { name: "Analytics", icon: "BarChart3", examples: ["Plausible", "Matomo", "Metabase"] },
  { name: "CMS", icon: "FileText", examples: ["WordPress", "Ghost", "Strapi"] },
  { name: "Databases", icon: "Database", examples: ["PostgreSQL", "MongoDB", "Redis"] },
  { name: "Dev tools", icon: "Wrench", examples: ["Gitea", "Drone", "Vault"] },
  { name: "Monitoring", icon: "Activity", examples: ["Grafana", "Uptime Kuma", "Prometheus"] },
  { name: "Automation", icon: "Workflow", examples: ["n8n", "Node-RED", "Activepieces"] },
  { name: "Communication", icon: "MessagesSquare", examples: ["Rocket.Chat", "Mattermost", "Element"] },
  { name: "Files and media", icon: "FolderOpen", examples: ["Nextcloud", "Jellyfin", "MinIO"] },
  { name: "Search", icon: "Search", examples: ["Meilisearch", "Typesense", "SearXNG"] },
  { name: "Security", icon: "ShieldCheck", examples: ["Vaultwarden", "Authelia", "Keycloak"] },
  { name: "Project management", icon: "KanbanSquare", examples: ["Plane", "Vikunja", "Focalboard"] },
];

export const TEMPLATE_COUNT = 365;
export const TEMPLATE_CATEGORY_COUNT = 26;

export const NAV_LINKS = [
  { label: "Features", href: "/features" },
  { label: "Compare", href: "/#compare" },
  { label: "How it works", href: "/#how" },
  { label: "FAQ", href: "/#faq" },
  { label: "Docs", href: "/docs" },
];

// Security posture facts, shown as a trust band.
export const SECURITY_FACTS = [
  "AES-256-GCM secrets with a per-install salt",
  "Scoped rvt_ tokens stored as SHA-256 hashes",
  "Passkeys, TOTP 2FA, OIDC SSO",
  "Audit log and team-level 2FA enforcement",
  "CSP, HSTS, and SSH host key pinning",
  "Rate limits and per-account lockout",
] as const;
