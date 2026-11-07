import type { Route } from "./+types/features";
import { Container, Badge, Section } from "~/components/ui";
import { FeatureGroups } from "~/components/sections/feature-groups";
import { Compare } from "~/components/sections/compare";
import { SecurityBand } from "~/components/sections/security-band";
import { CtaInstall } from "~/components/sections/cta-install";
import { pageMeta, siteOrigin } from "~/lib/meta";

export function meta({ matches }: Route.MetaArgs) {
  return pageMeta({
    title: "Features: Rivetr",
    description:
      "The full Rivetr 1.0 feature set: Git-native deploys, 9 managed databases, 365 service templates, passkeys, SSO and RBAC, traffic analytics, multi-server and Swarm, checksum-verified S3 backups, a TUI, and a built-in MCP server.",
    origin: siteOrigin(matches),
  });
}

export default function Features() {
  return (
    <>
      <Section className="relative overflow-hidden pt-32 pb-10">
        <div
          className="aurora pointer-events-none absolute inset-x-0 top-0 -z-10 h-72"
          aria-hidden
        />
        <div
          className="bg-grid mask-fade-b pointer-events-none absolute inset-0 -z-10"
          aria-hidden
        />
        <Container className="text-center">
          <Badge>
            <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
            Every feature, no paid tiers
          </Badge>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold tracking-tight text-strong sm:text-5xl">
            One binary, the <span className="text-gradient">whole platform</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-subtle">
            Deploys, databases, services, security, observability, and scale in a
            single Rust binary. 52 MB RSS with 30 containers, and no Redis,
            PostgreSQL, or Traefik to run alongside it.
          </p>
        </Container>
      </Section>

      <FeatureGroups />
      <Compare />
      <SecurityBand />
      <CtaInstall />
    </>
  );
}
