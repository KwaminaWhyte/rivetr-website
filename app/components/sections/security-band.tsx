import { Check, ShieldCheck } from "lucide-react";
import { Link } from "react-router";
import { Container, Section } from "~/components/ui";
import { SECURITY_FACTS } from "~/lib/content";

export function SecurityBand() {
  return (
    <Section id="security" className="border-y border-border bg-bg-elevated">
      <Container>
        <div className="grid items-start gap-10 lg:grid-cols-[22rem_minmax(0,1fr)]">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-brand-400">
              Security
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-strong sm:text-4xl">
              Built to face the internet
            </h2>
            <p className="mt-4 text-base leading-relaxed text-subtle">
              A deployment platform holds your SSH keys, registry credentials,
              database passwords, and every secret your apps need. Rivetr treats
              them that way.
            </p>
            <Link
              to="/docs/security"
              className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-brand-300 underline-offset-4 hover:underline"
            >
              Read the security notes
            </Link>
          </div>

          <ul className="grid gap-3 sm:grid-cols-2">
            {SECURITY_FACTS.map((fact) => (
              <li
                key={fact}
                className="flex items-start gap-3 rounded-xl border border-border bg-surface px-4 py-3.5"
              >
                <span className="mt-0.5 inline-flex shrink-0 rounded-full bg-success-soft p-1">
                  <Check className="h-3.5 w-3.5 text-success" aria-hidden />
                </span>
                <span className="text-sm leading-relaxed text-fg">{fact}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 flex items-center gap-3 rounded-xl border border-brand-500/20 bg-brand-500/[0.06] px-5 py-4">
          <ShieldCheck className="h-5 w-5 shrink-0 text-brand-300" aria-hidden />
          <p className="text-sm leading-relaxed text-muted">
            Rivetr also includes an audit log for user and team actions, SSH
            host key pinning for managed servers, and trusted-proxy-aware rate
            limiting with per-account lockout.
          </p>
        </div>
      </Container>
    </Section>
  );
}
