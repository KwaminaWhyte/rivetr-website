import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { Home, Layers, BookOpen, ScrollText, Info, Star, Menu, X } from "lucide-react";
import { Button } from "~/components/ui";
import { GithubIcon } from "~/components/icons/github";
import { TubeLightNavBar, type NavItem } from "~/components/tube-light-navbar";
import { RivetrLogo } from "~/components/icons/logo";
import { ThemeToggle } from "~/components/theme-toggle";
import { SITE } from "~/lib/content";
import { useGithubStars, formatCount } from "~/lib/use-github-stars";

const NAV_ITEMS: NavItem[] = [
  { name: "Home", url: "/", icon: Home },
  { name: "Features", url: "/features", icon: Layers },
  { name: "Docs", url: "/docs", icon: BookOpen },
  { name: "Changelog", url: "/changelog", icon: ScrollText },
  { name: "About", url: "/about", icon: Info },
];

function GithubStarButton() {
  const data = useGithubStars();
  return (
    <a
      href={SITE.github}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm text-muted transition-colors hover:bg-surface-strong/70 hover:text-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60"
      aria-label="Rivetr on GitHub"
    >
      <GithubIcon size={15} />
      {data && (
        <span className="inline-flex items-center gap-1 text-subtle">
          <Star size={12} className="fill-brand-400 text-brand-400" />
          {formatCount(data.stars)}
        </span>
      )}
    </a>
  );
}

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 12);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu after navigation.
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

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex flex-col items-center px-3 pt-4">
      {/* One pill holds everything: wordmark, nav (with lamp), and actions. */}
      <div
        className={[
          "pointer-events-auto relative flex max-w-full items-center gap-1 rounded-full border border-border bg-surface/75 p-1.5 backdrop-blur-xl transition-shadow duration-200",
          scrolled ? "shadow-lg shadow-black/30" : "",
        ].join(" ")}
      >
        {/* Wordmark */}
        <Link
          to="/"
          className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-bold text-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60"
          aria-label="Rivetr home"
        >
          <RivetrLogo size={22} />
          <span className="hidden sm:inline">{SITE.name}</span>
          <span className="hidden rounded-full border border-brand-500/30 bg-brand-500/10 px-1.5 py-0.5 font-mono text-[10px] font-medium text-brand-300 md:inline">
            v{SITE.version}
          </span>
        </Link>

        <span className="mx-1 hidden h-5 w-px shrink-0 bg-border sm:block" aria-hidden />

        {/* Nav links with the tube-light lamp */}
        <div className="hidden sm:block">
          <TubeLightNavBar items={NAV_ITEMS} bare />
        </div>

        <span className="mx-1 hidden h-5 w-px shrink-0 bg-border sm:block" aria-hidden />

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <div className="hidden items-center gap-1 sm:flex">
            <GithubStarButton />
            <Button href="/docs/quick-start" variant="primary" className="rounded-full">
              Get started
            </Button>
          </div>

          {/* Mobile menu */}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-strong/70 hover:text-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60 sm:hidden"
          >
            {menuOpen ? <X size={17} /> : <Menu size={17} />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div
            id="mobile-menu"
            className="absolute left-1/2 top-[calc(100%+0.5rem)] w-[calc(100vw-1.5rem)] max-w-sm -translate-x-1/2 rounded-2xl border border-border bg-surface/95 p-2 shadow-2xl shadow-black/40 backdrop-blur-xl sm:hidden"
          >
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active =
                item.url === "/" ? pathname === "/" : pathname.startsWith(item.url);
              return (
                <Link
                  key={item.name}
                  to={item.url}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-brand-500/10 text-brand-300"
                      : "text-muted hover:bg-surface-strong hover:text-strong",
                  ].join(" ")}
                >
                  <Icon size={16} aria-hidden />
                  {item.name}
                </Link>
              );
            })}
            <div className="mt-2 flex items-center gap-2 border-t border-border pt-2">
              <a
                href={SITE.github}
                target="_blank"
                rel="noreferrer"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-surface-strong hover:text-strong"
              >
                <GithubIcon size={16} />
                GitHub
              </a>
              <Button href="/docs/quick-start" className="flex-1 justify-center">
                Get started
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default SiteNav;
