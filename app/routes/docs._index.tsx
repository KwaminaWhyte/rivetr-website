import { Link } from "react-router";
import {
  Rocket,
  Database,
  Settings,
  BookOpen,
  Terminal,
  Code2,
  GitBranch,
  Users,
  Zap,
  Globe,
  Archive,
  BarChart2,
  Server,
  HelpCircle,
  Webhook,
  KeyRound,
  Cpu,
} from "lucide-react";

interface DocCard {
  icon: React.ReactNode;
  title: string;
  description: string;
  slug: string;
}

interface DocSection {
  label: string;
  cards: DocCard[];
}

const SECTIONS: DocSection[] = [
  {
    label: "Getting started",
    cards: [
      {
        icon: <BookOpen size={20} />,
        title: "Introduction",
        description:
          "What Rivetr is, how it compares to Coolify and Dokploy, and the single-binary design.",
        slug: "introduction",
      },
      {
        icon: <Zap size={20} />,
        title: "Quick Start",
        description:
          "Install → create admin → connect a repo → first deploy. Everything you need to be live in under 10 minutes.",
        slug: "quick-start",
      },
      {
        icon: <Terminal size={20} />,
        title: "Installation",
        description:
          "One-line install script. Handles Docker, systemd, and firewall config automatically.",
        slug: "installation",
      },
    ],
  },
  {
    label: "Guides",
    cards: [
      {
        icon: <GitBranch size={20} />,
        title: "Deployments",
        description:
          "The clone → build → health check → atomic swap pipeline. Previews, rollbacks, approvals.",
        slug: "deployments",
      },
      {
        icon: <Cpu size={20} />,
        title: "Build Types",
        description:
          "Dockerfile, Nixpacks, Railpack, Heroku/Paketo buildpacks, and static sites. Auto-detection and deploy.toml hints.",
        slug: "build-types",
      },
      {
        icon: <Webhook size={20} />,
        title: "Webhooks",
        description:
          "GitHub, GitLab, Gitea, Bitbucket, and Docker Hub. Signature verification, skip markers, watch paths.",
        slug: "webhooks",
      },
      {
        icon: <KeyRound size={20} />,
        title: "Environment Variables",
        description:
          "Per-app env vars with AES-256-GCM encryption, and shared inheritance from team → project → environment → app.",
        slug: "environment-variables",
      },
      {
        icon: <Globe size={20} />,
        title: "Domains and HTTPS",
        description:
          "Custom domains, automatic Let's Encrypt certificates, the embedded reverse proxy, and preview URLs.",
        slug: "domains-and-https",
      },
      {
        icon: <Database size={20} />,
        title: "Databases",
        description:
          "One-click Postgres, MySQL, MongoDB, Redis, and more. Automatic env var injection and S3 backups.",
        slug: "databases",
      },
      {
        icon: <Archive size={20} />,
        title: "Backups",
        description:
          "S3-compatible destinations, volume and database backups, scheduled retention, full instance backup/restore.",
        slug: "backups",
      },
      {
        icon: <BarChart2 size={20} />,
        title: "Monitoring and Logs",
        description:
          "Live log streaming, full-text search, uptime tracking, Prometheus /metrics, crash recovery.",
        slug: "monitoring-and-logs",
      },
      {
        icon: <Users size={20} />,
        title: "Teams and RBAC",
        description:
          "Multi-tenant isolation, owner/admin/developer/viewer roles, per-resource overrides, 2FA enforcement, audit logging.",
        slug: "teams-and-rbac",
      },
      {
        icon: <Server size={20} />,
        title: "Multi-Server and Scale",
        description:
          "Register remote servers, build servers, Docker Swarm, replica load balancing, container registry push.",
        slug: "multi-server-and-scale",
      },
      {
        icon: <Settings size={20} />,
        title: "Configuration",
        description:
          "Full reference for rivetr.toml (server config) and deploy.toml (per-app config in your repo).",
        slug: "configuration",
      },
    ],
  },
  {
    label: "Reference",
    cards: [
      {
        icon: <Code2 size={20} />,
        title: "REST API",
        description:
          "Authentication, full endpoint catalog, WebSocket streams, and rate-limit tiers.",
        slug: "api",
      },
      {
        icon: <Terminal size={20} />,
        title: "CLI",
        description:
          "The rivetr CLI: status, apps, deploy, logs, backup/restore, config check, and the TUI.",
        slug: "cli",
      },
      {
        icon: <Zap size={20} />,
        title: "MCP Server",
        description:
          "The built-in Model Context Protocol server. Connect Claude Desktop or any MCP client to manage deployments with AI.",
        slug: "mcp-server",
      },
    ],
  },
  {
    label: "Project",
    cards: [
      {
        icon: <HelpCircle size={20} />,
        title: "FAQ",
        description:
          "Resource usage, production-readiness, Docker vs Podman, comparison to Coolify/Dokploy, cost, migration.",
        slug: "faq",
      },
      {
        icon: <Rocket size={20} />,
        title: "Contributing",
        description:
          "Dev setup, code organization, PR checklist, and branch/commit conventions.",
        slug: "contributing",
      },
    ],
  },
];

