import {
  Container,
  Button,
  Badge,
  SectionHeading,
  Section,
} from "~/components/ui";
import { GithubIcon } from "~/components/icons/github";
import { SITE } from "~/lib/content";
import { pageMeta, siteOrigin } from "~/lib/meta";
import type { Route } from "./+types/about";
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
  Fingerprint,
  ChartNoAxesCombined,
  KeyRound,
  LayoutDashboard,
} from "lucide-react";

export function meta({ matches }: Route.MetaArgs) {
  return pageMeta({
    title: "About: Rivetr",
    description:
      "Why Rivetr exists: a self-hosted PaaS in a single Rust binary, with 52 MB RSS, no Redis, PostgreSQL, or Traefik, and everything from deploys to backups included.",
    origin: siteOrigin(matches),
  });
}

// ─── Philosophy principles ───────────────────────────────────────────────────
const PRINCIPLES = [
  {
    icon: Zap,
    title: "Small by default",
    body: "Measured on 1.0.0 with 30 containers, the process used 52 MB RSS. The release binary is 47 MB. That means the whole platform fits on a small VPS with room left for apps.",
  },
  {
    icon: Database,
    title: "No external dependencies",
    body: "Embedded SQLite in WAL mode and an embedded reverse proxy replace the PostgreSQL, Redis, and Traefik that competing tools require. Less to install, less to break, less to secure.",
  },
  {
    icon: Shield,
    title: "Own your platform",
    body: "MIT licensed. No paid tiers, feature gates, or usage telemetry. You run the binary, own the data, and choose the upgrade schedule. The only outbound check is an update check you can disable.",
  },
  {
    icon: Box,
    title: "Everything included",
    body: "Zero-downtime deploys, automatic HTTPS, 9 managed databases, 365 templates, RBAC, SSO, passkeys, multi-server, Swarm, backups, a TUI, and a built-in MCP server in one binary.",
  },
] as const;

// ─── Tech layer entries ───────────────────────────────────────────────────────
const TECH = [
  {
    label: "Language and runtime",
    value: "Rust + Tokio",
    detail:
      "One async process with no garbage collector and a predictable memory footprint.",
  },
  {
    label: "HTTP layer",
    value: "Axum 0.8",
    detail:
      "Typed extractors, WebSocket support, and a Tower middleware stack.",
  },
  {
    label: "Database",
    value: "SQLite + SQLx 0.9 (WAL)",
    detail:
      "Embedded single-file state with compile-checked SQL and concurrent reads in WAL mode.",
  },
  {
    label: "Reverse proxy",
    value: "hyper + rustls + ArcSwap",
    detail:
      "Lock-free atomic route updates, per-domain certificates, and HTTP/2 over ALPN.",
  },
  {
    label: "Container runtimes",
    value: "Docker + Podman",
    detail:
      "Docker through Bollard 0.21 and the socket API; Podman through its CLI. Auto-detected at startup.",
  },
  {
    label: "Git operations",
    value: "git CLI",
    detail:
      "Shallow clones by default, with submodules and Git LFS opt-in per app and SSH keys handled by Rivetr.",
  },
  {
    label: "Dashboard",
    value: "React 19 + React Router 8",
    detail:
      "TypeScript and Tailwind 4, served from the same binary as the API and proxy.",
  },
  {
    label: "TLS and ACME",
    value: "rustls 0.23 + rcgen",
    detail:
      "HTTP-01 and DNS-01 issuance for Cloudflare, Route 53, Hetzner, and DigitalOcean.",
  },
] as const;

// ─── Capability highlights ────────────────────────────────────────────────────
const CAPABILITIES = [
  { icon: GitBranch, text: "GitHub, GitLab, Gitea, Bitbucket, any Git URL" },
  { icon: Globe, text: "Automatic HTTPS with per-domain certificates" },
  { icon: Database, text: "9 managed databases, from PostgreSQL to LibSQL" },
  { icon: Server, text: "Multi-server deploys, build servers, and Swarm" },
  { icon: LayoutDashboard, text: "365 one-click service templates" },
  { icon: Fingerprint, text: "Passkeys, TOTP 2FA, OAuth, OIDC SSO" },
  { icon: Shield, text: "AES-256-GCM secrets and scoped API tokens" },
  { icon: ChartNoAxesCombined, text: "Traffic analytics, Prometheus metrics, uptime" },
  { icon: KeyRound, text: "Vault, OpenBao, Infisical, Doppler, AWS Secrets Manager" },
  { icon: TerminalSquare, text: "Browser terminal, remote file browser, TUI, CLI" },
  { icon: Bot, text: "Built-in MCP server with 11 tools" },
  { icon: Binary, text: "Database, volume, and instance backups with restore" },
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
            Why <span className="text-gradient">Rivetr</span> exists
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-subtle">
            Many self-hosted PaaS tools need PostgreSQL, Redis, and a reverse
            proxy before they can deploy anything. Coolify and Dokploy ask for
            2 GB of RAM in their docs. The bet behind Rivetr is simpler: a PaaS
            control plane should be small enough to run on the cheapest VPS you
            can rent.
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-subtle">
            Rivetr is a single Rust binary. It embeds its own database (SQLite
            in WAL mode) and its own reverse proxy. Measured on 1.0.0 with 30
            containers, it used{" "}
            <span className="font-semibold text-fg">52 MB RSS</span>; the
            release binary is 47 MB. It still does everything needed to ship
            production software.
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
            blurb="These are not marketing bullets. They are the constraints every design decision is checked against."
          />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PRINCIPLES.map(({ icon: Icon, title, body }) => (
              <article
                key={title}
                className="group rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-border-strong hover:bg-surface-strong"
              >
                <div className="mb-4 inline-flex rounded-xl border border-brand-500/30 bg-brand-500/10 p-3">
                  <Icon className="h-5 w-5 text-brand-300" aria-hidden />
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
                The stack that makes{" "}
                <span className="text-gradient">52 MB</span> possible
              </>
            }
            blurb="Every layer was chosen to keep runtime overhead and external surface area low."
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
                    <td className="px-6 py-4 font-mono text-brand-300">
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
            blurb="Being small does not mean being limited. Rivetr covers the full lifecycle from first deploy to production scale."
          />
          <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CAPABILITIES.map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="flex items-start gap-3 rounded-xl border border-border bg-surface p-4"
              >
                <div className="mt-0.5 shrink-0 rounded-lg border border-border-strong bg-surface-strong p-1.5">
                  <Icon className="h-4 w-4 text-brand-300" aria-hidden />
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
                className="mx-auto mb-6 h-10 w-10 text-brand-300"
                aria-hidden
              />
              <h2 className="text-2xl font-bold text-strong sm:text-3xl">
                Free. Forever.
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-subtle">
                Rivetr is MIT licensed. There are no paid tiers, feature gates,
                or usage telemetry. Self-host it on any server you own or rent,
                with no seat limits and no expiry.
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
                <pre className="inline-block max-w-full overflow-x-auto rounded-lg border border-border bg-bg px-5 py-3 text-left font-mono text-xs text-fg sm:text-sm">
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
