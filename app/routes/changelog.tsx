import { Container, Button, Badge, Section } from "~/components/ui";
import { Markdown } from "~/components/markdown";
import { GithubIcon } from "~/components/icons/github";
import { SITE } from "~/lib/content";
import changelog from "~/content/changelog.md?raw";
import { ArrowUp } from "lucide-react";

export function meta() {
  return [
    { title: "Changelog: Rivetr" },
    {
      name: "description",
      content: "Release notes and version history for Rivetr.",
    },
  ];
}

export default function Changelog() {
  return (
    <>
      {/* ── Header band ── */}
      <Section className="relative overflow-hidden pt-32 pb-12">
        <div
          className="aurora pointer-events-none absolute inset-x-0 top-0 -z-10 h-72"
          aria-hidden
        />
        <div
          className="bg-grid mask-fade-b pointer-events-none absolute inset-0 -z-10"
          aria-hidden
        />
        <Container className="text-center">
          <Badge>
            <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
            All releases · Semantic versioning
          </Badge>
          <h1 className="mx-auto mt-6 max-w-2xl text-4xl font-bold tracking-tight text-strong sm:text-5xl">
            Changelog
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-subtle">
            Every release, in detail.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button
              href={`${SITE.github}/releases`}
              size="lg"
            >
              <GithubIcon size={18} />
              GitHub releases
            </Button>
            <Button
              href={`${SITE.github}/blob/main/CHANGELOG.md`}
              variant="outline"
              size="lg"
            >
              View raw CHANGELOG.md
            </Button>
          </div>
        </Container>
      </Section>

      {/* ── Markdown body ── */}
      <section className="pb-28" id="changelog-content">
        <Container>
          <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-surface px-6 py-10 sm:px-10 sm:py-14">
            <Markdown>{changelog}</Markdown>
          </div>

          {/* Back to top */}
          <div className="mt-10 flex justify-center">
            <a
              href="#changelog-content"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm text-subtle transition-colors hover:border-border-strong hover:text-fg"
              aria-label="Back to top"
            >
              <ArrowUp className="h-4 w-4" aria-hidden />
              Back to top
            </a>
          </div>
        </Container>
      </section>
    </>
  );
}
