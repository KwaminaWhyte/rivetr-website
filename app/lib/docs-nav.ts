export interface DocsNavItem {
  title: string;
  slug: string;
}

export interface DocsNavGroup {
  group: string;
  items: DocsNavItem[];
}

export const DOCS_NAV: DocsNavGroup[] = [
  {
    group: "Getting started",
    items: [
      { title: "Introduction", slug: "introduction" },
      { title: "Quick Start", slug: "quick-start" },
      { title: "Installation", slug: "installation" },
      { title: "Upgrading", slug: "upgrading" },
    ],
  },
  {
    group: "Deploy",
    items: [
      { title: "Deployments", slug: "deployments" },
      { title: "Build Types", slug: "build-types" },
      { title: "Webhooks", slug: "webhooks" },
      { title: "Compose Services", slug: "services" },
      { title: "Environment Variables", slug: "environment-variables" },
      { title: "Domains and HTTPS", slug: "domains-and-https" },
      { title: "Databases", slug: "databases" },
      { title: "Backups", slug: "backups" },
      { title: "Secret Managers", slug: "secret-managers" },
    ],
  },
  {
    group: "Operate",
    items: [
      { title: "Monitoring and Logs", slug: "monitoring-and-logs" },
      { title: "Teams and RBAC", slug: "teams-and-rbac" },
      { title: "Remote Servers and Scale", slug: "multi-server-and-scale" },
      { title: "Security", slug: "security" },
    ],
  },
  {
    group: "Reference",
    items: [
      { title: "Configuration", slug: "configuration" },
      { title: "REST API", slug: "api" },
      { title: "CLI", slug: "cli" },
      { title: "MCP Server", slug: "mcp-server" },
    ],
  },
  {
    group: "Project",
    items: [
      { title: "FAQ", slug: "faq" },
      { title: "Troubleshooting", slug: "troubleshooting" },
      { title: "Contributing", slug: "contributing" },
    ],
  },
];

export const FLAT_DOCS = DOCS_NAV.flatMap((group) => group.items);
