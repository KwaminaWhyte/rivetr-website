import { FLAT_DOCS } from "./docs-nav";

// Every docs page imported once. Used by the page renderer and the search.
import introductionMd from "~/content/docs/introduction.md?raw";
import installationMd from "~/content/docs/installation.md?raw";
import upgradingMd from "~/content/docs/upgrading.md?raw";
import configurationMd from "~/content/docs/configuration.md?raw";
import deploymentsMd from "~/content/docs/deployments.md?raw";
import databasesMd from "~/content/docs/databases.md?raw";
import servicesMd from "~/content/docs/services.md?raw";
import secretManagersMd from "~/content/docs/secret-managers.md?raw";
import securityMd from "~/content/docs/security.md?raw";
import troubleshootingMd from "~/content/docs/troubleshooting.md?raw";
import apiMd from "~/content/docs/api.md?raw";
import contributingMd from "~/content/docs/contributing.md?raw";
import quickStartMd from "~/content/docs/quick-start.md?raw";
import buildTypesMd from "~/content/docs/build-types.md?raw";
import webhooksMd from "~/content/docs/webhooks.md?raw";
import environmentVariablesMd from "~/content/docs/environment-variables.md?raw";
import domainsAndHttpsMd from "~/content/docs/domains-and-https.md?raw";
import backupsMd from "~/content/docs/backups.md?raw";
import monitoringAndLogsMd from "~/content/docs/monitoring-and-logs.md?raw";
import teamsAndRbacMd from "~/content/docs/teams-and-rbac.md?raw";
import multiServerAndScaleMd from "~/content/docs/multi-server-and-scale.md?raw";
import cliMd from "~/content/docs/cli.md?raw";
import mcpServerMd from "~/content/docs/mcp-server.md?raw";
import faqMd from "~/content/docs/faq.md?raw";

export const DOCS_CONTENT: Record<string, string> = {
  introduction: introductionMd,
  installation: installationMd,
  "quick-start": quickStartMd,
  upgrading: upgradingMd,
  configuration: configurationMd,
  deployments: deploymentsMd,
  "build-types": buildTypesMd,
  webhooks: webhooksMd,
  services: servicesMd,
  "environment-variables": environmentVariablesMd,
  "domains-and-https": domainsAndHttpsMd,
  databases: databasesMd,
  backups: backupsMd,
  "secret-managers": secretManagersMd,
  "monitoring-and-logs": monitoringAndLogsMd,
  "teams-and-rbac": teamsAndRbacMd,
  "multi-server-and-scale": multiServerAndScaleMd,
  security: securityMd,
  api: apiMd,
  cli: cliMd,
  "mcp-server": mcpServerMd,
  faq: faqMd,
  troubleshooting: troubleshootingMd,
  contributing: contributingMd,
};

export type SearchResult = {
  slug: string;
  title: string;
  heading?: string;
  snippet: string;
  score: number;
};

type IndexEntry = {
  slug: string;
  title: string;
  headings: { text: string }[];
  plain: string;
  lower: string;
};

function plainText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/^#\s+.*$/m, " ")
    .replace(/^\s*\|?[\s:|-]{3,}\|?\s*$/gm, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_>#|]/g, " ")
    .replace(/[-]{2,}/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function headingText(line: string): string {
  return line
    .replace(/^#{2,3}\s+/, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_]/g, "")
    .trim();
}

const INDEX: IndexEntry[] = Object.entries(DOCS_CONTENT).map(([slug, body]) => {
  const title = FLAT_DOCS.find((item) => item.slug === slug)?.title ?? slug;
  const headings = body
    .split("\n")
    .filter((line) => /^#{2,3}\s+/.test(line))
    .map((line) => ({ text: headingText(line) }));
  const plain = plainText(body);
  return { slug, title, headings, plain, lower: plain.toLowerCase() };
});

function snippetAround(text: string, term: string): string {
  const lower = text.toLowerCase();
  const index = lower.indexOf(term);
  if (index < 0) return text.slice(0, 140) + (text.length > 140 ? "..." : "");
  const start = Math.max(0, index - 50);
  const end = Math.min(text.length, index + term.length + 100);
  const prefix = start > 0 ? "..." : "";
  const suffix = end < text.length ? "..." : "";
  return `${prefix}${text.slice(start, end).trim()}${suffix}`;
}

export function searchDocs(query: string): SearchResult[] {
  const normalized = query.trim().toLowerCase();
  if (normalized.length < 2) return [];

  const terms = normalized.split(/\s+/).filter(Boolean);
  const results: SearchResult[] = [];

  for (const entry of INDEX) {
    const titleLower = entry.title.toLowerCase();
    const headingsLower = entry.headings.map((h) => h.text.toLowerCase());
    const everything = `${titleLower} ${headingsLower.join(" ")} ${entry.lower}`;

    // Every term must appear somewhere in the page.
    if (!terms.every((term) => everything.includes(term))) continue;

    let score = 0;
    for (const term of terms) {
      if (titleLower.includes(term)) score += 14;
      if (headingsLower.some((heading) => heading.includes(term))) score += 7;
      const occurrences = entry.lower.split(term).length - 1;
      score += Math.min(occurrences, 12);
    }

    const matchingHeading = entry.headings.find((heading) =>
      terms.some((term) => heading.text.toLowerCase().includes(term)),
    );

    results.push({
      slug: entry.slug,
      title: entry.title,
      heading: matchingHeading?.text,
      snippet: snippetAround(entry.plain, terms[0]),
      score,
    });
  }

  return results.sort((a, b) => b.score - a.score).slice(0, 8);
}