export function meta() {
  return [
    { title: "Documentation — Rivetr" },
    {
      name: "description",
      content:
        "Documentation for Rivetr — the self-hosted PaaS in a single binary.",
    },
  ];
}

export default function DocsIndex() {
  return (
    <div>
      {/* Header */}
      <div className="mb-10">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-brand-400">
          Documentation
        </p>
        <h1 className="mb-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Get started with Rivetr
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-mist-400">
          Rivetr is a self-hosted PaaS that deploys your apps from Git in a
          single binary — no Redis, no PostgreSQL, no Traefik.
        </p>
      </div>

      {/* Quick start strip */}
      <div className="mb-10 rounded-xl border border-brand-500/20 bg-brand-500/5 p-5">
        <p className="mb-3 text-sm font-semibold text-white">Quick start</p>
        <pre className="overflow-x-auto rounded-lg border border-ink-700 bg-ink-900 p-4 font-mono text-sm text-mist-200">
          <code>curl -fsSL https://rivetr.dev/install.sh | sh</code>
        </pre>
        <p className="mt-3 text-sm text-mist-400">
          Then open{" "}
          <code className="rounded border border-ink-700 bg-ink-900 px-1.5 py-0.5 text-xs text-brand-300">
            http://your-server:8080
          </code>{" "}
          and create your admin account.{" "}
          <Link
            to="/docs/installation"
            className="text-brand-400 underline-offset-4 hover:underline"
          >
            Full install guide →
          </Link>
        </p>
      </div>

      {/* Doc sections */}
      <div className="space-y-10">
        {SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-mist-500">
              {section.label}
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {section.cards.map((card) => (
                <Link
                  key={card.slug}
                  to={`/docs/${card.slug}`}
                  className="group flex gap-4 rounded-xl border border-ink-700 bg-ink-900/60 p-5 transition-all duration-200 hover:border-brand-500/40 hover:bg-ink-900"
                >
                  <div className="mt-0.5 shrink-0 text-brand-400 transition-colors group-hover:text-brand-300">
                    {card.icon}
                  </div>
                  <div>
                    <p className="mb-1 font-semibold text-white transition-colors group-hover:text-white">
                      {card.title}
                    </p>
                    <p className="text-sm leading-relaxed text-mist-400">
                      {card.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer links */}
      <div className="mt-10 flex flex-wrap gap-4 border-t border-ink-700 pt-6 text-sm text-mist-400">
        <a
          href="https://github.com/KwaminaWhyte/rivetr"
          target="_blank"
          rel="noreferrer"
          className="transition-colors hover:text-white"
        >
          GitHub →
        </a>
        <a
          href="https://github.com/KwaminaWhyte/rivetr/issues"
          target="_blank"
          rel="noreferrer"
          className="transition-colors hover:text-white"
        >
          Report an issue →
        </a>
        <a
          href="https://github.com/KwaminaWhyte/rivetr/releases"
          target="_blank"
          rel="noreferrer"
          className="transition-colors hover:text-white"
        >
          Changelog →
        </a>
      </div>
    </div>
  );
}
