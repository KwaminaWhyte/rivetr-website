import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { FAQS } from "~/lib/content";
import { Container, Section } from "~/components/ui";

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function toggle(i: number) {
    setOpenIndex((prev) => (prev === i ? null : i));
  }

  return (
    <Section id="faq">
      <Container>
        <div className="grid gap-x-10 gap-y-8 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="label-mono">FAQ</p>
            <h2 className="mt-4 text-[1.75rem] font-semibold leading-[1.15] tracking-[-0.02em] text-strong">
              Questions, answered
            </h2>
            <p className="mt-4 text-[15px] leading-7 text-fg-muted">
              Something missing? The docs cover installation, configuration, and
              operations in full.
            </p>
            <a
              href="/docs"
              className="mt-5 inline-flex text-[13px] font-medium text-brand-400 hover:underline hover:underline-offset-4"
            >
              Browse the docs
            </a>
          </div>

          <div className="lg:col-span-8">
            {FAQS.map((item, i) => {
              const isOpen = openIndex === i;
              return (
                <div key={i} className="border-t border-border last:border-b">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => toggle(i)}
                    className="flex w-full items-center justify-between gap-6 py-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
                  >
                    <span className="text-sm font-medium text-strong">
                      {item.q}
                    </span>
                    <span className="shrink-0 text-fg-subtle" aria-hidden="true">
                      {isOpen ? (
                        <Minus className="h-4 w-4" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                    </span>
                  </button>

                  {isOpen && (
                    <div
                      role="region"
                      className="max-w-2xl pb-5 text-sm leading-6 text-fg-muted"
                    >
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </Section>
  );
}
