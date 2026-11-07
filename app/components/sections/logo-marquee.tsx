import { Container } from "~/components/ui";
import { TECH_STACK } from "~/lib/content";

/**
 * What the platform runs, as a static spec band. No logo marquee: 20 moving
 * tiles say less than three lines of text and cost the reader attention.
 */
export function LogoMarquee() {
  return (
    <div className="border-b border-border">
      <Container>
        <div className="grid gap-8 py-10 sm:grid-cols-3">
          {TECH_STACK.map((row) => (
            <div key={row.label}>
              <p className="label-mono mb-3">{row.label}</p>
              <p className="text-[13px] leading-6 text-fg-muted">
                {row.items.map((item) => item.name).join(" · ")}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
