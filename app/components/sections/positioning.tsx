import { Container } from "~/components/ui";
import { ALTERNATIVES } from "~/lib/content";

export function Positioning() {
  return (
    <div className="border-b border-border bg-bg-elevated">
      <Container>
        <div className="grid gap-x-10 gap-y-3 py-8 lg:grid-cols-12 lg:items-baseline">
          <p className="label-mono lg:col-span-3">Replaces</p>
          <p className="text-[15px] leading-7 text-fg-muted lg:col-span-9">
            <span className="text-fg-strong">
              The open-source alternative to managed platforms.
            </span>{" "}
            Self-host the developer experience of{" "}
            {ALTERNATIVES.slice(0, -1).join(", ")}, and{" "}
            {ALTERNATIVES[ALTERNATIVES.length - 1]} on a server you own, with no
            vendor lock-in and no bill per seat.
          </p>
        </div>
      </Container>
    </div>
  );
}
