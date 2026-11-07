// The Rivetr mark: indigo tile with the white R monogram, matching the
// dashboard and product favicons. Keep the source in public/brand.
export function RivetrLogo({
  size = 28,
  className,
  title = "Rivetr",
}: {
  size?: number;
  className?: string;
  title?: string;
}) {
  return (
    <img
      src="/brand/rivetr-mark-128.png"
      width={size}
      height={size}
      alt={title}
      className={className}
      decoding="async"
    />
  );
}
