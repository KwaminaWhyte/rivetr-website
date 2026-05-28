import { STEPS } from "~/lib/content";
import { Container, Section, SectionHeading } from "~/components/ui";

export function HowItWorks() {
  return (
    <Section id="how">
      <Container>
        <SectionHeading
          eyebrow="How it works"
          title="From zero to deployed in three steps"
          align="center"
        />
        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6">
          {STEPS.map((step, i) => (
            <div key={step.n} className="relative flex flex-col gap-5">
              {/* Connector line between steps on desktop */}
              {i < STEPS.length - 1 && (
                <div
                  aria-hidden="true"
                  className="absolute left-full top-6 hidden w-6 -translate-y-1/2 border-t border-dashed border-ink-600 md:block"
                  style={{ width: "calc(100% - 100% + 1.5rem)" }}
                />
              )}

              {/* Step number */}
              <div className="flex items-center gap-3">
                <span className="font-mono text-4xl font-bold leading-none text-brand-500/30 select-none">
                  {step.n}
                </span>
                <div className="h-px flex-1 border-t border-ink-700 md:hidden" />
              </div>

              {/* Content */}
              <div>
                <h3 className="mb-2 font-semibold text-white">{step.title}</h3>
                <p className="text-sm leading-relaxed text-mist-400">{step.body}</p>
              </div>

              {/* Code chip */}
              <div className="rounded-md border border-ink-700 bg-ink-900 px-3 py-2">
                <span className="mr-2 font-mono text-sm text-brand-400" aria-hidden="true">
                  $
                </span>
                <code className="font-mono text-sm text-mist-200 break-all">{step.code}</code>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
