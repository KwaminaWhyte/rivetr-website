import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { FAQS } from "~/lib/content";
import { Container, Section, SectionHeading } from "~/components/ui";

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function toggle(i: number) {
    setOpenIndex((prev) => (prev === i ? null : i));
  }

  return (
    <Section id="faq">
      <Container>
        <SectionHeading eyebrow="FAQ" title="Questions, answered" />

        <div className="mx-auto mt-12 max-w-3xl">
          {FAQS.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={i} className="border-b border-ink-700">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => toggle(i)}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
                >
                  <span className="font-medium text-white">{item.q}</span>
                  <span className="shrink-0 text-mist-400" aria-hidden="true">
                    {isOpen ? (
                      <Minus className="h-4 w-4" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </span>
                </button>

                <div
                  role="region"
                  hidden={!isOpen}
                  className={
                    isOpen
                      ? "block pb-5 text-mist-400 leading-relaxed"
                      : "hidden"
                  }
                >
                  {item.a}
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
