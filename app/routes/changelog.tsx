import { Link } from "react-router";
import { PageHeader, Button, Container } from "~/components/ui";
import { Markdown } from "~/components/markdown";
import { GithubIcon } from "~/components/icons/github";
import { SITE } from "~/lib/content";
import changelog from "~/content/changelog.md?raw";
import { ArrowUp } from "lucide-react";
import { pageMeta, siteOrigin } from "~/lib/meta";
import type { Route } from "./+types/changelog";

export function meta({ matches }: Route.MetaArgs) {
  return pageMeta({
    title: "Changelog: Rivetr",
    description:
      "Release notes for Rivetr, starting with the 1.0.0 release on 5 November 2026.",
    origin: siteOrigin(matches),
  });
}

export default function Changelog() {
  return (
    <>
      <PageHeader
        label={`v${SITE.version} · released ${SITE.released}`}
        title="Changelog"
        blurb="Release notes from 1.0.0 onward. The full history lives in the repository."
        actions={
          <>
            <Button href={`${SITE.github}/releases`}>
              <GithubIcon size={15} />
              GitHub releases
            </Button>
            <Button href={`${SITE.github}/blob/main/CHANGELOG.md`} variant="outline">
              View raw CHANGELOG.md
            </Button>
          </>
        }
      />

      <section className="py-16" id="changelog-content">
        <Container>
          <div className="mx-auto max-w-3xl">
            <Markdown>{changelog}</Markdown>
          </div>

          <div className="mx-auto mt-12 flex max-w-3xl justify-between border-t border-border pt-6">
            <Link
              to="/docs"
              className="text-[13px] text-fg-subtle transition-colors hover:text-fg-strong"
            >
              Documentation
            </Link>
            <a
              href="#changelog-content"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="inline-flex items-center gap-1.5 text-[13px] text-fg-subtle transition-colors hover:text-fg-strong"
              aria-label="Back to top"
            >
              <ArrowUp className="h-3.5 w-3.5" aria-hidden />
              Back to top
            </a>
          </div>
        </Container>
      </section>
    </>
  );
}
