import { useParams, Link } from "react-router";
import { Markdown } from "~/components/markdown";
import { DOCS_NAV } from "~/lib/docs-nav";

// Import each doc page as a raw markdown string via Vite's ?raw suffix.
import introductionMd from "~/content/docs/introduction.md?raw";
import installationMd from "~/content/docs/installation.md?raw";
import configurationMd from "~/content/docs/configuration.md?raw";
import deploymentsMd from "~/content/docs/deployments.md?raw";
import databasesMd from "~/content/docs/databases.md?raw";
import apiMd from "~/content/docs/api.md?raw";
import contributingMd from "~/content/docs/contributing.md?raw";

const DOCS_CONTENT: Record<string, string> = {
  introduction: introductionMd,
  installation: installationMd,
  configuration: configurationMd,
  deployments: deploymentsMd,
  databases: databasesMd,
  api: apiMd,
  contributing: contributingMd,
};

/** Flat list of all slugs + titles for prev/next navigation. */
const FLAT_ITEMS = DOCS_NAV.flatMap((g) => g.items);

export function meta() {
  return [{ title: "Docs — Rivetr" }];
}

export default function DocPage() {
  const { slug } = useParams<{ slug: string }>();
  const content = slug ? DOCS_CONTENT[slug] : undefined;

  if (!content) {
    return (
      <div className="py-16 text-center">
        <p className="mb-4 text-2xl font-semibold text-white">
          Page not found
        </p>
        <p className="mb-8 text-mist-400">
          No documentation page exists for{" "}
          <code className="rounded border border-ink-700 bg-ink-900 px-1.5 py-0.5 font-mono text-sm text-brand-300">
            {slug}
          </code>
          .
        </p>
        <Link
          to="/docs"
          className="text-sm font-medium text-brand-400 underline-offset-4 hover:underline"
        >
          Back to docs
        </Link>
      </div>
    );
  }

  const currentIndex = FLAT_ITEMS.findIndex((item) => item.slug === slug);
  const prev = currentIndex > 0 ? FLAT_ITEMS[currentIndex - 1] : null;
  const next =
    currentIndex < FLAT_ITEMS.length - 1 ? FLAT_ITEMS[currentIndex + 1] : null;

  return (
    <>
      <article>
        <Markdown>{content}</Markdown>
      </article>

      {/* Prev / Next navigation */}
      <nav
        aria-label="Page navigation"
        className="mt-12 flex items-center justify-between border-t border-ink-700 pt-6"
      >
        <div>
          {prev && (
            <Link
              to={`/docs/${prev.slug}`}
              className="group flex flex-col text-sm"
            >
              <span className="mb-0.5 text-xs text-mist-400 transition-colors group-hover:text-mist-300">
                ← Previous
              </span>
              <span className="font-medium text-mist-200 transition-colors group-hover:text-white">
                {prev.title}
              </span>
            </Link>
          )}
        </div>
        <div className="text-right">
          {next && (
            <Link
              to={`/docs/${next.slug}`}
              className="group flex flex-col text-sm"
            >
              <span className="mb-0.5 text-xs text-mist-400 transition-colors group-hover:text-mist-300">
                Next →
              </span>
              <span className="font-medium text-mist-200 transition-colors group-hover:text-white">
                {next.title}
              </span>
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}
