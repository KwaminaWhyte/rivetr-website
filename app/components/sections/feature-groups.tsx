import { FEATURE_GROUPS, type FeatureGroup } from "~/lib/content";
import { Container, Section, SectionHeading } from "~/components/ui";

function FeatureGroupRow({ group }: { group: FeatureGroup }) {
  return (
    <div className="grid gap-x-10 gap-y-6 border-t border-border pt-8 lg:grid-cols-12">
      <div className="lg:col-span-3">
        <h3 className="text-[15px] font-medium text-strong">{group.name}</h3>
        <p className="mt-1.5 max-w-[16rem] text-[13px] leading-6 text-fg-subtle">
          {group.blurb}
        </p>
      </div>

      <ul className="grid gap-x-10 gap-y-6 sm:grid-cols-2 lg:col-span-9">
        {group.features.map((feature) => (
          <li key={feature.title}>
            <h4 className="flex items-baseline gap-2 text-sm font-medium text-strong">
              {feature.title}
              {feature.badge && (
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-fg-subtle">
                  new in {feature.badge}
                </span>
              )}
            </h4>
            <p className="mt-1 text-[13px] leading-6 text-fg-muted">
              {feature.description}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function FeatureGroups() {
  return (
    <Section id="features">
      <Container>
        <SectionHeading
          eyebrow="Features"
          title="One binary. Every part of the platform."
          blurb="No add-ons, paid tiers, or feature flags. The proxy, the database console, the scheduler, and the API ship in the same binary as the deploy pipeline."
        />

        <div className="mt-10 space-y-12">
          {FEATURE_GROUPS.map((group) => (
            <FeatureGroupRow key={group.name} group={group} />
          ))}
        </div>
      </Container>
    </Section>
  );
}
