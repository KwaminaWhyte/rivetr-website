import { createCookie } from "react-router";
import type { Theme } from "./lib/theme";

// Cookie holds a bare string ("dark" | "light"). createCookie JSON-encodes,
// so the on-the-wire value is a JSON string. parse() returns the same string.
export const themeCookie = createCookie("theme", {
  maxAge: 60 * 60 * 24 * 365, // 1 year
  path: "/",
  sameSite: "lax",
  httpOnly: false,
});

export async function getTheme(request: Request): Promise<Theme> {
  const value = await themeCookie.parse(request.headers.get("Cookie"));
  return value === "light" ? "light" : "dark";
}
