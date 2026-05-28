import { Container } from "~/components/ui";
import { ALTERNATIVES } from "~/lib/content";

export function Positioning() {
  return (
    <div className="border-y border-border bg-elevated">
      <Container>
        <div className="py-10 sm:py-12">
          {/* Heading block */}
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-strong sm:text-3xl">
              The open-source alternative to managed PaaS
            </h2>
            <p className="mt-3 text-base leading-relaxed text-subtle max-w-xl mx-auto">
              Self-host the developer experience of Vercel, Heroku, and Railway,
              on your own servers, with zero vendor lock-in, for free.
            </p>
          </div>

          {/* Replaces row */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-sm font-medium uppercase tracking-widest text-subtle shrink-0">
              Replaces:
            </span>
            {ALTERNATIVES.map((name) => (
              <span
                key={name}
                className="inline-flex items-center rounded-md border border-border-strong bg-surface-strong px-3 py-1 text-sm font-medium text-subtle line-through decoration-brand-500/60 decoration-2"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
