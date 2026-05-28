import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Menu, X } from "lucide-react";
import { Button } from "~/components/ui";
import { GithubIcon } from "~/components/icons/github";
import { SITE, NAV_LINKS } from "~/lib/content";

function RivetrMark() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {/* Hexagonal rivet/bolt shape */}
      <polygon
        points="11,1 20,6 20,16 11,21 2,16 2,6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-brand-500"
        style={{ stroke: "var(--color-brand-500)" }}
      />
      <circle cx="11" cy="11" r="3.5" fill="var(--color-brand-500)" />
      <line
        x1="11"
        y1="4.5"
        x2="11"
        y2="7.5"
        stroke="var(--color-brand-400)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="11"
        y1="14.5"
        x2="11"
        y2="17.5"
        stroke="var(--color-brand-400)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function NavLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  const external = href.startsWith("http");
  const cls =
    "text-sm text-mist-300 hover:text-white transition-colors duration-150 focus:outline-none focus-visible:text-white";

  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={cls} onClick={onClick}>
        {children}
      </a>
    );
  }
  return (
    <Link to={href} className={cls} onClick={onClick}>
      {children}
    </Link>
  );
}

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 12);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header
      className={[
        "fixed inset-x-0 top-0 z-50 transition-all duration-200",
        scrolled
          ? "border-b border-ink-700 bg-ink-950/80 backdrop-blur-md"
          : "border-b border-transparent bg-transparent",
      ].join(" ")}
    >
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
        {/* Wordmark */}
        <Link
          to="/"
          className="flex items-center gap-2 text-white font-bold text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60 rounded"
          aria-label="Rivetr home"
        >
          <RivetrMark />
          {SITE.name}
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.href} href={link.href}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Button href={SITE.github} variant="outline" size="md">
            <GithubIcon size={15} />
            GitHub
          </Button>
          <Button href="#install" variant="primary" size="md">
            Get started
          </Button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden inline-flex items-center justify-center rounded p-2 text-mist-300 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          id="mobile-menu"
          role="dialog"
          aria-label="Navigation menu"
          className="md:hidden border-t border-ink-700 bg-ink-950/95 backdrop-blur-md px-5 pb-5 pt-4"
        >
          <nav
            className="flex flex-col gap-4"
            aria-label="Mobile navigation"
          >
            {NAV_LINKS.map((link) => (
              <NavLink key={link.href} href={link.href} onClick={closeMenu}>
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-5 flex flex-col gap-3">
            <Button href={SITE.github} variant="outline" size="md">
              <GithubIcon size={15} />
              GitHub
            </Button>
            <Button href="#install" variant="primary" size="md">
              Get started
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}

export default SiteNav;
