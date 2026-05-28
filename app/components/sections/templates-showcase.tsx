import {
  Bot,
  BarChart3,
  FileText,
  Database,
  Wrench,
  Activity,
  Workflow,
  MessagesSquare,
  FolderOpen,
  Search,
  ShieldCheck,
  KanbanSquare,
  Box,
  type LucideIcon,
} from "lucide-react";
import { Container, Section, SectionHeading } from "~/components/ui";
import { TEMPLATE_CATEGORIES, TEMPLATE_COUNT, type TemplateCategory } from "~/lib/content";

const ICON_MAP: Record<string, LucideIcon> = {
  Bot,
  BarChart3,
  FileText,
  Database,
  Wrench,
  Activity,
  Workflow,
  MessagesSquare,
  FolderOpen,
  Search,
  ShieldCheck,
  KanbanSquare,
};

function CategoryCard({ category }: { category: TemplateCategory }) {
  const Icon = ICON_MAP[category.icon] ?? Box;

  return (
    <div className="group rounded-xl border border-ink-700 bg-ink-900 p-5 transition-colors duration-200 hover:border-brand-500/40">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/10 text-brand-400">
          <Icon size={18} aria-hidden="true" />
        </div>
        <h3 className="font-semibold text-white">{category.name}</h3>
      </div>
      <p className="text-xs text-mist-400 leading-relaxed">
        {category.examples.join(" · ")}
      </p>
    </div>
  );
}

export function TemplatesShowcase() {
  return (
    <Section id="templates">
      <Container>
        {/* Section heading */}
        <SectionHeading
          eyebrow="Service gallery"
          title={
            <>
              One-click services,{" "}
              <span className="text-gradient">ready to deploy</span>
            </>
          }
          blurb="Databases, AI models, analytics, monitoring, CMS, and more — plus community-submitted templates. No configuration files required."
        />

        {/* Big count emphasis */}
        <div className="mt-10 mb-12 flex flex-col items-center">
          <p
            className="text-[6rem] font-bold leading-none tracking-tight text-gradient sm:text-[8rem]"
            aria-label={`${TEMPLATE_COUNT} services`}
          >
            {TEMPLATE_COUNT}
          </p>
          <p className="mt-1 text-sm font-semibold uppercase tracking-widest text-mist-400">
            one-click services across 12 categories
          </p>
        </div>

        {/* Category grid */}
        <div
          className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4"
          aria-label="Template categories"
        >
          {TEMPLATE_CATEGORIES.map((cat) => (
            <CategoryCard key={cat.name} category={cat} />
          ))}
        </div>

        {/* Community note */}
        <p className="mt-8 text-center text-sm text-mist-400">
          Community-submitted templates accepted via pull request.{" "}
          <a
            href="https://github.com/KwaminaWhyte/rivetr"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-brand-400 underline-offset-2 hover:underline"
          >
            Contribute on GitHub
          </a>
          .
        </p>
      </Container>
    </Section>
  );
}
