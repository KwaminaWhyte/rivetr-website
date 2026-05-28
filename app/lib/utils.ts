// Minimal className combiner (clsx-style) — the project isn't a shadcn install,
// so we ship our own instead of pulling in clsx + tailwind-merge.
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
