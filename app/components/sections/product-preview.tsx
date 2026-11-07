import { useState } from "react";
import { Container, Section, SectionHeading } from "~/components/ui";
import { BrowserFrame } from "~/components/browser-frame";

const SHOTS = [
  {
    id: "projects",
    label: "Projects",
    src: "/screenshots/projects.png",
    url: "rivetr.example.com/projects",
    alt: "Rivetr projects page with health pills, search, sort, and list, grid, and canvas views",
    title: "Every project, one glance",
    body: "Projects show a health pill, their environments, and every app, database, and service inside. Failing resources sort first.",
  },
  {
    id: "canvas",
    label: "Canvas",
    src: "/screenshots/dashboard.png",
    url: "rivetr.example.com/dashboard",
    alt: "Rivetr dashboard with a zoomable canvas of projects, environments, and resources with live status",
    title: "A map of your infrastructure",
    body: "The projects canvas is zoomable, filterable, and live. Open a side panel, follow a link, or switch back to list and grid views.",
  },
  {
    id: "app",
    label: "App overview",
    src: "/screenshots/app-overview.png",
    url: "rivetr.example.com/apps/storefront-web",
    alt: "Rivetr app overview with live CPU, memory, network, and storage usage plus configuration and recent activity",
    title: "The details that matter",
    body: "Live CPU, memory, network, and storage sit above configuration, activity, and AI insights. No hunting through tabs.",
  },
  {
    id: "appearance",
    label: "Appearance",
    src: "/screenshots/appearance.png",
    url: "rivetr.example.com/account/appearance",
    alt: "Rivetr appearance settings with light, dark, and system modes, accent colours, corners, density, font, and accessibility options",
    title: "Every user can make it theirs",
    body: "Mode, accent, neutral, radius, density, font, sidebar style, reduced motion, and high contrast. Saved per account.",
  },
] as const;

export function ProductPreview() {
  const [active, setActive] = useState<(typeof SHOTS)[number]["id"]>("projects");
  const shot = SHOTS.find((item) => item.id === active) ?? SHOTS[0];

  return (
    <Section id="product" className="relative overflow-hidden">
      <div
        className="aurora pointer-events-none absolute inset-x-0 top-10 -z-10 h-72"
        aria-hidden
      />
      <Container>
        <SectionHeading
          eyebrow="The dashboard"
          title="A real control plane, not a config file"
          blurb="Apps, databases, services, servers, deployments, and 365 templates from one UI. Or use the CLI, the TUI, the API, or the MCP server. Everything ships in the binary."
        />

        <div
          className="mt-12 flex flex-wrap justify-center gap-2"
          role="tablist"
          aria-label="Dashboard screenshots"
        >
          {SHOTS.map((item) => {
            const isActive = item.id === active;
            return (
              <button
                key={item.id}
                id={`shot-tab-${item.id}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls="shot-panel"
                onClick={() => setActive(item.id)}
                className={[
                  "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60",
                  isActive
                    ? "border-brand-500/50 bg-brand-500/10 text-brand-300"
                    : "border-border bg-surface text-subtle hover:border-border-strong hover:text-strong",
                ].join(" ")}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="mt-8 grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div
            id="shot-panel"
            role="tabpanel"
            aria-labelledby={`shot-tab-${shot.id}`}
            tabIndex={0}
            className="min-w-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60"
          >
            <BrowserFrame
              src={shot.src}
              alt={shot.alt}
              url={shot.url}
              className="shadow-brand-900/30"
            />
          </div>

          <div className="lg:pl-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-400">
              {String(SHOTS.indexOf(shot) + 1).padStart(2, "0")} / {String(SHOTS.length).padStart(2, "0")}
            </p>
            <h3 className="mt-2 text-xl font-semibold text-strong">{shot.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-subtle">{shot.body}</p>
            <dl className="mt-6 space-y-3 border-t border-border pt-4 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-subtle">Available in</dt>
                <dd className="font-medium text-fg">1.0.0</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-subtle">Needs</dt>
                <dd className="font-medium text-fg">Docker or Podman</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-subtle">External services</dt>
                <dd className="font-medium text-fg">None</dd>
              </div>
            </dl>
          </div>
        </div>
      </Container>
    </Section>
  );
}
