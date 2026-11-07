// Frames a product screenshot in a quiet browser bar. The screenshot stays
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
      className={`frame-shadow overflow-hidden rounded-lg border border-border-strong bg-surface ${className ?? ""}`}
    >
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <span className="size-2 rounded-full bg-border-strong" aria-hidden />
        <span className="size-2 rounded-full bg-border-strong" aria-hidden />
        <span className="size-2 rounded-full bg-border-strong" aria-hidden />
        <span className="ml-2 truncate font-mono text-[11px] text-fg-subtle">
          {url}
        </span>
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
