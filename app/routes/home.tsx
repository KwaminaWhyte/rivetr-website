import type { Route } from "./+types/home";
import { Hero } from "~/components/sections/hero";
import { StatStrip } from "~/components/sections/stat-strip";
import { FeatureGroups } from "~/components/sections/feature-groups";
import { HowItWorks } from "~/components/sections/how-it-works";
import { Compare } from "~/components/sections/compare";
import { Faq } from "~/components/sections/faq";
import { CtaInstall } from "~/components/sections/cta-install";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "Rivetr — Self-hosted PaaS in a single binary" },
    {
      name: "description",
      content:
        "Deploy apps from Git with one binary. ~30MB RAM idle, no Redis, no PostgreSQL, no Traefik. Docker + Podman, automatic HTTPS, zero-downtime deploys. Open source, MIT.",
    },
  ];
}

export default function Home() {
  return (
    <>
      <Hero />
      <StatStrip />
      <FeatureGroups />
      <HowItWorks />
      <Compare />
      <Faq />
      <CtaInstall />
    </>
  );
}
