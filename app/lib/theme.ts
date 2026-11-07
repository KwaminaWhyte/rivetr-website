export type Theme = "dark" | "light";

export function themeColorFor(theme: Theme): string {
  return theme === "light" ? "#f7f7fb" : "#06070d";
}
