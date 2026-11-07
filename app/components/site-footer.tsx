import { Link } from "react-router";
import { GithubIcon } from "~/components/icons/github";
import { RivetrLogo } from "~/components/icons/logo";
import { Container } from "~/components/ui";
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
  const cls =
    "text-sm text-fg-muted transition-colors hover:text-fg-strong focus:outline-none focus-visible:text-fg-strong";
  if (href.startsWith("http")) {
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
    <footer className="border-t border-border">
      <Container>
        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-[15px] font-semibold text-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
            >
              <RivetrLogo size={20} />
              {SITE.name}
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-6 text-fg-muted">
              {SITE.tagline}.
            </p>
            <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.12em] text-fg-subtle">
              v{SITE.version} · MIT licensed · No telemetry
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.heading} className="lg:col-span-2">
              <h3 className="label-mono mb-4">{col.heading}</h3>
              <ul className="space-y-2.5" role="list">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <FooterLink href={link.href}>{link.label}</FooterLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>

      <div className="border-t border-border">
        <Container>
          <div className="flex h-14 items-center justify-between gap-4">
            <p className="font-mono text-[11px] text-fg-subtle">
              © {year} {SITE.name}
            </p>
            <a
              href={SITE.github}
              target="_blank"
              rel="noreferrer"
              aria-label="Rivetr on GitHub"
              className="text-fg-subtle transition-colors hover:text-fg-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
            >
              <GithubIcon size={15} />
            </a>
          </div>
        </Container>
      </div>
    </footer>
  );
}

export default SiteFooter;
