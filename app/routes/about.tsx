import {
  Container,
  Button,
  Badge,
  SectionHeading,
  Section,
} from "~/components/ui";
import { GithubIcon } from "~/components/icons/github";
import { SITE } from "~/lib/content";
import {
  Binary,
  Database,
  Zap,
  Shield,
  Box,
  Globe,
  TerminalSquare,
  Bot,
  GitBranch,
  Server,
} from "lucide-react";

export function meta() {
  return [
    { title: "About: Rivetr" },
    {
      name: "description",
      content:
        "Why Rivetr exists: a self-hosted PaaS that runs in a single Rust binary with ~30MB RAM and zero external dependencies: no Redis, no PostgreSQL, no Traefik.",
    },
  ];
}

// ─── Philosophy principles ───────────────────────────────────────────────────
const PRINCIPLES = [
  {
    icon: Zap,
    title: "Small by default",
    body: "The control plane idles at ~30–80 MB of RAM. Not as a party trick, because it means you can run the whole platform on a $4 VPS and still have headroom for your apps.",
  },
  {
    icon: Database,
    title: "No external dependencies",
    body: "An embedded SQLite database in WAL mode and a built-in reverse proxy replace the Postgres, Redis, and Traefik that competing tools require. Less to install. Less to break. Less to secure.",
  },
  {
    icon: Shield,
    title: "Own your platform",
    body: "MIT licensed. No paid tiers. No feature gates. No phoning home. You run the binary; you own the data; you decide the upgrade schedule.",
  },
  {
    icon: Box,
    title: "Everything included",
    body: "Zero-downtime deploys, automatic HTTPS, managed databases, S3 backups, RBAC, SSO, multi-server, Docker Swarm, preview environments, a TUI, and a native MCP server, all in one binary.",
  },
] as const;

// ─── Tech layer entries ───────────────────────────────────────────────────────
const TECH = [
  {
    label: "Language & runtime",
    value: "Rust + Tokio",
    detail:
      "Single-threaded async tasks, zero GC pauses, predictable low memory footprint.",
  },
  {
    label: "HTTP layer",
    value: "Axum 0.7+",
    detail:
      "Extractor-based routing, native WebSocket support, Tower middleware stack.",
  },
  {
    label: "Database",
    value: "SQLite / SQLx (WAL)",
    detail:
      "Embedded single-file state. Compile-time SQL verification via SQLx. WAL mode for concurrent reads.",
  },
  {
    label: "Reverse proxy",
    value: "ArcSwap-powered",
    detail:
      "Lock-free atomic route table updates via ArcSwap. Zero-copy pass-through; no sub-process.",
  },
  {
    label: "Container runtimes",
    value: "Docker + Podman",
    detail:
      "Docker via Bollard (socket API). Podman via CLI. Auto-detected at startup.",
  },
  {
    label: "Git ops",
    value: "git2 (libgit2)",
    detail:
      "In-process cloning, SSH key handling, and progress callbacks, no shell.",
  },
] as const;

// ─── Capability highlights ────────────────────────────────────────────────────
const CAPABILITIES = [
  { icon: GitBranch, text: "GitHub, GitLab, Gitea, Bitbucket webhooks" },
  { icon: Globe, text: "Automatic HTTPS via Let's Encrypt" },
  { icon: Database, text: "Managed databases: Postgres, MySQL, MongoDB, Redis, ClickHouse" },
  { icon: Server, text: "Multi-server over SSH + Docker Swarm" },
  { icon: Box, text: "273 one-click service templates" },
  { icon: Shield, text: "RBAC + multi-tenant, SSO, 2FA, encrypted secrets" },
  { icon: TerminalSquare, text: "Browser terminal, remote filesystem browser, TUI" },
  { icon: Bot, text: "Native MCP server for AI assistants" },
] as const;

