export type Theme = "dark" | "light";

export const THEME_COOKIE = "theme";
export const THEME_MAX_AGE = 60 * 60 * 24 * 365;

export function themeColorFor(theme: Theme): string {
  return theme === "light" ? "#fcfcfb" : "#0a0a0b";
}

/**
 * Read the theme from a Cookie header.
 *
 * Accepts both the plain value this app writes (`theme=light`) and the
 * base64-encoded JSON an older build wrote (`theme=ImxpZ2h0Ig%3D%3D`), so
 * returning visitors keep their preference.
 */
export function parseThemeCookie(cookieHeader: string | null): Theme {
  if (!cookieHeader) return "dark";

  const match = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${THEME_COOKIE}=`));
  if (!match) return "dark";

  let value = match.slice(THEME_COOKIE.length + 1);

  try {
    value = decodeURIComponent(value);
  } catch {
    // Keep the raw value if it is not valid percent-encoding.
  }

  if (value === "light" || value === "dark") return value;

  // Legacy format: base64 of a JSON string.
  try {
    const decoded = atob(value);
    const parsed = JSON.parse(decoded);
    if (parsed === "light" || parsed === "dark") return parsed;
  } catch {
    // Not base64 JSON. Fall through to the default.
  }

  return "dark";
}

/** Serialize the theme cookie. Client-safe: no server APIs, no async. */
export function serializeThemeCookie(theme: Theme): string {
  return `${THEME_COOKIE}=${theme}; Path=/; Max-Age=${THEME_MAX_AGE}; SameSite=Lax`;
}
