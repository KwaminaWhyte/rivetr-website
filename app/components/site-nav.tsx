import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { Menu, X } from "lucide-react";
import { Button, Container } from "~/components/ui";
import { GithubIcon } from "~/components/icons/github";
import { RivetrLogo } from "~/components/icons/logo";
import { ThemeToggle } from "~/components/theme-toggle";
import { SITE } from "~/lib/content";
import { useGithubStars, formatCount } from "~/lib/use-github-stars";

const NAV_ITEMS = [
  { name: "Features", url: "/features" },
  { name: "Docs", url: "/docs" },
  { name: "Changelog", url: "/changelog" },
  { name: "About", url: "/about" },
];

function GithubLink({ className = "" }: { className?: string }) {
  const data = useGithubStars();
  return (
    <a
      href={SITE.github}
      target="_blank"
      rel="noreferrer"
      aria-label="Rivetr on GitHub"
      className={`inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-sm text-fg-subtle transition-colors hover:bg-surface-strong hover:text-fg-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 ${className}`}
    >
      <GithubIcon size={15} />
      {data && (
        <span className="font-mono text-xs tabular-nums">
          {formatCount(data.stars)}
        </span>
      )}
    </a>
  );
}

export function SiteNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isActive = (url: string) =>
    url === "/" ? pathname === "/" : pathname.startsWith(url);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/85 backdrop-blur-md">
      <Container>
        <div className="flex h-14 items-center gap-8">
          <Link
            to="/"
            aria-label="Rivetr home"
            className="flex shrink-0 items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
          >
            <RivetrLogo size={20} />
            <span className="text-[15px] font-semibold tracking-[-0.01em] text-strong">
              {SITE.name}
            </span>
            <span className="hidden font-mono text-[11px] text-fg-subtle sm:inline">
              v{SITE.version}
            </span>
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.url);
              return (
                <Link
                  key={item.name}
                  to={item.url}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "rounded-md px-2.5 py-1.5 text-[13.5px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400",
                    active
                      ? "font-medium text-fg-strong"
                      : "text-fg-muted hover:text-fg-strong",
                  ].join(" ")}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-1.5">
            <ThemeToggle />
            <span className="hidden sm:block">
              <GithubLink />
            </span>
            <span className="ml-1 hidden sm:block">
              <Button href="/docs/quick-start">Get started</Button>
            </span>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="inline-flex size-8 items-center justify-center rounded-md text-fg-muted transition-colors hover:bg-surface-strong hover:text-fg-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 md:hidden"
            >
              {menuOpen ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>
        </div>
      </Container>

      {menuOpen && (
        <div id="mobile-menu" className="border-t border-border md:hidden">
          <Container>
            <nav aria-label="Mobile" className="flex flex-col py-3">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.name}
                  to={item.url}
                  aria-current={isActive(item.url) ? "page" : undefined}
                  className={[
                    "rounded-md px-2 py-2.5 text-sm transition-colors",
                    isActive(item.url)
                      ? "font-medium text-fg-strong"
                      : "text-fg-muted hover:bg-surface-strong hover:text-fg-strong",
                  ].join(" ")}
                >
                  {item.name}
                </Link>
              ))}
              <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
                <Button href="/docs/quick-start" className="flex-1 justify-center">
                  Get started
                </Button>
                <a
                  href={SITE.github}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-9 items-center gap-2 rounded-md border border-border-strong px-3 text-sm text-fg-muted transition-colors hover:text-fg-strong"
                >
                  <GithubIcon size={15} />
                  GitHub
                </a>
              </div>
            </nav>
          </Container>
        </div>
      )}
    </header>
  );
}

export default SiteNav;
