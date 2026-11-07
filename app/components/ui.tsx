// Shared design-system primitives for the Rivetr site.
//
// Editorial layout: a 12-column grid, hairline rules, one accent. Hierarchy
// comes from type size and space, not from gradients, glows, or tinted cards.
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
    <div className={cx("mx-auto w-full max-w-[1180px] px-6 sm:px-8", className)}>
      {children}
    </div>
  );
}

type ButtonProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "outline" | "ghost";
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
    "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]";
  const sizes = {
    md: "h-9 px-3.5 text-sm",
    lg: "h-10 px-4 text-sm",
  };
  const variants = {
    primary: "bg-brand-600 text-white hover:bg-brand-700",
    outline:
      "border border-border-strong bg-surface text-fg-strong hover:bg-surface-strong",
    ghost: "text-fg-muted hover:bg-surface-strong hover:text-fg-strong",
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

/** A quiet inline label. Not a pill, not a chip: a dot and small mono type. */
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
        "inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-fg-subtle",
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-brand-400" aria-hidden="true" />
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  blurb,
  align = "left",
}: {
  eyebrow?: string;
  title: ReactNode;
  blurb?: ReactNode;
  align?: "center" | "left";
}) {
  if (align === "center") {
    return (
      <div className="mx-auto max-w-2xl text-center">
        {eyebrow && <p className="label-mono mb-4">{eyebrow}</p>}
        <h2 className="text-[1.75rem] font-semibold leading-[1.15] tracking-[-0.02em] text-strong sm:text-[2.25rem]">
          {title}
        </h2>
        {blurb && (
          <p className="mt-4 text-[15px] leading-7 text-muted">{blurb}</p>
        )}
      </div>
    );
  }

  return (
    <div className="border-t border-border pt-8">
      <div className="grid gap-x-10 gap-y-5 lg:grid-cols-12">
        <div className="lg:col-span-3">
          {eyebrow && <p className="label-mono pt-1">{eyebrow}</p>}
        </div>
        <div className="lg:col-span-9">
          <h2 className="max-w-3xl text-[1.75rem] font-semibold leading-[1.15] tracking-[-0.02em] text-strong sm:text-[2.25rem]">
            {title}
          </h2>
          {blurb && (
            <p className="mt-4 max-w-2xl text-[15px] leading-7 text-muted">
              {blurb}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

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
    <section id={id} className={cx("py-20 sm:py-24", className)}>
      {children}
    </section>
  );
}

/** Page header used by Features, Changelog, and About. */
export function PageHeader({
  label,
  title,
  blurb,
  actions,
}: {
  label: string;
  title: ReactNode;
  blurb?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="border-b border-border pb-14 pt-16 sm:pt-20">
      <Container>
        <p className="label-mono">{label}</p>
        <h1 className="mt-5 max-w-3xl text-[2.25rem] font-semibold leading-[1.08] tracking-[-0.03em] text-strong sm:text-[3.25rem]">
          {title}
        </h1>
        {blurb && (
          <p className="mt-5 max-w-3xl text-[17px] leading-8 text-muted">
            {blurb}
          </p>
        )}
        {actions && <div className="mt-8 flex flex-wrap gap-3">{actions}</div>}
      </Container>
    </header>
  );
}
