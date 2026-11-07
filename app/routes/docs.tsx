import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router";
import { Menu, X, ExternalLink } from "lucide-react";
import { DOCS_NAV } from "~/lib/docs-nav";
import { DocsSearch } from "~/components/docs-search";

const GITHUB_DOCS_BASE =
  "https://github.com/KwaminaWhyte/rivetr-website/tree/main/app/content/docs";

function SidebarContent({ onLinkClick }: { onLinkClick?: () => void }) {
  const location = useLocation();
  const [query, setQuery] = useState("");
  const searching = query.trim().length >= 2;

  return (
    <nav aria-label="Documentation navigation" className="space-y-6">
      <DocsSearch onNavigate={onLinkClick} onQueryChange={setQuery} />
      {!searching &&
        DOCS_NAV.map((group) => (
        <div key={group.group}>
          <p className="label-mono mb-2 px-3">{group.group}</p>
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const to = `/docs/${item.slug}`;
              const active = location.pathname === to;
              return (
                <li key={item.slug}>
                  <NavLink
                    to={to}
                    onClick={onLinkClick}
                    className={[
                      "block rounded-md px-3 py-1.5 text-sm transition-colors duration-150",
                      active
                        ? "bg-surface-strong font-medium text-fg-strong"
                        : "text-fg-muted hover:bg-surface-strong hover:text-fg-strong",
                    ].join(" ")}
                  >
                    {item.title}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      <div className="border-t border-border pt-4">
        <a
          href={GITHUB_DOCS_BASE}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-subtle transition-colors hover:text-strong"
        >
          <ExternalLink size={13} />
          View on GitHub
        </a>
      </div>
    </nav>
  );
}

export default function DocsLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto flex w-full max-w-[1180px] px-6 sm:px-8">
        {/* Desktop sidebar */}
        <aside className="hidden w-56 shrink-0 lg:block xl:w-64">
          <div className="sticky top-14 max-h-[calc(100vh-3.5rem)] overflow-y-auto py-8 pr-6">
            {/* Docs label */}
            <div className="mb-6 flex items-baseline gap-2 px-3">
              <span className="text-[13px] font-medium text-fg-strong">Docs</span>
              <span className="font-mono text-[10px] text-fg-subtle">v1.0</span>
            </div>
            <SidebarContent />
          </div>
        </aside>

        {/* Mobile sidebar toggle */}
        <div className="fixed bottom-6 right-6 z-40 lg:hidden">
          <button
            aria-label={sidebarOpen ? "Close navigation" : "Open navigation"}
            onClick={() => setSidebarOpen((v) => !v)}
            className="flex size-11 items-center justify-center rounded-lg border border-border-strong bg-surface text-fg-muted shadow-lg transition-colors hover:text-fg-strong"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile sidebar drawer */}
        {sidebarOpen && (
          <>
            <div
              className="fixed inset-0 z-30 backdrop-blur-sm lg:hidden"
              style={{ background: "var(--overlay-scrim)" }}
              onClick={() => setSidebarOpen(false)}
            />
            <aside className="fixed inset-y-0 left-0 z-40 w-64 overflow-y-auto border-r border-border bg-surface p-6 lg:hidden">
              <div className="mb-6 flex items-baseline gap-2">
                <span className="text-[13px] font-medium text-fg-strong">Docs</span>
                <span className="font-mono text-[10px] text-fg-subtle">v1.0</span>
              </div>
              <SidebarContent onLinkClick={() => setSidebarOpen(false)} />
            </aside>
          </>
        )}

        {/* Main content */}
        <main className="min-w-0 flex-1 py-8 lg:pl-8">
          <div className="mx-auto max-w-5xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
