import type { Route } from "./+types/features";
import { Container, Badge, Section } from "~/components/ui";
import { FeatureGroups } from "~/components/sections/feature-groups";
import { Compare } from "~/components/sections/compare";
import { CtaInstall } from "~/components/sections/cta-install";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "Features: Rivetr" },
    {
      name: "description",
      content:
        "The full Rivetr feature set: Git-native deploys, managed databases, 273 service templates, SSO & RBAC, live logs and metrics, multi-server and Swarm, S3 backups, an MCP server, and more.",
    },
  ];
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
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
            One binary, the <span className="text-gradient">whole platform</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-mist-400">
            Rivetr bundles everything a modern self-hosted PaaS needs: deploys,
            databases, security, observability, and scale, into a single Rust
            binary that idles around 30&nbsp;MB of RAM.
          </p>
        </Container>
      </Section>

      <FeatureGroups />
      <Compare />
      <CtaInstall />
    </>
  );
}
