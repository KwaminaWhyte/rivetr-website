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
    return <Check className="mx-auto h-4 w-4 text-fg-strong" aria-label="Supported" />;
  }
  if (value === false) {
    return (
      <Minus className="mx-auto h-4 w-4 text-fg-subtle" aria-label="Not supported" />
    );
  }
  return (
    <span
      className={
        isRivetr ? "font-medium text-fg-strong" : "text-fg-muted"
      }
    >
      {value}
    </span>
  );
}

function MobileRow({ row }: { row: CompareRow }) {
  return (
    <div className="border-t border-border py-4">
      <p className="text-sm font-medium text-strong">{row.feature}</p>
      <dl className="mt-2 grid grid-cols-3 gap-3">
        {[
          { label: "Rivetr", value: row.rivetr, isRivetr: true },
          { label: "Coolify", value: row.coolify, isRivetr: false },
          { label: "Dokploy", value: row.dokploy, isRivetr: false },
        ].map(({ label, value, isRivetr }) => (
          <div key={label}>
            <dt className="font-mono text-[10px] uppercase tracking-[0.1em] text-fg-subtle">
              {label}
            </dt>
            <dd className="mt-1 text-[13px]">
              <CellValue value={value} isRivetr={isRivetr} />
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function Compare() {
  return (
    <Section id="compare">
      <Container>
        <SectionHeading
          eyebrow="Comparison"
          title="Same idea. A fraction of the footprint."
          blurb="Coolify and Dokploy are the two best-known self-hosted PaaS alternatives. Rows below were checked against their docs and releases on 7 November 2026 (Coolify v4.6.0, Dokploy v0.31.0)."
        />

        <div className="mt-10 hidden overflow-x-auto md:block">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-y border-border">
                <th className="w-[28%] py-3 pr-4 text-left font-normal">
                  <span className="label-mono">Feature</span>
                </th>
                <th className="px-4 py-3 text-center">
                  <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-fg-strong">
                    <span
                      className="size-1.5 rounded-full bg-brand-400"
                      aria-hidden="true"
                    />
                    Rivetr
                  </span>
                </th>
                <th className="px-4 py-3 text-center font-normal">
                  <span className="label-mono">Coolify</span>
                </th>
                <th className="px-4 py-3 text-center font-normal">
                  <span className="label-mono">Dokploy</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {COMPARE.map((row) => (
                <tr key={row.feature} className="border-b border-border">
                  <td className="py-3 pr-4 text-fg-muted">{row.feature}</td>
                  <td className="px-4 py-3 text-center">
                    <CellValue value={row.rivetr} isRivetr />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <CellValue value={row.coolify} isRivetr={false} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <CellValue value={row.dokploy} isRivetr={false} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 md:hidden">
          {COMPARE.map((row) => (
            <MobileRow key={row.feature} row={row} />
          ))}
        </div>

        <p className="mt-6 max-w-2xl text-[13px] leading-6 text-fg-subtle">
          Rivetr memory is a measured RSS figure with 30 containers on 1.0.0.
          Competitor figures are from their published documentation, not
          measurements by us. See the{" "}
          <a
            href="https://github.com/KwaminaWhyte/rivetr#why-rivetr"
            target="_blank"
            rel="noreferrer"
            className="text-brand-400 hover:underline hover:underline-offset-4"
          >
            comparison notes
          </a>{" "}
          for sources.
        </p>
      </Container>
    </Section>
  );
}
