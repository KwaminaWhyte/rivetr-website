import { Container } from "~/components/ui";

export function StatStrip() {
  return (
    <div className="border-y border-border bg-elevated">
      <Container>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 py-4 text-sm sm:justify-start">
          <span className="font-medium text-muted">Built to be small</span>
          <span className="hidden h-4 w-px bg-border sm:block" aria-hidden="true" />
          <div className="flex items-baseline gap-2">
            <span className="font-mono font-bold text-brand-400">~30 MB</span>
            <span className="text-subtle">RAM at idle</span>
          </div>
          <div className="flex items-center gap-1.5 text-subtle">
            <span className="text-border-strong">vs</span>
            <span className="font-mono font-semibold text-muted">400–800 MB</span>
            <span>for Coolify</span>
          </div>
          <span className="hidden h-4 w-px bg-border sm:block" aria-hidden="true" />
          <div className="flex items-baseline gap-2">
            <span className="font-mono font-bold text-brand-400">0</span>
            <span className="text-subtle">external services required</span>
          </div>
        </div>
      </Container>
    </div>
  );
}
