import { ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { Container, Section, SectionHeading } from "~/components/ui";
import { RELEASE_HIGHLIGHTS, SITE } from "~/lib/content";

export function ReleaseHighlights() {
  return (
    <Section id="release">
      <Container>
        <SectionHeading
          eyebrow={`Released ${SITE.released}`}
          title="What landed in 1.0"
          blurb="The largest release so far rebuilt the dashboard and added real service deployments, passkeys, traffic analytics, and a way to roll back database data with the app."
        />

        <ul className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {RELEASE_HIGHLIGHTS.map((item, i) => (
            <li key={item.title} className="border-t border-border pt-5">
              <div className="flex items-baseline justify-between gap-4">
                <span className="font-mono text-xs text-fg-subtle">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-fg-subtle">
                  v1.0
                </span>
              </div>
              <h3 className="mt-3 text-[15px] font-medium text-strong">
                {item.title}
              </h3>
              <p className="mt-1.5 text-sm leading-6 text-fg-muted">{item.body}</p>
              <Link
                to={item.href}
                className="mt-3 inline-flex items-center gap-1 text-[13px] text-fg-subtle transition-colors hover:text-fg-strong"
              >
                Read more
                <ArrowRight size={12} aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-10 border-t border-border pt-5">
          <Link
            to="/changelog"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-brand-400 hover:underline hover:underline-offset-4"
          >
            Read the full 1.0 changelog
            <ArrowRight size={13} aria-hidden="true" />
          </Link>
        </div>
      </Container>
    </Section>
  );
}
