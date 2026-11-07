import { parseThemeCookie, type Theme } from "./lib/theme";

/** Server-side read of the theme cookie. The write happens in the browser. */
export function getTheme(request: Request): Theme {
  return parseThemeCookie(request.headers.get("Cookie"));
}
