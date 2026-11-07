import { useParams, Link } from "react-router";
import type { Route } from "./+types/docs.$slug";
import { Markdown } from "~/components/markdown";
import { FLAT_DOCS } from "~/lib/docs-nav";
import { DOCS_CONTENT } from "~/lib/docs-content";
import GithubSlugger from "github-slugger";
import { ArrowLeft, ArrowRight, ChevronRight, Pencil } from "lucide-react";
import { pageMeta, siteOrigin } from "~/lib/meta";

// Every docs page is imported once in lib/docs-content.ts.

type TocItem = { depth: 2 | 3; text: string; id: string };

function cleanHeading(text: string): string {
  return text
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/<[^>]+>/g, "")
    .trim();
}

function buildToc(markdown: string): TocItem[] {
  const slugger = new GithubSlugger();
  const items: TocItem[] = [];
  let inFence = false;

  for (const line of markdown.split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const match = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!match) continue;

    const depth = match[1].length;
    const text = cleanHeading(match[2]);
    const id = slugger.slug(text);
    if (depth === 2 || depth === 3) {
      items.push({ depth, text, id });
    }
  }

  return items;
}

function docTitle(slug: string) {
  return FLAT_DOCS.find((item) => item.slug === slug)?.title ?? "Documentation";
}

function docDescription(slug: string): string {
  const body = DOCS_CONTENT[slug] ?? "";
  const line = body
    .split("\n")
    .map((item) => item.trim())
    .find(
      (item) =>
        item.length > 40 &&
        !item.startsWith("#") &&
        !item.startsWith("|") &&
        !item.startsWith("```") &&
        !item.startsWith("-") &&
        !item.startsWith(">"),
    );

  if (!line) {
    return `${docTitle(slug)} documentation for Rivetr 1.0, the self-hosted PaaS in a single binary.`;
  }

  const clean = line
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_]/g, "")
    .trim();

  return clean.length > 155 ? `${clean.slice(0, 152).trim()}...` : clean;
}

export function meta({ params, matches }: Route.MetaArgs) {
  const slug = params.slug ?? "";
  const title = docTitle(slug);
  const description = docDescription(slug);
  return pageMeta({
    title: `${title}: Rivetr Docs`,
    description,
    type: "article",
    origin: siteOrigin(matches),
  });
}

function PrevNext({ slug }: { slug: string }) {
  const index = FLAT_DOCS.findIndex((item) => item.slug === slug);
  const prev = index > 0 ? FLAT_DOCS[index - 1] : null;
  const next = index < FLAT_DOCS.length - 1 ? FLAT_DOCS[index + 1] : null;

  return (
    <nav
      aria-label="Page navigation"
      className="mt-12 flex items-stretch justify-between gap-4 border-t border-border pt-6"
    >
      <div className="flex-1">
        {prev && (
          <Link
            to={`/docs/${prev.slug}`}
            className="group flex h-full flex-col rounded-md border border-border bg-surface px-4 py-3 transition-colors hover:border-border-strong hover:bg-surface-strong"
          >
            <span className="mb-1 inline-flex items-center gap-1 text-xs text-subtle">
              <ArrowLeft size={12} aria-hidden />
              Previous
            </span>
            <span className="text-sm font-medium text-fg group-hover:text-strong">
              {prev.title}
            </span>
          </Link>
        )}
      </div>
      <div className="flex-1">
        {next && (
          <Link
            to={`/docs/${next.slug}`}
            className="group flex h-full flex-col items-end rounded-md border border-border bg-surface px-4 py-3 text-right transition-colors hover:border-border-strong hover:bg-surface-strong"
          >
            <span className="mb-1 inline-flex items-center gap-1 text-xs text-subtle">
              Next
              <ArrowRight size={12} aria-hidden />
            </span>
            <span className="text-sm font-medium text-fg group-hover:text-strong">
              {next.title}
            </span>
          </Link>
        )}
      </div>
    </nav>
  );
}

export default function DocPage() {
  const { slug } = useParams<{ slug: string }>();
  const content = slug ? DOCS_CONTENT[slug] : undefined;

  if (!content || !slug) {
    return (
      <div className="py-16 text-center">
        <p className="mb-4 text-2xl font-semibold text-strong">
          Page not found
        </p>
        <p className="mb-8 text-subtle">
          No documentation page exists for{" "}
          <code className="rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-sm text-fg-strong">
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

  const title = docTitle(slug);
  const toc = buildToc(content);

  return (
    <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_13.5rem] xl:gap-10">
      <div className="min-w-0">
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-xs text-subtle">
          <Link to="/docs" className="transition-colors hover:text-strong">
            Docs
          </Link>
          <ChevronRight size={12} aria-hidden />
          <span className="text-muted">{title}</span>
        </nav>

        {/* Mobile table of contents */}
        {toc.length > 0 && (
          <details className="mb-6 rounded-md border border-border bg-surface px-4 py-3 xl:hidden">
            <summary className="cursor-pointer text-sm font-medium text-strong">
              On this page
            </summary>
            <ul className="mt-3 space-y-1.5">
              {toc.map((item) => (
                <li
                  key={item.id}
                  className={item.depth === 3 ? "pl-4" : undefined}
                >
                  <a
                    href={`#${item.id}`}
                    className="text-sm text-subtle transition-colors hover:text-strong"
                  >
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          </details>
        )}

        <article>
          <Markdown>{content}</Markdown>
        </article>

        <PrevNext slug={slug} />
      </div>

      {/* Desktop table of contents */}
      <aside className="hidden xl:block">
        <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pb-8 pl-4">
          <p className="label-mono mb-3">On this page</p>
          <ul className="space-y-1.5 border-l border-border">
            {toc.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className={[
                    "-ml-px block border-l border-transparent text-sm leading-snug text-subtle transition-colors hover:border-brand-500 hover:text-strong",
                    item.depth === 2 ? "pl-3" : "pl-6",
                  ].join(" ")}
                >
                  {item.text}
                </a>
              </li>
            ))}
          </ul>
          <a
            href={`https://github.com/KwaminaWhyte/rivetr-website/edit/main/app/content/docs/${slug}.md`}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex items-center gap-1.5 text-xs text-subtle transition-colors hover:text-strong"
          >
            <Pencil size={12} aria-hidden />
            Edit this page
          </a>
        </div>
      </aside>
    </div>
  );
}
