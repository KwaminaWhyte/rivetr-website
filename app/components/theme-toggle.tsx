import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useRouteLoaderData } from "react-router";

import { serializeThemeCookie, themeColorFor, type Theme } from "~/lib/theme";

type RootLoader = typeof import("~/root").loader;

/**
 * Theme toggle.
 *
 * The theme is chosen in the browser and written straight to the cookie that
 * the root loader reads, then applied to <html>. No action, no request, so
 * the switch cannot fail or knock the page into an error boundary.
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const rootData = useRouteLoaderData<RootLoader>("root");
  const serverTheme: Theme = rootData?.theme === "light" ? "light" : "dark";
  const [theme, setTheme] = useState<Theme>(serverTheme);

  // Keep in step if the server render changes (e.g. after a reload).
  useEffect(() => {
    setTheme(serverTheme);
  }, [serverTheme]);

  function apply(next: Theme) {
    setTheme(next);
    document.documentElement.dataset.theme = next;
    document.documentElement.style.colorScheme = next;
    document.cookie = serializeThemeCookie(next);
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", themeColorFor(next));
  }

  const next: Theme = theme === "dark" ? "light" : "dark";
  const label = next === "light" ? "Switch to light theme" : "Switch to dark theme";

  return (
    <button
      type="button"
      onClick={() => apply(next)}
      aria-label={label}
      title={label}
      className={[
        "inline-flex size-8 items-center justify-center rounded-md text-fg-subtle transition-colors",
        "hover:bg-surface-strong hover:text-fg-strong",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400",
        className,
      ].join(" ")}
    >
      {theme === "dark" ? (
        <Sun size={15} aria-hidden="true" />
      ) : (
        <Moon size={15} aria-hidden="true" />
      )}
    </button>
  );
}

export default ThemeToggle;
