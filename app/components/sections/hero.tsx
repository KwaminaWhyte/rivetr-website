import { ArrowRight, Star } from "lucide-react";
import { Badge, Button, Container } from "~/components/ui";
import { HERO, SITE, STATS } from "~/lib/content";

const LOG_LINES: { icon: string; color: string; text: string }[] = [
  { icon: "$", color: "text-mist-400", text: SITE.installCmd },
  { icon: "", color: "text-green-400", text: "cloned repo in 0.8s" },
  { icon: "", color: "text-green-400", text: "built image (Dockerfile) in 14s" },
  { icon: "", color: "text-green-400", text: "health check passed (HTTP 200)" },
  { icon: "", color: "text-brand-400", text: "live at https://app.example.com" },
];

function TerminalMock() {
  return (
    <div
      className="w-full max-w-2xl mx-auto rounded-xl border border-ink-700 bg-ink-900 glow-ring overflow-hidden"
      role="img"
      aria-label="Terminal showing a Rivetr deploy"
    >
      {/* Titlebar */}
      <div className="flex items-center gap-1.5 border-b border-ink-700 bg-ink-850 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" aria-hidden="true" />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" aria-hidden="true" />
        <span className="h-2.5 w-2.5 rounded-full bg-green-500/70" aria-hidden="true" />
        <span className="ml-3 text-xs text-mist-400 font-mono select-none">
          rivetr - bash
        </span>
      </div>

      {/* Log lines */}
      <div className="px-4 py-4 space-y-1" aria-hidden="true">
        {LOG_LINES.map((line, i) => (
          <div key={i} className="flex items-start gap-2 font-mono text-sm leading-relaxed">
            {i === 0 ? (
              <>
                <span className="shrink-0 text-brand-400 select-none">$</span>
                <span className="text-mist-200">{line.text}</span>
              </>
            ) : (
              <>
                <span className={`shrink-0 select-none ${line.color}`}>
                  {i === LOG_LINES.length - 1 ? "→" : "✓"}
                </span>
                <span className={line.color}>{line.text}</span>
              </>
            )}
          </div>
        ))}
        {/* Cursor */}
        <div className="flex items-center gap-2 font-mono text-sm">
          <span className="text-brand-400">$</span>
          <span className="inline-block h-4 w-2 bg-brand-400/70 animate-pulse" aria-hidden="true" />
        </div>
      </div>
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
    <div className="rounded-xl border border-ink-700 bg-ink-900 px-5 py-5">
      <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
      <p className="mt-1 text-sm font-medium text-mist-200">{label}</p>
      <p className="mt-0.5 text-xs text-mist-400">{sub}</p>
    </div>
  );
}

export function Hero() {
  // Split title on \n and render each line; apply gradient to second line
  const titleLines = HERO.title.split("\n");

  return (
    <section
      className="relative w-full overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28"
      aria-label="Hero"
    >
      {/* Aurora glow */}
      <div
        className="aurora pointer-events-none absolute inset-x-0 -top-40 -z-10 mx-auto h-[600px] w-[900px] max-w-full rounded-full opacity-60"
        aria-hidden="true"
      />

      {/* Grid backdrop */}
      <div
        className="bg-grid mask-fade-b pointer-events-none absolute inset-0 -z-10"
        aria-hidden="true"
      />

      <Container>
        {/* Main content block with entrance animation */}
        <div className="animate-float-up flex flex-col items-center text-center">
          {/* Badge */}
          <Badge className="mb-6">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand-400" aria-hidden="true" />
            {HERO.eyebrow}
          </Badge>

          {/* Headline */}
          <h1 className="mb-6 max-w-3xl text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            {titleLines.map((line, i) => (
              <span key={i} className={i === 1 ? "text-gradient block" : "text-white block"}>
                {line}
              </span>
            ))}
          </h1>

          {/* Subtitle */}
          <p className="mb-8 max-w-2xl text-lg leading-relaxed text-mist-400">
            {HERO.subtitle}
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button href={HERO.primaryCta.href} variant="primary" size="lg">
              {HERO.primaryCta.label}
              <ArrowRight size={16} aria-hidden="true" />
            </Button>
            <Button href={HERO.secondaryCta.href} variant="outline" size="lg">
              <Star size={16} aria-hidden="true" />
              {HERO.secondaryCta.label}
            </Button>
          </div>
        </div>

        {/* Terminal mock */}
        <div className="mt-14 animate-float-up [animation-delay:120ms]">
          <TerminalMock />
        </div>

        {/* Stats */}
        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {STATS.map((stat) => (
            <StatCard key={stat.label} value={stat.value} label={stat.label} sub={stat.sub} />
          ))}
        </div>
      </Container>
    </section>
  );
}

export default Hero;
