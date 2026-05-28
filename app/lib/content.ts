// Single source of truth for all marketing copy + data.
// Numbers verified against the Rivetr README (2026-05).

export const SITE = {
  name: "Rivetr",
  tagline: "Self-hosted PaaS in a single binary",
  github: "https://github.com/KwaminaWhyte/rivetr",
  docs: "https://github.com/KwaminaWhyte/rivetr/tree/main/docs",
  license: "MIT",
  installCmd: "curl -fsSL https://rivetr.dev/install.sh | sh",
} as const;

export const HERO = {
  eyebrow: "Open source · MIT licensed",
  title: "Deploy from Git.\nOne binary. ~30MB RAM.",
  subtitle:
    "Rivetr is a self-hosted platform-as-a-service that ships as a single Rust binary — embedded database, embedded reverse proxy, automatic HTTPS. No Redis. No PostgreSQL. No Traefik. Just run it.",
  primaryCta: { label: "Get started", href: "#install" },
  secondaryCta: { label: "Star on GitHub", href: SITE.github },
} as const;

// Headline performance stats for the hero strip.
export const STATS = [
  { value: "~30MB", label: "RAM at idle", sub: "vs 400–800MB for Coolify" },
  { value: "0", label: "External dependencies", sub: "no Redis, Postgres, Traefik" },
  { value: "1", label: "Binary to deploy", sub: "embedded SQLite + proxy" },
  { value: "273", label: "Service templates", sub: "one-click, across 12 categories" },
] as const;

export type Feature = {
  title: string;
  description: string;
  icon: string; // lucide icon name
};

export type FeatureGroup = {
  name: string;
  blurb: string;
  features: Feature[];
};

