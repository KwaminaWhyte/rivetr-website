import { FEATURE_GROUPS, type FeatureGroup, type Feature } from "~/lib/content";
import { Container, Section, SectionHeading } from "~/components/ui";
import { ICONS, FallbackIcon } from "~/lib/icons";

function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? FallbackIcon;
  return <Icon className={className} />;
}

function FeatureCard({ feature }: { feature: Feature }) {
  return (
    <div className="group flex flex-col rounded-xl border border-border bg-surface p-5 transition-all duration-200 hover:border-brand-500/40 hover:bg-surface-strong">
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="inline-flex items-center justify-center rounded-lg bg-brand-500/10 p-2.5">
          <DynamicIcon name={feature.icon} className="h-5 w-5 text-brand-300" />
        </span>
        {feature.badge && (
          <span className="rounded-full border border-brand-500/25 bg-brand-500/[0.08] px-2 py-0.5 font-mono text-[10px] font-medium text-brand-300">
            New in {feature.badge}
          </span>
        )}
      </div>
      <h3 className="mb-1.5 font-semibold text-strong">{feature.title}</h3>
      <p className="text-sm leading-relaxed text-subtle">{feature.description}</p>
    </div>
  );
}

function FeatureGroupSection({ group }: { group: FeatureGroup }) {
  const anchor = group.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return (
    <div id={anchor} className="scroll-mt-24">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-strong">{group.name}</h3>
        <p className="mt-1 text-sm text-subtle">{group.blurb}</p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {group.features.map((f) => (
          <FeatureCard key={f.title} feature={f} />
        ))}
      </div>
    </div>
  );
}

export function FeatureGroups() {
  return (
    <Section id="features">
      <Container>
        <SectionHeading
          eyebrow="Everything included"
          title="One binary. Every feature you'd expect, and a few you wouldn't."
          blurb="No add-ons, paid tiers, or feature flags. Everything ships in the binary, including the parts other tools make you run as separate services."
          align="center"
        />
        <div className="mt-16 space-y-16">
          {FEATURE_GROUPS.map((group) => (
            <FeatureGroupSection key={group.name} group={group} />
          ))}
        </div>
      </Container>
    </Section>
  );
}
