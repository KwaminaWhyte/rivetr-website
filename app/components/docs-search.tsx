import { useMemo, useState } from "react";
import { Link } from "react-router";
import { Search, X } from "lucide-react";
import { searchDocs } from "~/lib/docs-content";

export function DocsSearch({
  onNavigate,
  onQueryChange,
}: {
  onNavigate?: () => void;
  onQueryChange?: (query: string) => void;
}) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => searchDocs(query), [query]);
  const searching = query.trim().length >= 2;

  return (
    <div className="mb-6">
      <div className="relative">
        <Search
          size={14}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-subtle"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            onQueryChange?.(event.target.value);
          }}
          placeholder="Search docs"
          aria-label="Search documentation"
          className="w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-9 text-sm text-fg placeholder:text-subtle focus:border-brand-500/50 focus:outline-none focus:ring-2 focus:ring-brand-400/30"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              onQueryChange?.("");
            }}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-subtle hover:text-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60"
          >
            <X size={13} aria-hidden />
          </button>
        )}
      </div>

      <div aria-live="polite">
        {searching && (
          <div className="mt-2 space-y-1.5">
            {results.length === 0 ? (
              <p className="rounded-lg border border-border bg-surface px-3 py-2 text-xs text-subtle">
                No pages match “{query.trim()}”.
              </p>
            ) : (
              <>
                <p className="px-1 text-[10px] font-semibold uppercase tracking-widest text-subtle">
                  {results.length} {results.length === 1 ? "result" : "results"}
                </p>
                {results.map((result) => (
                  <Link
                    key={result.slug}
                    to={`/docs/${result.slug}`}
                    onClick={onNavigate}
                    className="block rounded-lg border border-border bg-surface px-3 py-2 transition-colors hover:border-brand-500/40 hover:bg-surface-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60"
                  >
                    <span className="block text-xs font-semibold text-strong">
                      {result.title}
                    </span>
                    {result.heading && (
                      <span className="mt-0.5 block text-[11px] font-medium text-brand-300">
                        {result.heading}
                      </span>
                    )}
                    <span className="mt-1 line-clamp-2 block text-[11px] leading-relaxed text-subtle">
                      {result.snippet}
                    </span>
                  </Link>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
