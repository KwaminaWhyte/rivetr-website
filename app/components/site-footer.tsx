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
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Docs", href: SITE.docs },
      { label: "GitHub", href: SITE.github },
      { label: "Changelog", href: `${SITE.github}/blob/main/CHANGELOG.md` },
    ],
  },
  {
    heading: "Project",
    links: [
      { label: "License (MIT)", href: `${SITE.github}/blob/main/LICENSE` },
      { label: "Issues", href: `${SITE.github}/issues` },
      { label: "Contributing", href: `${SITE.github}/blob/main/CONTRIBUTING.md` },
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
      {/* Main content */}
      <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded text-base font-bold text-strong transition-colors hover:text-brand-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60"
            >
              <RivetrLogo size={22} />
              {SITE.name}
            </Link>
            <p className="mt-2 text-sm text-subtle leading-relaxed">
              {SITE.tagline}
            </p>
            {/* Install command chip */}
            <div className="mt-4 inline-flex items-center rounded-md border border-border-strong bg-surface-strong px-3 py-1.5">
              <code className="font-mono text-xs text-brand-300 select-all">
                {SITE.installCmd}
              </code>
            </div>
          </div>

          {/* Link columns */}
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

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <p className="text-xs text-subtle">
            &copy; {year} {SITE.name} &middot; MIT licensed
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
