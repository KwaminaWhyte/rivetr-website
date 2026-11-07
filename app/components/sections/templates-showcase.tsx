import { Container, Section, SectionHeading } from "~/components/ui";
import {
  TEMPLATE_CATEGORIES,
  TEMPLATE_CATEGORY_COUNT,
  TEMPLATE_COUNT,
} from "~/lib/content";

export function TemplatesShowcase() {
  return (
    <Section id="templates">
      <Container>
        <SectionHeading
          eyebrow="Service templates"
          title={`${TEMPLATE_COUNT} one-click services across ${TEMPLATE_CATEGORY_COUNT} categories`}
          blurb="Databases, AI models, analytics, monitoring, CMS, and more. Every template is a reviewed compose definition with encrypted variables, ready to deploy."
        />

        <ul className="mt-10 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATE_CATEGORIES.map((category) => (
            <li
              key={category.name}
              className="flex items-baseline justify-between gap-4 border-t border-border py-3.5"
            >
              <span className="text-sm text-fg-strong">{category.name}</span>
              <span className="truncate text-right text-xs text-fg-subtle">
                {category.examples.join(" · ")}
              </span>
            </li>
          ))}
        </ul>

        <p className="mt-8 border-t border-border pt-5 text-[13px] text-fg-subtle">
          Templates ship in the binary and are maintained in the repository. New
          ones are welcome as pull requests.{" "}
          <a
            href="https://github.com/KwaminaWhyte/rivetr"
            target="_blank"
            rel="noreferrer"
            className="text-brand-400 hover:underline hover:underline-offset-4"
          >
            Contribute on GitHub
          </a>
        </p>
      </Container>
    </Section>
  );
}
