import {
  siDocker,
  siPodman,
  siNodedotjs,
  siPython,
  siGo,
  siRust,
  siRuby,
  siPhp,
  siBun,
  siDeno,
  siPostgresql,
  siMysql,
  siMongodb,
  siRedis,
  siClickhouse,
  siMariadb,
  siGithub,
  siGitlab,
  siGitea,
  siBitbucket,
  type SimpleIcon as SI,
} from "simple-icons";
import { Container } from "~/components/ui";
import { TECH_STACK, type TechItem } from "~/lib/content";

// Bundled monochrome glyphs (no external CDN) keyed by content slug.
const ICONS: Record<string, SI> = {
  docker: siDocker,
  podman: siPodman,
  nodedotjs: siNodedotjs,
  python: siPython,
  go: siGo,
  rust: siRust,
  ruby: siRuby,
  php: siPhp,
  bun: siBun,
  deno: siDeno,
  postgresql: siPostgresql,
  mysql: siMysql,
  mongodb: siMongodb,
  redis: siRedis,
  clickhouse: siClickhouse,
  mariadb: siMariadb,
  github: siGithub,
  gitlab: siGitlab,
  gitea: siGitea,
  bitbucket: siBitbucket,
};

function Glyph({ slug, name }: { slug: string; name: string }) {
  const icon = ICONS[slug];
  if (!icon) return null;
  return (
    <svg
      role="img"
      aria-label={name}
      viewBox="0 0 24 24"
      width={18}
      height={18}
      fill="currentColor"
      className="shrink-0"
    >
      <path d={icon.path} />
    </svg>
  );
}

function MarqueeTrack({ items, reverse }: { items: TechItem[]; reverse?: boolean }) {
  const doubled = [...items, ...items];
  return (
    <div className="marquee-mask relative overflow-hidden">
      <div
        className={[
          "flex w-max gap-4",
          reverse ? "animate-marquee-reverse" : "animate-marquee",
          "hover:[animation-play-state:paused]",
        ].join(" ")}
      >
        {doubled.map((item, i) => (
          <div
            key={`${item.slug}-${i}`}
            className="flex shrink-0 items-center gap-2 rounded-lg border border-ink-700 bg-ink-900 px-4 py-2.5 text-mist-400 transition-colors hover:text-mist-200"
          >
            <Glyph slug={item.slug} name={item.name} />
            <span className="whitespace-nowrap text-sm font-medium">
              {item.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LogoMarquee() {
  return (
    <div className="overflow-hidden border-b border-ink-700 bg-ink-950 py-12">
      <Container>
        <p className="mb-8 text-center text-xs font-semibold uppercase tracking-widest text-mist-400">
          Deploy anything, works with your stack
        </p>
      </Container>
      <div className="flex flex-col gap-4">
        {TECH_STACK.map((row, i) => (
          <MarqueeTrack key={row.label} items={row.items} reverse={i % 2 === 1} />
        ))}
      </div>
    </div>
  );
}
