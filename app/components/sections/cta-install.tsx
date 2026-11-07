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
          <div
            className="aurora pointer-events-none absolute inset-0 opacity-30"
            aria-hidden="true"
          />
          <div
            className="bg-grid mask-fade-b pointer-events-none absolute inset-0 opacity-[0.04]"
            aria-hidden="true"
          />

          <div className="relative z-10 px-6 py-14 text-center sm:px-16 sm:py-20">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-300">
              Rivetr {SITE.version} · MIT licensed
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-strong sm:text-4xl lg:text-5xl">
              Ship your first app{" "}
              <span className="text-gradient">in minutes</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-subtle">
              One command installs Docker, the build tools, the binary, a
              systemd unit, and a generated admin token. Linux with Docker or
              Podman is all you need.
            </p>

            <div className="mx-auto mt-10 flex max-w-2xl items-center gap-3 rounded-xl border border-border-strong bg-bg px-4 py-3">
              <span
                className="shrink-0 font-mono text-sm text-brand-300"
                aria-hidden="true"
              >
                $
              </span>
              <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap text-left font-mono text-xs text-fg sm:text-sm">
                {SITE.installCmd}
              </code>
              <button
                type="button"
                onClick={handleCopy}
                aria-label={copied ? "Copied to clipboard" : "Copy install command"}
                className="shrink-0 rounded-md p-1.5 text-subtle transition-colors hover:bg-surface-strong hover:text-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-success" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Button href="/docs/quick-start" variant="primary" size="lg">
                Read the quick start
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
