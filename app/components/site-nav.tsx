import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Home, Layers, BookOpen, ScrollText, Info, Star } from "lucide-react";
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

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 12);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-4">
      {/* One pill holds everything: wordmark · nav (with lamp) · CTAs. */}
      <div
        className={[
          "pointer-events-auto flex max-w-full items-center gap-1 rounded-full border border-border bg-surface/70 p-1.5 backdrop-blur-lg transition-shadow duration-200",
          scrolled ? "shadow-lg shadow-black/40" : "",
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
        </Link>

        <span className="mx-1 h-5 w-px shrink-0 bg-border" aria-hidden />

        {/* Nav links with the tube-light lamp */}
        <TubeLightNavBar items={NAV_ITEMS} bare />

        <span className="mx-1 hidden h-5 w-px shrink-0 bg-border sm:block" aria-hidden />

        {/* CTAs — theme toggle is always visible, GH/CTA hide on mobile */}
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <div className="hidden items-center gap-1 sm:flex">
            <GithubStarButton />
            <Button href="/docs" variant="primary" className="rounded-full">
              Get started
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default SiteNav;
