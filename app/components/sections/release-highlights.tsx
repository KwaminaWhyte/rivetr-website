import { ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { Container, Section, SectionHeading } from "~/components/ui";
import { ICONS, FallbackIcon } from "~/lib/icons";
import { RELEASE_HIGHLIGHTS, SITE } from "~/lib/content";

export function ReleaseHighlights() {
  return (
    <Section id="release" className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-gradient-to-b from-brand-500/[0.06] to-transparent"
        aria-hidden
      />
      <Container>
        <SectionHeading
          eyebrow={`Released ${SITE.released}`}
          title={
            <>
              What landed in{" "}
              <span className="text-gradient">1.0</span>
            </>
          }
          blurb="The largest release so far rebuilt the dashboard, added real service deployments, passkeys, traffic analytics, and a way to roll back database data with the app."
        />

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {RELEASE_HIGHLIGHTS.map((item) => {
            const Icon = ICONS[item.icon] ?? FallbackIcon;
            return (
              <Link
                key={item.title}
                to={item.href}
                className="group flex flex-col rounded-2xl border border-border bg-surface p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-500/40 hover:bg-surface-strong"
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span className="inline-flex rounded-xl border border-brand-500/25 bg-brand-500/10 p-2.5">
                    <Icon className="h-5 w-5 text-brand-300" aria-hidden />
                  </span>
                  <span className="rounded-full border border-border-strong px-2 py-0.5 font-mono text-[10px] font-medium text-subtle">
                    v1.0
                  </span>
                </div>
                <h3 className="font-semibold text-strong">{item.title}</h3>
                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-subtle">
                  {item.body}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-300">
                  Read more
                  <ArrowRight
                    size={14}
                    className="transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </span>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/changelog"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-fg transition-colors hover:border-brand-500/50 hover:text-strong"
          >
            Read the full 1.0 changelog
            <ArrowRight size={14} aria-hidden />
          </Link>
        </div>
      </Container>
    </Section>
  );
}
