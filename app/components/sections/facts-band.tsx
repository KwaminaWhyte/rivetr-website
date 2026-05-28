import { Container } from "~/components/ui";
import { FACTS } from "~/lib/content";

export function FactsBand() {
  return (
    <div className="border-y border-ink-700 bg-ink-900">
      <Container>
        <dl className="grid grid-cols-2 gap-px sm:grid-cols-3 lg:grid-cols-6">
          {FACTS.map((fact) => (
            <div
              key={fact.label}
              className="flex flex-col items-center justify-center px-4 py-7 text-center"
            >
              <dt className="order-2 mt-1 text-xs font-semibold uppercase tracking-widest text-mist-400">
                {fact.label}
              </dt>
              <dd className="order-1 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </div>
  );
}
