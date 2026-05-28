// The Rivetr mark: a squircle in the brand gradient with a white hex bolt head
// and a cut-out socket, a nod to "rivet" (a fastener). Scales cleanly down to
// favicon sizes. Keep this in sync with public/favicon.svg.
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
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      role="img"
      aria-label={title}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="rivetr-g" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fdba74" />
          <stop offset="0.45" stopColor="#fb923c" />
          <stop offset="1" stopColor="#ea580c" />
        </linearGradient>
      </defs>
      {/* squircle */}
      <rect x="1" y="1" width="30" height="30" rx="9" fill="url(#rivetr-g)" />
      {/* hex bolt head */}
      <path
        d="M16 7.2 L23.6 11.6 L23.6 20.4 L16 24.8 L8.4 20.4 L8.4 11.6 Z"
        fill="#fff"
      />
      {/* socket: reveals the gradient through the head */}
      <circle cx="16" cy="16" r="3.4" fill="url(#rivetr-g)" />
    </svg>
  );
}