export const FEATURE_GROUPS: FeatureGroup[] = [
  {
    name: "Core deployment",
    blurb: "Git in, running app out — with zero downtime and automatic rollback.",
    features: [
      {
        title: "Git-native deploys",
        description:
          "Webhooks from GitHub, GitLab, Gitea, and Bitbucket with signature verification. Deploy by branch, commit SHA, or tag.",
        icon: "GitBranch",
      },
      {
        title: "Any build type",
        description:
          "Dockerfile, Nixpacks, Railpack, Heroku/Paketo buildpacks, or static sites — auto-detected.",
        icon: "Package",
      },
      {
        title: "Zero-downtime releases",
        description:
          "Clone → build → start → health check → atomic proxy switch. Automatic rollback if the health check fails.",
        icon: "RefreshCw",
      },
      {
        title: "Preview environments",
        description:
          "Every pull request gets a unique subdomain, auto-cleaned when the PR closes or merges.",
        icon: "GitPullRequest",
      },
    ],
  },
  {
    name: "Platform services",
    blurb: "Databases, multi-container apps, and a 273-strong template gallery.",
    features: [
      {
        title: "Managed databases",
        description:
          "One-click PostgreSQL, MySQL, MongoDB, Redis, DragonFlyDB, KeyDB, ClickHouse — and LibSQL.",
        icon: "Database",
      },
      {
        title: "273 service templates",
        description:
          "AI/ML, analytics, CMS, monitoring, dev tools and more. Plus community-submitted templates.",
        icon: "LayoutGrid",
      },
      {
        title: "Docker Compose",
        description:
          "Deploy multi-container apps, with optional raw mode that skips network injection.",
        icon: "Boxes",
      },
      {
        title: "Scheduled jobs",
        description:
          "Cron-based command execution inside running containers, plus scheduled restarts.",
        icon: "Clock",
      },
    ],
  },
  {
    name: "Security & teams",
    blurb: "Multi-tenant from day one, with encryption at rest and SSO.",
    features: [
      {
        title: "Automatic HTTPS",
        description:
          "Let's Encrypt certificates with auto-renewal, handled by the embedded proxy.",
        icon: "Lock",
      },
      {
        title: "SSO & 2FA",
        description:
          "OAuth (GitHub, Google), OIDC (Auth0, Keycloak, Azure AD, Okta), and TOTP 2FA with recovery codes.",
        icon: "KeyRound",
      },
      {
        title: "RBAC + multi-tenant",
        description:
          "Owner / admin / developer / viewer roles with per-resource overrides and full team isolation.",
        icon: "Users",
      },
      {
        title: "Encrypted secrets",
        description:
          "AES-256-GCM for env vars and SSH keys at rest. Scoped API tokens stored as SHA-256 hashes.",
        icon: "ShieldCheck",
      },
    ],
  },
  {
    name: "Operations",
    blurb: "Logs, metrics, monitoring, and crash recovery built in.",
    features: [
      {
        title: "Live logs & search",
        description:
          "Real-time streaming over WebSocket/SSE, full-text search, per-app retention policies.",
        icon: "ScrollText",
      },
      {
        title: "Metrics & uptime",
        description:
          "Prometheus /metrics endpoint, uptime tracking, and a Recharts dashboard for CPU, memory, and history.",
        icon: "Activity",
      },
      {
        title: "Crash recovery",
        description:
          "Automatic restart with exponential backoff and configurable restart limits.",
        icon: "HeartPulse",
      },
      {
        title: "Resource limits, live",
        description:
          "Set CPU and memory caps per app and apply them live via docker update — no redeploy.",
        icon: "Gauge",
      },
    ],
  },
  {
    name: "Developer experience",
    blurb: "A modern dashboard, a TUI, a remote shell, and an MCP server for AI.",
    features: [
      {
        title: "Browser terminal & file browser",
        description:
          "Shell into containers and remote SSH servers, and browse/edit their filesystem from the dashboard.",
        icon: "TerminalSquare",
      },
      {
        title: "Terminal UI",
        description:
          "rivetr tui — a keyboard-driven dashboard to manage apps, deploys, and servers from any terminal.",
        icon: "SquareTerminal",
      },
      {
        title: "MCP server for AI",
        description:
          "Native Model Context Protocol server so Claude, Copilot and others can list, deploy, and inspect apps.",
        icon: "Bot",
      },
      {
        title: "Config snapshots & export",
        description:
          "Save and restore full app configuration; export and import entire projects as JSON.",
        icon: "Save",
      },
    ],
  },
  {
    name: "Scale & backup",
    blurb: "Multi-server, Swarm, build offload, and S3-compatible backups.",
    features: [
      {
        title: "Multi-server over SSH",
        description:
          "Register and deploy to remote servers, with browser terminal and file access for each.",
        icon: "Server",
      },
      {
        title: "Docker Swarm",
        description:
          "Init a swarm, manage nodes, and scale services across a cluster.",
        icon: "Network",
      },
      {
        title: "Build servers",
        description:
          "Offload heavy builds to dedicated remote nodes, then push to a registry.",
        icon: "Hammer",
      },
      {
        title: "S3 backups",
        description:
          "Volume, database, and full-instance backups to AWS S3, MinIO, R2, or any S3 endpoint, on a schedule.",
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

export const COMPARE: CompareRow[] = [
  { feature: "RAM at idle", rivetr: "~30–80 MB", coolify: "400–800 MB", dokploy: "~300 MB" },
  {
    feature: "External dependencies",
    rivetr: "None",
    coolify: "Postgres, Redis, Traefik",
    dokploy: "PostgreSQL",
  },
  { feature: "Single binary", rivetr: true, coolify: false, dokploy: false },
  { feature: "Container runtimes", rivetr: "Docker + Podman", coolify: "Docker", dokploy: "Docker" },
  {
    feature: "Git providers",
    rivetr: "GitHub, GitLab, Gitea, Bitbucket",
    coolify: "GitHub, GitLab, Gitea, Bitbucket",
    dokploy: "GitHub, GitLab, Bitbucket",
  },
  { feature: "Preview deployments", rivetr: true, coolify: true, dokploy: false },
  { feature: "MCP server (AI)", rivetr: true, coolify: false, dokploy: false },
  { feature: "Terminal UI (TUI)", rivetr: true, coolify: false, dokploy: false },
  { feature: "Remote filesystem browser", rivetr: true, coolify: false, dokploy: false },
  { feature: "License", rivetr: "MIT", coolify: "Apache 2.0", dokploy: "Apache 2.0" },
];

export const STEPS = [
  {
    n: "01",
    title: "Install the binary",
    body: "One curl command drops a single binary on your server. It boots with an embedded SQLite database and reverse proxy — nothing else to install.",
    code: "curl -fsSL https://rivetr.dev/install.sh | sh",
  },
  {
    n: "02",
    title: "Connect a repo",
    body: "Point Rivetr at a Git repo and add a webhook. Pick a build type or let it auto-detect Dockerfile, Nixpacks, or buildpacks.",
    code: "rivetr app create --repo github.com/you/app",
  },
  {
    n: "03",
    title: "Push to deploy",
    body: "Every push triggers a zero-downtime deploy: build, health check, atomic proxy switch. HTTPS is provisioned automatically.",
    code: "git push origin main   # → live in seconds",
  },
];

export const FAQS = [
  {
    q: "How is Rivetr so lightweight?",
    a: "It's a single Rust binary with an embedded SQLite database (WAL mode), a built-in reverse proxy using lock-free route updates, and async I/O via Tokio. There's no separate database server, message queue, or proxy process to run — so the whole control plane sits around 30–80MB of RAM.",
  },
  {
    q: "Is it production-ready?",
    a: "Yes. Rivetr does zero-downtime deploys with health checks and automatic rollback, automatic HTTPS via Let's Encrypt, encrypted secrets at rest, RBAC, audit logging, and S3 backups. It supports multi-server deployments and Docker Swarm for scale.",
  },
  {
    q: "Docker or Podman?",
    a: "Both. Rivetr abstracts the container runtime and auto-detects whichever is available. Docker uses the socket API directly; Podman is driven via its CLI.",
  },
  {
    q: "How does it compare to Coolify and Dokploy?",
    a: "Same core idea — self-hosted, Git-driven deploys — but Rivetr runs on a fraction of the RAM with no external services, supports Podman as well as Docker, and adds unique features like a native MCP server for AI assistants, a terminal UI, and a remote filesystem browser.",
  },
  {
    q: "What does it cost?",
    a: "Nothing. Rivetr is open source under the MIT license. Self-host it on your own infrastructure with no seat limits and no feature gates.",
  },
  {
    q: "Can I migrate from another platform?",
    a: "Most apps just need a repo and a build type. Rivetr supports Dockerfile, Nixpacks, Railpack, and Heroku/Paketo buildpacks, plus 273 one-click service templates for the supporting infrastructure.",
  },
];

// Broader positioning — the platforms developers leave behind.
export const ALTERNATIVES = [
  "Vercel",
  "Heroku",
  "Netlify",
  "Railway",
  "Render",
  "Coolify",
  "Dokploy",
] as const;

// Always-true facts — no community vanity metrics required.
export const FACTS = [
  { value: "~30MB", label: "RAM at idle" },
  { value: "1", label: "Binary, zero deps" },
  { value: "273", label: "One-click services" },
  { value: "4", label: "Git providers" },
  { value: "7+", label: "Managed databases" },
  { value: "MIT", label: "Free forever" },
] as const;

// Supported stack — rendered as a logo/wordmark marquee.
export type TechItem = { name: string; slug: string };
export type TechRow = { label: string; items: TechItem[] };

export const TECH_STACK: TechRow[] = [
  {
    label: "Runtimes & languages",
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
      { name: "MongoDB", slug: "mongodb" },
      { name: "Redis", slug: "redis" },
      { name: "ClickHouse", slug: "clickhouse" },
      { name: "MariaDB", slug: "mariadb" },
    ],
  },
  {
    label: "Git & registries",
    items: [
      { name: "GitHub", slug: "github" },
      { name: "GitLab", slug: "gitlab" },
      { name: "Gitea", slug: "gitea" },
      { name: "Bitbucket", slug: "bitbucket" },
      { name: "Docker Hub", slug: "docker" },
    ],
  },
];

// The 273-template gallery, summarized by category.
export type TemplateCategory = {
  name: string;
  icon: string; // lucide name
  examples: string[];
};

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  { name: "AI / ML", icon: "Bot", examples: ["Ollama", "Open WebUI", "LiteLLM"] },
  { name: "Analytics", icon: "BarChart3", examples: ["Plausible", "Umami", "PostHog"] },
  { name: "CMS", icon: "FileText", examples: ["WordPress", "Ghost", "Strapi"] },
  { name: "Databases", icon: "Database", examples: ["PostgreSQL", "MongoDB", "Redis"] },
  { name: "Dev tools", icon: "Wrench", examples: ["Gitea", "Drone", "Vault"] },
  { name: "Monitoring", icon: "Activity", examples: ["Grafana", "Uptime Kuma", "Prometheus"] },
  { name: "Automation", icon: "Workflow", examples: ["n8n", "Node-RED", "Huginn"] },
  { name: "Communication", icon: "MessagesSquare", examples: ["Rocket.Chat", "Mattermost"] },
  { name: "File & media", icon: "FolderOpen", examples: ["Nextcloud", "Jellyfin", "MinIO"] },
  { name: "Search", icon: "Search", examples: ["Meilisearch", "Typesense"] },
  { name: "Security", icon: "ShieldCheck", examples: ["Vaultwarden", "Authelia"] },
  { name: "Project mgmt", icon: "KanbanSquare", examples: ["Plane", "Vikunja", "Focalboard"] },
];

export const TEMPLATE_COUNT = 273;

export const NAV_LINKS = [
  { label: "Features", href: "/features" },
  { label: "Compare", href: "/#compare" },
  { label: "How it works", href: "/#how" },
  { label: "FAQ", href: "/#faq" },
  { label: "Docs", href: SITE.docs },
];
