import type { Route } from "./+types/home";
import { Hero } from "~/components/sections/hero";
import { Positioning } from "~/components/sections/positioning";
import { LogoMarquee } from "~/components/sections/logo-marquee";
import { ProductPreview } from "~/components/sections/product-preview";
import { ReleaseHighlights } from "~/components/sections/release-highlights";
import { FeatureGroups } from "~/components/sections/feature-groups";
import { TemplatesShowcase } from "~/components/sections/templates-showcase";
import { HowItWorks } from "~/components/sections/how-it-works";
import { Compare } from "~/components/sections/compare";
import { SecurityBand } from "~/components/sections/security-band";
import { Faq } from "~/components/sections/faq";
import { CtaInstall } from "~/components/sections/cta-install";
import { SITE } from "~/lib/content";
import { pageMeta, siteOrigin } from "~/lib/meta";

export function meta({ matches }: Route.MetaArgs) {
  return pageMeta({
    title: "Rivetr: Self-hosted PaaS in a single binary",
    description: SITE.description,
    origin: siteOrigin(matches),
  });
}

export default function Home() {
  return (
    <>
      <Hero />
      <Positioning />
      <LogoMarquee />
      <ProductPreview />
      <ReleaseHighlights />
      <FeatureGroups />
      <TemplatesShowcase />
      <HowItWorks />
      <Compare />
      <SecurityBand />
      <Faq />
      <CtaInstall />
    </>
  );
}
