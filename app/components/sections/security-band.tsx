import { Check } from "lucide-react";
import { Link } from "react-router";
import { Container, Section } from "~/components/ui";
import { SECURITY_FACTS } from "~/lib/content";

export function SecurityBand() {
  return (
    <Section id="security" className="border-y border-border bg-bg-elevated">
      <Container>
        <div className="grid gap-x-10 gap-y-8 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="label-mono">Security</p>
            <h2 className="mt-4 text-[1.75rem] font-semibold leading-[1.15] tracking-[-0.02em] text-strong">
              Built to face the internet
            </h2>
            <p className="mt-4 text-[15px] leading-7 text-fg-muted">
              A deployment platform holds your SSH keys, registry credentials,
              database passwords, and every secret your apps need. Rivetr treats
              them that way.
            </p>
            <Link
              to="/docs/security"
              className="mt-5 inline-flex text-[13px] font-medium text-brand-400 hover:underline hover:underline-offset-4"
            >
              Read the security notes
            </Link>
          </div>

          <div className="lg:col-span-8">
            <ul className="grid gap-x-10 sm:grid-cols-2">
              {SECURITY_FACTS.map((fact) => (
                <li
                  key={fact}
                  className="flex items-start gap-3 border-t border-border py-3.5 text-sm text-fg-muted"
                >
                  <Check
                    className="mt-1 h-3.5 w-3.5 shrink-0 text-fg-subtle"
                    aria-hidden="true"
                  />
                  {fact}
                </li>
              ))}
            </ul>
            <p className="border-t border-border pt-4 text-[13px] leading-6 text-fg-subtle">
              Rivetr also includes an audit log for user and team actions, SSH
              host key pinning for managed servers, and trusted-proxy-aware rate
              limiting with per-account lockout.
            </p>
          </div>
        </div>
      </Container>
    </Section>
  );
}
