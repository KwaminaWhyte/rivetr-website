// Frames a product screenshot in browser chrome. The screenshot stays
// unfiltered; the surrounding frame carries the site's theme.
export function BrowserFrame({
  src,
  alt,
  url,
  width = 1440,
  height = 900,
  priority = false,
  className,
}: {
  src: string;
  alt: string;
  url: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
}) {
  return (
    <figure
      className={`overflow-hidden rounded-2xl border border-border-strong/80 bg-surface shadow-2xl shadow-black/40 ${className ?? ""}`}
    >
      <div className="flex items-center gap-2 border-b border-border bg-elevated px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-border-strong" aria-hidden />
        <span className="h-2.5 w-2.5 rounded-full bg-border-strong" aria-hidden />
        <span className="h-2.5 w-2.5 rounded-full bg-border-strong" aria-hidden />
        <div className="ml-3 flex min-w-0 flex-1 items-center gap-2">
          <span className="inline-flex min-w-0 items-center gap-1.5 rounded-md bg-bg/70 px-2.5 py-1 font-mono text-[11px] text-subtle">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-green-400/80" aria-hidden />
            <span className="truncate">{url}</span>
          </span>
        </div>
      </div>
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        className="block h-auto w-full"
      />
    </figure>
  );
}
