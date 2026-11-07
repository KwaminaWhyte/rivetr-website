import { useState } from "react";
import { Copy, Check, ArrowRight } from "lucide-react";
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
    <Section id="install" className="border-t border-border">
      <Container>
        <div className="grid gap-x-10 gap-y-10 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="label-mono">Install</p>
            <h2 className="mt-4 text-[1.9rem] font-semibold leading-[1.12] tracking-[-0.03em] text-strong sm:text-[2.5rem]">
              Ship your first app in minutes.
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-7 text-fg-muted">
              One command installs Docker, the build tools, the binary, a
              systemd unit, and a generated admin token. Linux with Docker or
              Podman is all you need.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button href="/docs/quick-start" size="lg">
                Read the quick start
                <ArrowRight size={15} aria-hidden="true" />
              </Button>
              <Button href={SITE.github} variant="outline" size="lg">
                <GithubIcon size={15} />
                View on GitHub
              </Button>
            </div>
          </div>

          <div className="lg:col-span-6 lg:pt-1">
            <div className="overflow-hidden rounded-lg border border-border bg-surface">
              <div className="flex items-center justify-between border-b border-border px-4 py-2">
                <span className="label-mono">Install script</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  aria-label={copied ? "Copied to clipboard" : "Copy install command"}
                  className="inline-flex size-7 items-center justify-center rounded text-fg-subtle transition-colors hover:bg-surface-strong hover:text-fg-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
              <div className="px-4 py-4">
                <code className="block break-all font-mono text-xs leading-6 text-fg-muted">
                  {SITE.installCmd}
                </code>
              </div>
            </div>
            <p className="mt-3 font-mono text-[11px] text-fg-subtle">
              Rivetr {SITE.version} · MIT licensed · No telemetry
            </p>
          </div>
        </div>
      </Container>
    </Section>
  );
}
