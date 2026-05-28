export type Theme = "dark" | "light";

export function themeColorFor(theme: Theme): string {
  return theme === "light" ? "#faf7f2" : "#07090d";
}
