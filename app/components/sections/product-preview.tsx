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
    <Section id="product">
      <Container>
        <SectionHeading
          eyebrow="The dashboard"
          title="A real control plane, not a config file"
          blurb="Apps, databases, services, servers, deployments, and 365 templates from one UI. Or use the CLI, the TUI, the API, or the MCP server. Everything ships in the binary."
        />

        <div className="mt-10">
          <div
            className="flex gap-6 border-b border-border"
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
                    "-mb-px border-b-2 pb-3 text-[13.5px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400",
                    isActive
                      ? "border-fg-strong font-medium text-fg-strong"
                      : "border-transparent text-fg-subtle hover:text-fg-strong",
                  ].join(" ")}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:gap-10">
          <div
            id="shot-panel"
            role="tabpanel"
            aria-labelledby={`shot-tab-${shot.id}`}
            tabIndex={0}
            className="min-w-0 lg:col-span-9 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
          >
            <BrowserFrame src={shot.src} alt={shot.alt} url={shot.url} />
          </div>

          <div className="lg:col-span-3">
            <p className="font-mono text-xs text-fg-subtle">
              {String(SHOTS.indexOf(shot) + 1).padStart(2, "0")} /{" "}
              {String(SHOTS.length).padStart(2, "0")}
            </p>
            <h3 className="mt-3 text-lg font-medium tracking-[-0.01em] text-strong">
              {shot.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-fg-muted">{shot.body}</p>
            <dl className="mt-6 border-t border-border text-[13px]">
              {[
                ["Available in", "1.0.0"],
                ["Needs", "Docker or Podman"],
                ["External services", "None"],
              ].map(([label, value], i) => (
                <div
                  key={label}
                  className={[
                    "flex items-baseline justify-between gap-4 py-2.5",
                    i > 0 ? "border-t border-border" : "",
                  ].join(" ")}
                >
                  <dt className="text-fg-subtle">{label}</dt>
                  <dd className="text-right font-medium text-fg-strong">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Container>
    </Section>
  );
}
