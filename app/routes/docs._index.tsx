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
  Boxes,
  ShieldCheck,
  LifeBuoy,
  ArrowUpCircle,
  Layers,
} from "lucide-react";
import { SITE } from "~/lib/content";
import { pageMeta, siteOrigin } from "~/lib/meta";
import type { Route } from "./+types/docs._index";

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
          "What Rivetr is, how the single-binary design works, and how it compares to Coolify and Dokploy.",
        slug: "introduction",
      },
      {
        icon: <Zap size={20} />,
        title: "Quick Start",
        description:
          "Install, create an admin, connect a repository, and deploy your first app in under ten minutes.",
        slug: "quick-start",
      },
      {
        icon: <Terminal size={20} />,
        title: "Installation",
        description:
          "Requirements, the one-line installer, systemd, manual and development setup, and Ansible provisioning.",
        slug: "installation",
      },
      {
        icon: <ArrowUpCircle size={20} />,
        title: "Upgrading",
        description:
          "Update checks, applying a release, backups first, version pinning, and what to know before a downgrade.",
        slug: "upgrading",
      },
    ],
  },
  {
    label: "Deploy",
    cards: [
      {
        icon: <GitBranch size={20} />,
        title: "Deployments",
        description:
          "The clone, build, health check, and atomic switch pipeline. Previews, approvals, freeze windows, rollback, and data snapshots.",
        slug: "deployments",
      },
      {
        icon: <Cpu size={20} />,
        title: "Build Types",
        description:
          "Dockerfile, Nixpacks, Railpack, Cloud Native Buildpacks, static sites, and prebuilt images.",
        slug: "build-types",
      },
      {
        icon: <Webhook size={20} />,
        title: "Webhooks",
        description:
          "GitHub, GitLab, Gitea, Bitbucket, and Docker Hub. Signature verification, skip markers, and watch paths.",
        slug: "webhooks",
      },
      {
        icon: <Boxes size={20} />,
        title: "Compose Services",
        description:
          "Docker Compose deployments with build sources, hooks, image digests, per-container terminals, and rollback.",
        slug: "services",
      },
      {
        icon: <KeyRound size={20} />,
        title: "Environment Variables",
        description:
          "AES-256-GCM encryption, shared inheritance from team to app, and database link injection.",
        slug: "environment-variables",
      },
      {
        icon: <Globe size={20} />,
        title: "Domains and HTTPS",
        description:
          "Per-domain certificates, DNS-01 wildcards, HTTP/2, preview URLs, and the embedded proxy.",
        slug: "domains-and-https",
      },
      {
        icon: <Database size={20} />,
        title: "Databases",
        description:
          "Nine managed engines, app linking, extensions, live resource limits, and engine-specific notes.",
        slug: "databases",
      },
      {
        icon: <Archive size={20} />,
        title: "Backups",
        description:
          "Database, volume, and instance backups to local disk or S3, with retention, checksums, and tested restore.",
        slug: "backups",
      },
      {
        icon: <ShieldCheck size={20} />,
        title: "Secret Managers",
        description:
          "Resolve secret:// references from Vault, OpenBao, Infisical, Doppler, and AWS Secrets Manager at deploy time.",
        slug: "secret-managers",
      },
    ],
  },
  {
    label: "Operate",
    cards: [
      {
        icon: <BarChart2 size={20} />,
        title: "Monitoring and Logs",
        description:
          "Live streams, search and retention, host metrics, Prometheus, traffic analytics, and log drains.",
        slug: "monitoring-and-logs",
      },
      {
        icon: <Users size={20} />,
        title: "Teams and RBAC",
        description:
          "Role presets and 24 abilities, custom roles, resource overrides, 2FA enforcement, and audit logs.",
        slug: "teams-and-rbac",
      },
      {
        icon: <Server size={20} />,
        title: "Remote Servers and Scale",
        description:
          "SSH servers, multi-server app placements, build servers, Docker Swarm, replicas, and server maintenance.",
        slug: "multi-server-and-scale",
      },
      {
        icon: <ShieldCheck size={20} />,
        title: "Security",
        description:
          "Encryption at rest, token scopes, SSH host key pinning, rate limiting, CSP, and a hardening checklist.",
        slug: "security",
      },
    ],
  },
  {
    label: "Reference",
    cards: [
      {
        icon: <Settings size={20} />,
        title: "Configuration",
        description:
          "Every rivetr.toml table and the important defaults, plus a minimal production example.",
        slug: "configuration",
      },
      {
        icon: <Code2 size={20} />,
        title: "REST API",
        description:
          "Authentication, scoped tokens, the endpoint catalog, streams, rate limits, and curl examples.",
        slug: "api",
      },
      {
        icon: <Terminal size={20} />,
        title: "CLI",
        description:
          "Remote commands, local maintenance commands, and the optional terminal UI.",
        slug: "cli",
      },
      {
        icon: <Layers size={20} />,
        title: "MCP Server",
        description:
          "The built-in Model Context Protocol server and its 11 tools for AI assistants.",
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
          "Footprint, production readiness, Docker vs Podman, licensing, telemetry, and migration.",
        slug: "faq",
      },
      {
        icon: <LifeBuoy size={20} />,
        title: "Troubleshooting",
        description:
          "Install, startup, DNS, certificates, builds, webhooks, databases, SSH, updates, and disk.",
        slug: "troubleshooting",
      },
      {
        icon: <Rocket size={20} />,
        title: "Contributing",
        description:
          "Development setup, tests, migrations, templates, pull request checklist, and conventions.",
        slug: "contributing",
      },
    ],
  },
];

