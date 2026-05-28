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
      { title: "Installation", slug: "installation" },
    ],
  },
  {
    group: "Guides",
    items: [
      { title: "Deployments", slug: "deployments" },
      { title: "Databases", slug: "databases" },
      { title: "Configuration", slug: "configuration" },
    ],
  },
  {
    group: "Reference",
    items: [
      { title: "REST API", slug: "api" },
    ],
  },
  {
    group: "Project",
    items: [
      { title: "Contributing", slug: "contributing" },
    ],
  },
];
