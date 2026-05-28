// Shared design-system primitives for the Rivetr site.
import { Link } from "react-router";
import type { ReactNode } from "react";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function Container({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cx("mx-auto w-full max-w-6xl px-5 sm:px-8", className)}>
      {children}
    </div>
  );
}

type ButtonProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost" | "outline";
  size?: "md" | "lg";
  className?: string;
};

export function Button({
  href,
  children,
  variant = "primary",
  size = "md",
  className,
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60";
  const sizes = {
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };
  const variants = {
    primary:
      "bg-brand-500 text-white hover:bg-brand-400 hover:-translate-y-0.5 shadow-[0_8px_30px_-8px_rgba(249,115,22,0.6)]",
    outline:
      "border border-ink-600 text-mist-200 hover:border-brand-500/60 hover:text-white hover:bg-ink-800/60",
    ghost: "text-mist-300 hover:text-white hover:bg-ink-800/60",
  };
  const cls = cx(base, sizes[size], variants[variant], className);
  const external = href.startsWith("http");
  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={cls}>
        {children}
      </a>
    );
  }
  return (
    <Link to={href} className={cls}>
      {children}
    </Link>
  );
}

export function Badge({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-300",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  blurb,
  align = "center",
}: {
  eyebrow?: string;
  title: ReactNode;
  blurb?: ReactNode;
  align?: "center" | "left";
}) {
  return (
    <div
      className={cx(
        "max-w-2xl",
        align === "center" ? "mx-auto text-center" : "text-left",
      )}
    >
      {eyebrow && (
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-brand-400">
          {eyebrow}
        </p>
      )}
      <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
        {title}
      </h2>
      {blurb && (
        <p className="mt-4 text-lg leading-relaxed text-mist-400">{blurb}</p>
      )}
    </div>
  );
}

// Section wrapper with consistent vertical rhythm + optional id anchor.
export function Section({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={cx("py-20 sm:py-28", className)}>
      {children}
    </section>
  );
}
