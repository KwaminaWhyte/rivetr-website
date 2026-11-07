import type { Route } from "./+types/features";
import { PageHeader } from "~/components/ui";
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
      <PageHeader
        label="Features"
        title="Everything Rivetr does"
        blurb="Deploys, databases, services, security, observability, and scale in a single Rust binary. 52 MB RSS with 30 containers, and no Redis, PostgreSQL, or Traefik to run alongside it."
      />
      <FeatureGroups />
      <Compare />
      <SecurityBand />
      <CtaInstall />
    </>
  );
}
