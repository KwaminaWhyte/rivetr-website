import { Container, Button, PageHeader, Section, SectionHeading } from "~/components/ui";
import { GithubIcon } from "~/components/icons/github";
import { SITE } from "~/lib/content";
import { pageMeta, siteOrigin } from "~/lib/meta";
import type { Route } from "./+types/about";

export function meta({ matches }: Route.MetaArgs) {
  return pageMeta({
    title: "About: Rivetr",
    description:
      "Why Rivetr exists: a self-hosted PaaS in a single Rust binary, with 52 MB RSS, no Redis, PostgreSQL, or Traefik, and everything from deploys to backups included.",
    origin: siteOrigin(matches),
  });
}

const PRINCIPLES = [
  {
    title: "Small by default",
    body: "Measured on 1.0.0 with 30 containers, the process used 52 MB RSS. The release binary is 47 MB. The whole platform fits on a small VPS with room left for apps.",
  },
  {
    title: "No external dependencies",
    body: "Embedded SQLite in WAL mode and an embedded reverse proxy replace the PostgreSQL, Redis, and Traefik that competing tools require. Less to install, less to break, less to secure.",
  },
  {
    title: "Own your platform",
    body: "MIT licensed. No paid tiers, feature gates, or usage telemetry. You run the binary, own the data, and choose the upgrade schedule. The only outbound check is an update check you can disable.",
  },
  {
    title: "Everything included",
    body: "Zero-downtime deploys, automatic HTTPS, 9 managed databases, 365 templates, RBAC, SSO, passkeys, multi-server, Swarm, backups, a TUI, and a built-in MCP server in one binary.",
  },
] as const;

const TECH = [
  ["Language and runtime", "Rust + Tokio", "One async process with no garbage collector and a predictable memory footprint."],
  ["HTTP layer", "Axum 0.8", "Typed extractors, WebSocket support, and a Tower middleware stack."],
  ["Database", "SQLite + SQLx 0.9 (WAL)", "Embedded single-file state with compile-checked SQL and concurrent reads in WAL mode."],
  ["Reverse proxy", "hyper + rustls + ArcSwap", "Lock-free atomic route updates, per-domain certificates, and HTTP/2 over ALPN."],
  ["Container runtimes", "Docker + Podman", "Docker through Bollard 0.21 and the socket API; Podman through its CLI. Auto-detected at startup."],
  ["Git operations", "git CLI", "Shallow clones by default, with submodules and Git LFS opt-in per app and SSH keys handled by Rivetr."],
  ["Dashboard", "React 19 + React Router 8", "TypeScript and Tailwind 4, served from the same binary as the API and proxy."],
  ["TLS and ACME", "rustls 0.23 + rcgen", "HTTP-01 and DNS-01 issuance for Cloudflare, Route 53, Hetzner, and DigitalOcean."],
] as const;

const CAPABILITIES = [
  "GitHub, GitLab, Gitea, Bitbucket, any Git URL",
  "Automatic HTTPS with per-domain certificates",
  "9 managed databases, from PostgreSQL to LibSQL",
  "Multi-server deploys, build servers, and Swarm",
  "365 one-click service templates",
  "Passkeys, TOTP 2FA, OAuth, OIDC SSO",
  "AES-256-GCM secrets and scoped API tokens",
  "Traffic analytics, Prometheus metrics, uptime",
  "Vault, OpenBao, Infisical, Doppler, AWS Secrets Manager",
  "Browser terminal, remote file browser, TUI, CLI",
  "Built-in MCP server with 11 tools",
  "Database, volume, and instance backups with restore",
] as const;

