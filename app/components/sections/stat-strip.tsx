import { Container } from "~/components/ui";

export function StatStrip() {
  return (
    <div className="border-y border-ink-700 bg-ink-900">
      <Container>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 py-4 text-sm sm:justify-start">
          <span className="font-medium text-mist-300">Built to be small</span>
          <span className="hidden h-4 w-px bg-ink-700 sm:block" aria-hidden="true" />
          <div className="flex items-baseline gap-2">
            <span className="font-mono font-bold text-brand-400">~30 MB</span>
            <span className="text-mist-400">RAM at idle</span>
          </div>
          <div className="flex items-center gap-1.5 text-mist-400">
            <span className="text-ink-600">vs</span>
            <span className="font-mono font-semibold text-mist-300">400–800 MB</span>
            <span>for Coolify</span>
          </div>
          <span className="hidden h-4 w-px bg-ink-700 sm:block" aria-hidden="true" />
          <div className="flex items-baseline gap-2">
            <span className="font-mono font-bold text-brand-400">0</span>
            <span className="text-mist-400">external services required</span>
          </div>
        </div>
      </Container>
    </div>
  );
}
