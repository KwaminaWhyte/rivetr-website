import { Link } from "react-router";
import { GithubIcon } from "~/components/icons/github";
import { RivetrLogo } from "~/components/icons/logo";
import { SITE } from "~/lib/content";

const COLUMNS = [
  {
    heading: "Product",
    links: [
      { label: "Features", href: "/features" },
      { label: "Compare", href: "/#compare" },
      { label: "How it works", href: "/#how" },
      { label: "Changelog", href: "/changelog" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Documentation", href: "/docs" },
      { label: "Quick start", href: "/docs/quick-start" },
      { label: "REST API", href: "/docs/api" },
      { label: "MCP server", href: "/docs/mcp-server" },
    ],
  },
  {
    heading: "Project",
    links: [
      { label: "GitHub", href: SITE.github },
      { label: "Releases", href: SITE.releases },
      { label: "License (MIT)", href: `${SITE.github}/blob/main/LICENSE` },
      { label: "Contributing", href: "/docs/contributing" },
    ],
  },
];

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  const external = href.startsWith("http");
  const cls =
    "text-sm text-subtle hover:text-strong transition-colors duration-150 focus:outline-none focus-visible:text-strong";

  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={cls}>
        {children}
      </a>
    );
  }
  return (
    <Link to={href} className={cls}>
      {children}
    </Link>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-elevated">
      <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded text-base font-bold text-strong transition-colors hover:text-brand-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60"
            >
              <RivetrLogo size={22} />
              {SITE.name}
              <span className="rounded-full border border-border-strong px-1.5 py-0.5 font-mono text-[10px] font-medium text-subtle">
                v{SITE.version}
              </span>
            </Link>
            <p className="mt-2 text-sm text-subtle leading-relaxed">
              {SITE.tagline}
            </p>
            <div className="mt-4 inline-flex max-w-full items-center rounded-md border border-border-strong bg-surface-strong px-3 py-1.5">
              <code className="truncate font-mono text-xs text-brand-300 select-all">
                {SITE.installCmd}
              </code>
            </div>
            <p className="mt-3 text-xs text-subtle">
              Released {SITE.released}. MIT licensed.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted">
                {col.heading}
              </h3>
              <ul className="space-y-3" role="list">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <FooterLink href={link.href}>{link.label}</FooterLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <p className="text-xs text-subtle">
            &copy; {year} {SITE.name} &middot; MIT licensed &middot; No telemetry
          </p>
          <a
            href={SITE.github}
            target="_blank"
            rel="noreferrer"
            className="text-subtle hover:text-strong transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60 rounded"
            aria-label="Rivetr on GitHub"
          >
            <GithubIcon size={16} />
          </a>
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;
