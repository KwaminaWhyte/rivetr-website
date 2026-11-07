import { ArrowRight, GitCommitHorizontal, Star } from "lucide-react";
import { Badge, Button, Container } from "~/components/ui";
import { BrowserFrame } from "~/components/browser-frame";
import { HERO, SITE, STATS } from "~/lib/content";

const DEPLOY_LINES = [
  { icon: "✓", color: "text-success", text: "cloned main in 0.8s" },
  { icon: "✓", color: "text-success", text: "built image in 14s" },
  { icon: "✓", color: "text-success", text: "health check passed (200)" },
  { icon: "→", color: "text-brand-300", text: "live at shop.example.com" },
];

function DeployCard() {
  return (
    <div className="pointer-events-none absolute -bottom-8 left-6 hidden w-72 rounded-xl border border-border-strong bg-surface/95 p-4 shadow-2xl shadow-black/50 backdrop-blur-xl lg:block">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-strong">
          <GitCommitHorizontal size={13} className="text-brand-300" aria-hidden />
          Deployment #1042
        </span>
        <span className="rounded-full bg-success-soft px-2 py-0.5 text-[10px] font-medium text-success">
          Live
        </span>
      </div>
      <div className="space-y-1.5 font-mono text-[11px] leading-relaxed" aria-hidden>
        {DEPLOY_LINES.map((line) => (
          <div key={line.text} className="flex items-start gap-2">
            <span className={`shrink-0 ${line.color}`}>{line.icon}</span>
            <span className={line.color}>{line.text}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 border-t border-border pt-2 text-[10px] text-subtle">
        Old container drained after the switch
      </p>
    </div>
  );
}

function StatCard({
  value,
  label,
  sub,
}: {
  value: string;
  label: string;
  sub: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface/80 px-5 py-4 backdrop-blur-sm">
      <p className="text-2xl font-bold tracking-tight text-strong sm:text-3xl">{value}</p>
      <p className="mt-1 text-sm font-medium text-fg">{label}</p>
      <p className="mt-0.5 text-xs text-subtle">{sub}</p>
    </div>
  );
}

export function Hero() {
  const titleLines = HERO.title.split("\n");

  return (
    <section
      className="relative w-full overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-24"
      aria-label="Hero"
    >
      <div
        className="aurora pointer-events-none absolute inset-x-0 -top-56 -z-10 mx-auto h-[680px] w-[1000px] max-w-full rounded-full opacity-70"
        aria-hidden="true"
      />
      <div
        className="bg-grid mask-fade-b pointer-events-none absolute inset-0 -z-10"
        aria-hidden="true"
      />

      <Container>
        <div className="animate-float-up mx-auto flex max-w-3xl flex-col items-center text-center">
          <Badge className="mb-6">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand-400" aria-hidden="true" />
            {HERO.eyebrow}
          </Badge>

          <h1 className="mb-6 max-w-3xl text-balance text-[2rem] font-bold leading-[1.12] tracking-tight sm:text-6xl sm:leading-none lg:text-7xl">
            {titleLines.map((line, i) => {
              // Keep the unit together so "52 MB." never splits across lines.
              const [before, after] = line.split("52 MB.");
              return (
                <span key={i} className={i === 1 ? "text-gradient block" : "text-strong block"}>
                  {after === undefined ? (
                    line
                  ) : (
                    <>
                      {before}
                      <span className="whitespace-nowrap">52 MB.</span>
                      {after}
                    </>
                  )}
                </span>
              );
            })}
          </h1>

          <p className="mb-8 max-w-2xl text-base leading-relaxed text-subtle sm:text-lg">
            {HERO.subtitle}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button href={HERO.primaryCta.href} variant="primary" size="lg">
              {HERO.primaryCta.label}
              <ArrowRight size={16} aria-hidden="true" />
            </Button>
            <Button href={HERO.secondaryCta.href} variant="outline" size="lg">
              <Star size={16} aria-hidden="true" />
              {HERO.secondaryCta.label}
            </Button>
            <Button href={HERO.tertiaryCta.href} variant="ghost" size="lg">
              {HERO.tertiaryCta.label}
            </Button>
          </div>

          <p className="mt-4 text-xs text-subtle">
            v{SITE.version} shipped {SITE.released}. Measured, not estimated.
          </p>
        </div>

        <div className="animate-float-up relative mx-auto mt-14 max-w-5xl [animation-delay:120ms]">
          <div
            className="pointer-events-none absolute inset-x-12 -bottom-10 -z-10 h-48 rounded-full bg-brand-500/25 blur-3xl"
            aria-hidden="true"
          />
          <BrowserFrame
            src="/screenshots/dashboard.png"
            alt="Rivetr 1.0 dashboard: a metric strip with running resources, CPU, memory, disk and uptime above a zoomable projects canvas with live deployment status"
            url="rivetr.example.com/dashboard"
            priority
          />
          <DeployCard />
        </div>

        <div className="mt-16 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {STATS.map((stat) => (
            <StatCard key={stat.label} value={stat.value} label={stat.label} sub={stat.sub} />
          ))}
        </div>
      </Container>
    </section>
  );
}

export default Hero;
