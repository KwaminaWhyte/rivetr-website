import { Check, Minus } from "lucide-react";
import { COMPARE } from "~/lib/content";
import type { CompareRow } from "~/lib/content";
import { Container, Section, SectionHeading } from "~/components/ui";

function CellValue({
  value,
  isRivetr,
}: {
  value: string | boolean;
  isRivetr: boolean;
}) {
  if (value === true) {
    return (
      <Check
        className="mx-auto h-5 w-5 text-green-400"
        aria-label="Supported"
      />
    );
  }
  if (value === false) {
    return (
      <Minus
        className="mx-auto h-5 w-5 text-mist-500/60"
        aria-label="Not supported"
      />
    );
  }
  return (
    <span className={isRivetr ? "text-white font-medium" : "text-mist-200"}>
      {value}
    </span>
  );
}

function MobileCard({ row }: { row: CompareRow }) {
  return (
    <div className="rounded-xl border border-ink-700 overflow-hidden">
      <div className="bg-ink-800/60 px-4 py-2.5">
        <span className="text-sm font-medium text-mist-200">{row.feature}</span>
      </div>
      <div className="grid grid-cols-3 divide-x divide-ink-700">
        {(
          [
            { label: "Rivetr", value: row.rivetr, isRivetr: true },
            { label: "Coolify", value: row.coolify, isRivetr: false },
            { label: "Dokploy", value: row.dokploy, isRivetr: false },
          ] as const
        ).map(({ label, value, isRivetr }) => (
          <div
            key={label}
            className={
              isRivetr
                ? "flex flex-col items-center gap-1.5 px-3 py-3 bg-brand-500/[0.06]"
                : "flex flex-col items-center gap-1.5 px-3 py-3"
            }
          >
            <span
              className={`text-xs font-semibold uppercase tracking-wider ${isRivetr ? "text-brand-400" : "text-mist-500"}`}
            >
              {label}
            </span>
            <div className="text-center text-sm">
              <CellValue value={value} isRivetr={isRivetr} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Compare() {
  return (
    <Section id="compare">
      <Container>
        <SectionHeading
          eyebrow="How it compares"
          title="Same idea. A fraction of the footprint."
          blurb="Coolify and Dokploy are the two best-known self-hosted PaaS alternatives. Here's how Rivetr stacks up."
        />

        {/* Desktop table */}
        <div className="mt-14 hidden md:block">
          <div className="overflow-hidden rounded-xl border border-ink-700">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-ink-700">
                  <th className="w-56 bg-ink-900 px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-mist-500">
                    Feature
                  </th>
                  {/* Rivetr header: highlighted */}
                  <th className="relative bg-brand-500/[0.06] px-6 py-4 text-center">
                    <div
                      className="absolute inset-x-0 top-0 h-0.5 bg-brand-500"
                      aria-hidden="true"
                    />
                    <span className="text-sm font-bold text-white">Rivetr</span>
                  </th>
                  <th className="bg-ink-900 px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-mist-500">
                    Coolify
                  </th>
                  <th className="bg-ink-900 px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-mist-500">
                    Dokploy
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARE.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={
                      i % 2 === 0
                        ? "border-b border-ink-700/60"
                        : "border-b border-ink-700/60 bg-ink-900/40"
                    }
                  >
                    <td className="px-6 py-4 font-medium text-mist-300">
                      {row.feature}
                    </td>
                    <td className="bg-brand-500/[0.06] px-6 py-4 text-center">
                      <CellValue value={row.rivetr} isRivetr={true} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <CellValue value={row.coolify} isRivetr={false} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <CellValue value={row.dokploy} isRivetr={false} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile card list */}
        <div className="mt-10 flex flex-col gap-4 md:hidden">
          {COMPARE.map((row) => (
            <MobileCard key={row.feature} row={row} />
          ))}
        </div>

        <p className="mt-4 text-center text-xs text-mist-500">
          Figures from public docs and our own measurements, 2026.
        </p>
      </Container>
    </Section>
  );
}
