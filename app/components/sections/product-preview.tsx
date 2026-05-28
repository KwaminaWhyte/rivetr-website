import { Container, Section, SectionHeading } from "~/components/ui";

// Frames a real product screenshot in a faux browser window.
function BrowserFrame({
  src,
  alt,
  url,
  className,
}: {
  src: string;
  alt: string;
  url: string;
  className?: string;
}) {
  return (
    <figure
      className={`overflow-hidden rounded-xl border border-ink-700 bg-ink-900 shadow-2xl shadow-black/50 ${className ?? ""}`}
    >
      <div className="flex items-center gap-2 border-b border-ink-700 bg-ink-850 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-ink-600" />
        <span className="h-2.5 w-2.5 rounded-full bg-ink-600" />
        <span className="h-2.5 w-2.5 rounded-full bg-ink-600" />
        <div className="ml-3 flex-1">
          <span className="inline-flex max-w-full items-center rounded-md bg-ink-950/70 px-3 py-1 font-mono text-xs text-mist-400">
            {url}
          </span>
        </div>
      </div>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="block w-full"
        width={1456}
        height={816}
      />
    </figure>
  );
}

export function ProductPreview() {
  return (
    <Section id="product" className="relative overflow-hidden">
      <div
        className="aurora pointer-events-none absolute inset-x-0 top-10 -z-10 h-72"
        aria-hidden
      />
      <Container>
        <SectionHeading
          eyebrow="The dashboard"
          title="A real dashboard, not a config file"
          blurb="Manage apps, databases, servers, deployments, and 273 one-click services from a modern web UI, or the terminal, the TUI, or the API. Everything you see here ships in the binary."
        />

        <div className="mt-14 space-y-6">
          <BrowserFrame
            src="/screenshots/dashboard.png"
            alt="Rivetr dashboard showing system overview with running services, CPU and memory usage, disk usage, resource utilization charts, and cost overview"
            url="rivetr.dev/dashboard"
          />
          <div className="grid gap-6 lg:grid-cols-2">
            <BrowserFrame
              src="/screenshots/templates.png"
              alt="Rivetr service templates gallery with category tabs and one-click deploy cards"
              url="rivetr.dev/templates"
              className="lg:col-span-2"
            />
          </div>
        </div>
      </Container>
    </Section>
  );
}
