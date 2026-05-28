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
} from "lucide-react";

interface DocCard {
  icon: React.ReactNode;
  title: string;
  description: string;
  slug: string;
}

const CARDS: DocCard[] = [
  {
    icon: <BookOpen size={20} />,
    title: "Introduction",
    description:
      "What Rivetr is, how it compares to Coolify and Dokploy, and the single-binary design thesis.",
    slug: "introduction",
  },
  {
    icon: <Terminal size={20} />,
    title: "Installation",
    description:
      "Install with one curl command. The script handles Docker, systemd, and firewall config automatically.",
    slug: "installation",
  },
  {
    icon: <GitBranch size={20} />,
    title: "Deployments",
    description:
      "The clone → build → health check → atomic swap pipeline. Webhooks, previews, rollbacks, and more.",
    slug: "deployments",
  },
  {
    icon: <Database size={20} />,
    title: "Databases",
    description:
      "One-click Postgres, MySQL, MongoDB, Redis, and more. Automatic env var injection and S3 backups.",
    slug: "databases",
  },
  {
    icon: <Settings size={20} />,
    title: "Configuration",
    description:
      "Full reference for rivetr.toml (server config) and deploy.toml (per-app config in your repo).",
    slug: "configuration",
  },
  {
    icon: <Code2 size={20} />,
    title: "REST API",
    description:
      "Authentication, endpoint reference, WebSocket streams, and the MCP server for AI integration.",
    slug: "api",
  },
  {
    icon: <Rocket size={20} />,
    title: "Contributing",
    description:
      "Dev setup, code organization, PR checklist, and branch/commit conventions.",
    slug: "contributing",
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

      {/* Doc cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {CARDS.map((card) => (
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
