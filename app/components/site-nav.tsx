import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Home, Layers, BookOpen, ScrollText, Info, Star } from "lucide-react";
import { Button } from "~/components/ui";
import { GithubIcon } from "~/components/icons/github";
import { TubeLightNavBar, type NavItem } from "~/components/tube-light-navbar";
import { SITE } from "~/lib/content";
import { useGithubStars, formatCount } from "~/lib/use-github-stars";

const NAV_ITEMS: NavItem[] = [
  { name: "Home", url: "/", icon: Home },
  { name: "Features", url: "/features", icon: Layers },
  { name: "Docs", url: "/docs", icon: BookOpen },
  { name: "Changelog", url: "/changelog", icon: ScrollText },
  { name: "About", url: "/about", icon: Info },
];

function RivetrMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <polygon
        points="11,1 20,6 20,16 11,21 2,16 2,6"
        fill="none"
        stroke="var(--color-brand-500)"
        strokeWidth="1.5"
      />
      <circle cx="11" cy="11" r="3.5" fill="var(--color-brand-500)" />
      <line x1="11" y1="4.5" x2="11" y2="7.5" stroke="var(--color-brand-400)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="11" y1="14.5" x2="11" y2="17.5" stroke="var(--color-brand-400)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function GithubStarButton() {
  const data = useGithubStars();
  return (
    <a
      href={SITE.github}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 rounded-lg border border-ink-600 px-3 py-2 text-sm text-mist-200 transition-all hover:border-brand-500/60 hover:bg-ink-800/60 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60"
      aria-label="Rivetr on GitHub"
    >
      <GithubIcon size={15} />
      <span className="hidden lg:inline">GitHub</span>
      {data && (
        <span className="inline-flex items-center gap-1 border-l border-ink-600 pl-2 text-mist-400">
          <Star size={12} className="fill-brand-400 text-brand-400" />
          {formatCount(data.stars)}
        </span>
      )}
    </a>
  );
}

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 12);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Chromeless top region: no bar of its own — the pill IS the nav.
          A faint scrim fades in on scroll just for legibility of the edges. */}
      <div
        className={[
          "pointer-events-none fixed inset-x-0 top-0 z-40 h-20 transition-opacity duration-200",
          scrolled
            ? "bg-gradient-to-b from-ink-950 to-transparent opacity-100"
            : "opacity-0",
        ].join(" ")}
        aria-hidden
      />
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
          {/* Wordmark */}
          <Link
            to="/"
            className="pointer-events-auto flex items-center gap-2 rounded text-base font-bold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60"
            aria-label="Rivetr home"
          >
            <RivetrMark />
            {SITE.name}
          </Link>

          {/* The nav itself — a floating tube-light pill (desktop). */}
          <div className="pointer-events-auto hidden md:block">
            <TubeLightNavBar items={NAV_ITEMS} />
          </div>

          {/* Right CTAs */}
          <div className="pointer-events-auto flex items-center gap-2 sm:gap-3">
            <GithubStarButton />
            <Button
              href="/docs"
              variant="primary"
              size="md"
              className="hidden sm:inline-flex"
            >
              Get started
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile: the signature bottom floating pill. */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 mb-5 flex justify-center md:hidden">
        <TubeLightNavBar
          items={NAV_ITEMS}
          className="pointer-events-auto shadow-lg shadow-black/40"
        />
      </div>
    </>
  );
}

export default SiteNav;
