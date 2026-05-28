import type { Route } from "./+types/home";
import { Reveal } from "~/components/reveal";
import { Hero } from "~/components/sections/hero";
import { Positioning } from "~/components/sections/positioning";
import { LogoMarquee } from "~/components/sections/logo-marquee";
import { ProductPreview } from "~/components/sections/product-preview";
import { FeatureGroups } from "~/components/sections/feature-groups";
import { TemplatesShowcase } from "~/components/sections/templates-showcase";
import { HowItWorks } from "~/components/sections/how-it-works";
import { FactsBand } from "~/components/sections/facts-band";
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
      <Positioning />
      <LogoMarquee />
      <Reveal>
        <ProductPreview />
      </Reveal>
      <Reveal>
        <FeatureGroups />
      </Reveal>
      <Reveal>
        <TemplatesShowcase />
      </Reveal>
      <Reveal>
        <HowItWorks />
      </Reveal>
      <FactsBand />
      <Reveal>
        <Compare />
      </Reveal>
      <Reveal>
        <Faq />
      </Reveal>
      <Reveal>
        <CtaInstall />
      </Reveal>
    </>
  );
}
