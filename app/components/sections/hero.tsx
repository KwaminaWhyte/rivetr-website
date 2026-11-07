import { ArrowRight } from "lucide-react";
import { Button, Container } from "~/components/ui";
import { BrowserFrame } from "~/components/browser-frame";
import { GithubIcon } from "~/components/icons/github";
import { HERO, SITE } from "~/lib/content";

const SPECS = [
  { label: "Measured memory", value: "52 MB RSS" },
  { label: "External services", value: "0" },
  { label: "Service templates", value: "365" },
  { label: "License", value: "MIT" },
];

export function Hero() {
  return (
    <section aria-label="Hero" className="border-b border-border">
      <Container>
        <div className="grid gap-12 pt-16 pb-14 sm:pt-24 lg:grid-cols-12 lg:gap-10">
          <div className="animate-fade-in lg:col-span-7">
            <p className="label-mono">
              v{SITE.version} · released {SITE.released}
            </p>

            <h1 className="mt-6 text-[2.125rem] font-semibold leading-[1.04] tracking-[-0.035em] text-strong sm:text-[3.25rem] lg:text-[4.25rem]">
              {HERO.title.split("\n").map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h1>

            <p className="mt-7 max-w-xl text-[16px] leading-7 text-fg-muted sm:text-[17px] sm:leading-8">
              {HERO.subtitle}
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Button href={HERO.primaryCta.href} size="lg">
                Get started
                <ArrowRight size={15} aria-hidden="true" />
              </Button>
              <Button href={HERO.secondaryCta.href} variant="outline" size="lg">
                <GithubIcon size={15} />
                Star on GitHub
              </Button>
            </div>
          </div>

          <dl className="animate-fade-in self-start overflow-hidden rounded-lg border border-border lg:col-span-5 lg:mt-1">
            {SPECS.map((spec, i) => (
              <div
                key={spec.label}
                className={[
                  "flex items-baseline justify-between gap-6 px-5 py-4",
                  i > 0 ? "border-t border-border" : "",
                ].join(" ")}
              >
                <dt className="text-[13px] text-fg-subtle">{spec.label}</dt>
                <dd className="font-mono text-sm tabular-nums text-fg-strong">
                  {spec.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="pb-16 sm:pb-24">
          <BrowserFrame
            src="/screenshots/dashboard.png"
            alt="Rivetr dashboard: a metric strip with running resources, CPU, memory, disk, and uptime above a zoomable projects canvas with live deployment status"
            url="rivetr.example.com/dashboard"
            priority
          />
        </div>
      </Container>
    </section>
  );
}

export default Hero;