export default function About() {
  return (
    <>
      {/* ── Hero ── */}
      <Section className="relative overflow-hidden pt-32 pb-16">
        <div
          className="aurora pointer-events-none absolute inset-x-0 top-0 -z-10 h-80"
          aria-hidden
        />
        <div
          className="bg-grid mask-fade-b pointer-events-none absolute inset-0 -z-10"
          aria-hidden
        />
        <Container className="text-center">
          <Badge>
            <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
            Open source · MIT licensed
          </Badge>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold tracking-tight text-strong sm:text-5xl lg:text-6xl">
            Why{" "}
            <span className="text-gradient">Rivetr</span>{" "}
            exists
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-subtle">
            Most self-hosted PaaS tools ship a constellation of containers:
            Postgres, Redis, Traefik, and a control-plane API, that together
            idle at 400–800&nbsp;MB of RAM. The bet behind Rivetr is simpler:
            a PaaS control plane should be small enough to run on the cheapest
            VPS you can rent.
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-subtle">
            Rivetr is a single Rust binary. It embeds its own database (SQLite
            in WAL mode) and its own reverse proxy. It idles at{" "}
            <span className="font-semibold text-fg">~30–80&nbsp;MB</span>{" "}
            of RAM, has zero external runtime dependencies, and still does
            everything you need to ship production software.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button href={SITE.github} size="lg">
              <GithubIcon size={18} />
              View on GitHub
            </Button>
            <Button href={SITE.docs} variant="outline" size="lg">
              Read the docs
            </Button>
          </div>
        </Container>
      </Section>

      {/* ── Philosophy ── */}
      <Section id="philosophy">
        <Container>
          <SectionHeading
            eyebrow="Philosophy"
            title="Four principles"
            blurb="These aren't marketing bullets, they're the constraints that every design decision is checked against."
          />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PRINCIPLES.map(({ icon: Icon, title, body }) => (
              <article
                key={title}
                className="group rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-border-strong hover:bg-surface-strong"
              >
                <div className="mb-4 inline-flex rounded-xl border border-brand-500/30 bg-brand-500/10 p-3">
                  <Icon className="h-5 w-5 text-brand-400" aria-hidden />
                </div>
                <h3 className="mb-2 text-base font-semibold text-strong">
                  {title}
                </h3>
                <p className="text-sm leading-relaxed text-subtle">{body}</p>
              </article>
            ))}
          </div>
        </Container>
      </Section>

      {/* ── What's inside ── */}
      <Section id="tech" className="bg-bg">
        <Container>
          <SectionHeading
            eyebrow="What's inside"
            title={
              <>
                The tech that makes{" "}
                <span className="text-gradient">30&nbsp;MB</span> possible
              </>
            }
            blurb="Every layer was chosen to minimise runtime overhead and external surface area."
          />
          <div className="mt-14 overflow-hidden rounded-2xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface">
                  <th className="px-6 py-4 text-left font-semibold text-muted">
                    Layer
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-muted">
                    Technology
                  </th>
                  <th className="hidden px-6 py-4 text-left font-semibold text-muted md:table-cell">
                    Why
                  </th>
                </tr>
              </thead>
              <tbody>
                {TECH.map(({ label, value, detail }, i) => (
                  <tr
                    key={label}
                    className={
                      i % 2 === 0
                        ? "border-b border-border/60 bg-bg"
                        : "border-b border-border/60 bg-surface/50"
                    }
                  >
                    <td className="px-6 py-4 font-medium text-muted">
                      {label}
                    </td>
                    <td className="px-6 py-4 font-mono text-brand-400">
                      {value}
                    </td>
                    <td className="hidden px-6 py-4 text-subtle md:table-cell">
                      {detail}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Container>
      </Section>

      {/* ── Capabilities ── */}
      <Section id="capabilities">
        <Container>
          <SectionHeading
            eyebrow="Capabilities"
            title="Everything you need, nothing you don't"
            blurb="Being small doesn't mean being limited. Rivetr covers the full lifecycle from first deploy to production scale."
          />
          <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CAPABILITIES.map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="flex items-start gap-3 rounded-xl border border-border bg-surface p-4"
              >
                <div className="mt-0.5 shrink-0 rounded-lg border border-border-strong bg-surface-strong p-1.5">
                  <Icon className="h-4 w-4 text-brand-400" aria-hidden />
                </div>
                <span className="text-sm leading-relaxed text-muted">
                  {text}
                </span>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* ── License note ── */}
      <Section className="bg-bg">
        <Container>
          <div className="rounded-2xl border border-border bg-surface p-8 sm:p-12">
            <div className="mx-auto max-w-2xl text-center">
              <Binary
                className="mx-auto mb-6 h-10 w-10 text-brand-400"
                aria-hidden
              />
              <h2 className="text-2xl font-bold text-strong sm:text-3xl">
                Free. Forever.
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-subtle">
                Rivetr is MIT licensed. There are no paid tiers, no feature
                gates, and no telemetry. Self-host it on any server you own or
                rent, with no seat limits and no expiry.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Button href={SITE.github} size="lg">
                  <GithubIcon size={18} />
                  Star on GitHub
                </Button>
                <Button href={SITE.docs} variant="outline" size="lg">
                  Read the docs
                </Button>
                <Button href="/changelog" variant="ghost" size="lg">
                  See the changelog
                </Button>
              </div>
              <div className="mt-8">
                <p className="mb-2 text-xs uppercase tracking-widest text-subtle">
                  Quick install
                </p>
                <pre className="inline-block rounded-lg border border-border bg-bg px-5 py-3 font-mono text-sm text-fg">
                  {SITE.installCmd}
                </pre>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
