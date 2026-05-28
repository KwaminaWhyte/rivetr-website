import { useEffect, useState } from "react";

// Fetches live star/fork counts for the repo, client-side only.
// Returns null until loaded; callers should render gracefully without it.
export function useGithubStars(repo = "KwaminaWhyte/rivetr") {
  const [data, setData] = useState<{ stars: number; forks: number } | null>(
    null,
  );

  useEffect(() => {
    let alive = true;
    fetch(`https://api.github.com/repos/${repo}`, {
      headers: { Accept: "application/vnd.github+json" },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (alive && j) {
          setData({
            stars: j.stargazers_count ?? 0,
            forks: j.forks_count ?? 0,
          });
        }
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [repo]);

  return data;
}

export function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(n);
}
