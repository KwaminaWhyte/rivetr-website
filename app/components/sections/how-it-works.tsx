import { STEPS } from "~/lib/content";
import { Container, Section, SectionHeading } from "~/components/ui";

export function HowItWorks() {
  return (
    <Section id="how">
      <Container>
        <SectionHeading
          eyebrow="Setup"
          title="From zero to deployed in three steps"
          blurb="A single installer, a repository, and a push. Certificates and routing are handled for you."
        />

        <ol className="mt-10 grid gap-x-10 gap-y-10 md:grid-cols-3">
          {STEPS.map((step) => (
            <li key={step.n} className="min-w-0 border-t border-border pt-5">
              <span className="font-mono text-xs text-fg-subtle">{step.n}</span>
              <h3 className="mt-3 text-[15px] font-medium text-strong">
                {step.title}
              </h3>
              <p className="mt-1.5 text-sm leading-6 text-fg-muted">{step.body}</p>
              <div className="mt-4 rounded-md border border-border bg-surface px-3 py-2.5">
                <code className="block break-all font-mono text-xs leading-5 text-fg-muted">
                  <span className="mr-2 text-fg-subtle" aria-hidden="true">
                    $
                  </span>
                  {step.code}
                </code>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
