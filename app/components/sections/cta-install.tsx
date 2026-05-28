import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { SITE } from "~/lib/content";
import { GithubIcon } from "~/components/icons/github";
import { Container, Section, Button } from "~/components/ui";

export function CtaInstall() {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(SITE.installCmd).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <Section id="install">
      <Container>
        <div className="relative overflow-hidden rounded-2xl border border-border bg-surface glow-ring">
          {/* Aurora glow */}
          <div
            className="aurora pointer-events-none absolute inset-0 opacity-30"
            aria-hidden="true"
          />

          {/* Grid texture */}
          <div
            className="bg-grid pointer-events-none absolute inset-0 opacity-[0.04] mask-fade-b"
            aria-hidden="true"
          />

          <div className="relative z-10 px-8 py-16 text-center sm:px-16 sm:py-20">
            <h2 className="text-3xl font-bold tracking-tight text-strong sm:text-4xl lg:text-5xl">
              Ship your first app{" "}
              <span className="text-gradient">in minutes</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-subtle">
              Open source, MIT licensed, and entirely self-hosted. No seat
              limits, no feature gates, no cloud bill.
            </p>

            {/* Install command block */}
            <div className="mx-auto mt-10 flex max-w-xl items-center justify-between gap-3 rounded-xl border border-border-strong bg-elevated px-4 py-3">
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="shrink-0 font-mono text-sm text-brand-400"
                  aria-hidden="true"
                >
                  $
                </span>
                <code className="truncate font-mono text-sm text-fg">
                  {SITE.installCmd}
                </code>
              </div>

              <button
                type="button"
                onClick={handleCopy}
                aria-label={copied ? "Copied to clipboard" : "Copy install command"}
                className="shrink-0 rounded-md p-1.5 text-subtle transition-colors hover:bg-surface-strong hover:text-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Button href={SITE.docs} variant="primary" size="lg">
                Read the docs
              </Button>
              <Button href={SITE.github} variant="outline" size="lg">
                <GithubIcon size={16} />
                View on GitHub
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
