import { useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { useFetcher, useRouteLoaderData } from "react-router";

type Theme = "dark" | "light";
type RootLoader = typeof import("~/root").loader;
type RootAction = typeof import("~/root").action;

function themeColorFor(theme: Theme): string {
  return theme === "light" ? "#faf7f2" : "#07090d";
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const rootData = useRouteLoaderData<RootLoader>("root");
  const fetcher = useFetcher<RootAction>();

  const serverTheme: Theme = rootData?.theme === "light" ? "light" : "dark";
  const optimisticRaw = fetcher.formData?.get("theme");
  const optimisticTheme: Theme | null =
    optimisticRaw === "light" || optimisticRaw === "dark"
      ? (optimisticRaw as Theme)
      : null;
  const theme: Theme = optimisticTheme ?? serverTheme;

  // While the fetcher is in-flight (or after it lands but before the next
  // server render), reflect the optimistic theme on <html data-theme> so the
  // CSS variables flip instantly. SSR already paints the correct theme based
  // on the cookie, so this effect is purely for post-click feedback.
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", themeColorFor(theme));
  }, [theme]);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    fetcher.submit({ theme: next }, { method: "POST", action: "/" });
  }

  const isLight = theme === "light";
  const label = isLight ? "Switch to dark theme" : "Switch to light theme";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={[
        "inline-flex h-9 w-9 items-center justify-center rounded-full text-fg-muted transition-colors",
        "hover:bg-surface-strong/70 hover:text-fg-strong",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60",
        className,
      ].join(" ")}
    >
      {/* Render both icons to keep markup stable; only one is visible. */}
      <Sun
        size={16}
        aria-hidden="true"
        className={isLight ? "hidden" : "block"}
      />
      <Moon
        size={16}
        aria-hidden="true"
        className={isLight ? "block" : "hidden"}
      />
    </button>
  );
}

export default ThemeToggle;