export default function About() {
  return (
    <>
      <PageHeader
        label="About"
        title="Why Rivetr exists"
        blurb="Many self-hosted PaaS tools need PostgreSQL, Redis, and a reverse proxy before they can deploy anything. Coolify and Dokploy ask for 2 GB of RAM in their docs. The bet behind Rivetr is simpler: a PaaS control plane should be small enough to run on the cheapest VPS you can rent."
        actions={
          <>
            <Button href={SITE.github}>
              <GithubIcon size={15} />
              View on GitHub
            </Button>
            <Button href={SITE.docs} variant="outline">
              Read the docs
            </Button>
          </>
        }
      />

      <Section>
        <Container>
          <div className="grid gap-x-10 gap-y-5 lg:grid-cols-12">
            <p className="label-mono lg:col-span-3">Premise</p>
            <div className="max-w-2xl space-y-4 text-[15px] leading-7 text-fg-muted lg:col-span-9">
              <p>
                Rivetr is a single Rust binary. It embeds its own database
                (SQLite in WAL mode) and its own reverse proxy. Measured on
                1.0.0 with 30 containers, it used{" "}
                <span className="font-medium text-fg-strong">52 MB RSS</span>;
                the release binary is 47 MB. It still does everything needed to
                ship production software.
              </p>
              <p>
                Every layer is chosen to keep runtime overhead and external
                surface area low. The result is a platform you can install with
                one command, understand in an afternoon, and run on hardware you
                already pay for.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      <Section id="philosophy">
        <Container>
          <SectionHeading
            eyebrow="Philosophy"
            title="Four principles"
            blurb="These are not marketing bullets. They are the constraints every design decision is checked against."
          />
          <ul className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {PRINCIPLES.map(({ title, body }, i) => (
              <li key={title} className="border-t border-border pt-5">
                <span className="font-mono text-xs text-fg-subtle">
                  0{i + 1}
                </span>
                <h3 className="mt-2 text-[15px] font-medium text-strong">
                  {title}
                </h3>
                <p className="mt-1.5 text-sm leading-6 text-fg-muted">{body}</p>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section id="tech">
        <Container>
          <SectionHeading
            eyebrow="What's inside"
            title="The stack that makes 52 MB possible"
            blurb="Every layer was chosen to keep runtime overhead and external surface area low."
          />
          <div className="mt-10 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="border-y border-border">
                  <th className="py-3 pr-4 text-left font-normal">
                    <span className="label-mono">Layer</span>
                  </th>
                  <th className="px-4 py-3 text-left font-normal">
                    <span className="label-mono">Technology</span>
                  </th>
                  <th className="px-4 py-3 text-left font-normal">
                    <span className="label-mono">Why</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {TECH.map(([label, value, detail]) => (
                  <tr key={label} className="border-b border-border">
                    <td className="py-3 pr-4 text-fg-muted">{label}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-[13px] text-fg-strong">
                      {value}
                    </td>
                    <td className="px-4 py-3 text-[13px] leading-6 text-fg-muted">
                      {detail}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Container>
      </Section>

      <Section id="capabilities">
        <Container>
          <SectionHeading
            eyebrow="Capabilities"
            title="Everything you need, nothing you don't"
            blurb="Being small does not mean being limited. Rivetr covers the full lifecycle from first deploy to production scale."
          />
          <ul className="mt-10 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
            {CAPABILITIES.map((text) => (
              <li
                key={text}
                className="border-t border-border py-3.5 text-[13px] leading-6 text-fg-muted"
              >
                {text}
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section className="border-t border-border">
        <Container>
          <div className="grid gap-x-10 gap-y-8 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <p className="label-mono">License</p>
              <h2 className="mt-4 text-[1.75rem] font-semibold leading-[1.15] tracking-[-0.02em] text-strong">
                Free, forever
              </h2>
              <p className="mt-4 max-w-md text-[15px] leading-7 text-fg-muted">
                Rivetr is MIT licensed. There are no paid tiers, feature gates,
                or usage telemetry. Self-host it on any server you own or rent,
                with no seat limits and no expiry.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button href={SITE.github}>
                  <GithubIcon size={15} />
                  Star on GitHub
                </Button>
                <Button href="/changelog" variant="outline">
                  See the changelog
                </Button>
              </div>
            </div>
            <div className="lg:col-span-6">
              <div className="overflow-hidden rounded-lg border border-border bg-surface">
                <div className="border-b border-border px-4 py-2">
                  <span className="label-mono">Quick install</span>
                </div>
                <div className="px-4 py-4">
                  <code className="block break-all font-mono text-xs leading-6 text-fg-muted">
                    {SITE.installCmd}
                  </code>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
