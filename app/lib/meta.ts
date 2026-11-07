// Shared meta for every page. React Router uses the leaf route's meta export
// in place of the root one, so each page calls this to keep the social tags.
type MatchLike = { id?: string; loaderData?: unknown; data?: unknown };

export function siteOrigin(
  matches: (MatchLike | undefined)[] | undefined,
): string {
  const root = matches?.find((match) => match?.id === "root");
  const data = (root?.loaderData ?? root?.data) as
    | { origin?: string }
    | undefined;
  return data?.origin ?? "";
}

export function pageMeta({
  title,
  description,
  type = "website",
  origin = "",
}: {
  title: string;
  description: string;
  type?: "website" | "article";
  origin?: string;
}) {
  // Social scrapers want an absolute image URL; fall back to a root path when
  // the origin is not available (for example during a static render).
  const image = origin ? `${origin}/og-image.png` : "/og-image.png";

  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: type },
    { property: "og:site_name", content: "Rivetr" },
    { property: "og:image", content: image },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image },
  ];
}