export function meta({ matches }: Route.MetaArgs) {
  return pageMeta({
    title: "Documentation: Rivetr",
    description:
      "Rivetr 1.0 documentation: install, deploy, databases, services, domains, backups, security, API, CLI, and MCP.",
    origin: siteOrigin(matches),
  });
}

export default function DocsIndex() {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-10">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-brand-300">
          Documentation · v{SITE.version}
        </p>
        <h1 className="mb-3 text-3xl font-bold tracking-tight text-strong sm:text-4xl">
          Get started with Rivetr
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-subtle">
          Rivetr deploys your apps from Git in a single binary: no Redis, no
          PostgreSQL, and no Traefik. These pages cover 1.0.0.
        </p>
      </div>

      <div className="mb-10 rounded-xl border border-brand-500/20 bg-brand-500/[0.06] p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-strong">Quick start</p>
          <span className="rounded-full border border-brand-500/25 px-2 py-0.5 font-mono text-[10px] text-brand-300">
            Linux + Docker or Podman
          </span>
        </div>
        <pre className="whitespace-pre-wrap break-words rounded-lg border border-border bg-bg p-4 font-mono text-xs text-fg sm:text-sm">
          <code>{SITE.installCmd}</code>
        </pre>
        <p className="mt-3 text-sm text-subtle">
          Then open{" "}
          <code className="rounded border border-border bg-surface px-1.5 py-0.5 text-xs text-brand-300">
            http://your-server:8080
          </code>{" "}
          and create your admin account.{" "}
          <Link
            to="/docs/quick-start"
            className="font-medium text-brand-300 underline-offset-4 hover:underline"
          >
            Full quick start
          </Link>
        </p>
      </div>

      <div className="space-y-10">
        {SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-subtle">
              {section.label}
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {section.cards.map((card) => (
                <Link
                  key={card.slug}
                  to={`/docs/${card.slug}`}
                  className="group flex gap-4 rounded-xl border border-border bg-surface/60 p-5 transition-all duration-200 hover:border-brand-500/40 hover:bg-surface"
                >
                  <div className="mt-0.5 shrink-0 text-brand-300 transition-colors group-hover:text-brand-200">
                    {card.icon}
                  </div>
                  <div>
                    <p className="mb-1 font-semibold text-strong">
                      {card.title}
                    </p>
                    <p className="text-sm leading-relaxed text-subtle">
                      {card.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-4 border-t border-border pt-6 text-sm text-subtle">
        <a
          href={SITE.github}
          target="_blank"
          rel="noreferrer"
          className="transition-colors hover:text-strong"
        >
          GitHub →
        </a>
        <a
          href={`${SITE.github}/issues`}
          target="_blank"
          rel="noreferrer"
          className="transition-colors hover:text-strong"
        >
          Report an issue →
        </a>
        <Link to="/changelog" className="transition-colors hover:text-strong">
          Changelog →
        </Link>
      </div>
    </div>
  );
}
