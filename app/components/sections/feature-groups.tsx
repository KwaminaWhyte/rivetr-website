import { FEATURE_GROUPS, type FeatureGroup, type Feature } from "~/lib/content";
import { Container, Section, SectionHeading } from "~/components/ui";
import { ICONS, FallbackIcon } from "~/lib/icons";

function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? FallbackIcon;
  return <Icon className={className} />;
}

function FeatureCard({ feature }: { feature: Feature }) {
  return (
    <div className="group rounded-xl border border-border bg-surface p-5 transition-all duration-200 hover:border-brand-500/40 hover:bg-surface-strong">
      <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-brand-500/10 p-2.5">
        <DynamicIcon name={feature.icon} className="h-5 w-5 text-brand-400" />
      </div>
      <h3 className="mb-1.5 font-semibold text-strong">{feature.title}</h3>
      <p className="text-sm leading-relaxed text-subtle">{feature.description}</p>
    </div>
  );
}

function FeatureGroupSection({ group }: { group: FeatureGroup }) {
  return (
    <div>
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
          blurb="No add-ons. No paid tiers. No feature flags. Everything ships in the binary."
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
