import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router";
import { Menu, X, BookOpen, ExternalLink } from "lucide-react";
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
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-widest text-subtle">
            {group.group}
          </p>
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
                        ? "bg-brand-500/10 text-brand-400 font-medium"
                        : "text-muted hover:bg-surface-strong hover:text-strong",
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
      {/* Top bar: clears the fixed site nav */}
      <div className="h-[72px]" aria-hidden="true" />

      <div className="mx-auto flex w-full max-w-7xl px-4 sm:px-8">
        {/* Desktop sidebar */}
        <aside className="hidden w-56 shrink-0 lg:block xl:w-64">
          <div className="sticky top-[72px] max-h-[calc(100vh-72px)] overflow-y-auto py-8 pr-6">
            {/* Docs label */}
            <div className="mb-6 flex items-center gap-2 text-strong">
              <BookOpen size={16} className="text-brand-300" />
              <span className="text-sm font-semibold">Docs</span>
              <span className="rounded-full border border-border-strong px-1.5 py-0.5 font-mono text-[10px] text-subtle">
                v1.0
              </span>
            </div>
            <SidebarContent />
          </div>
        </aside>

        {/* Mobile sidebar toggle */}
        <div className="fixed bottom-6 right-6 z-40 lg:hidden">
          <button
            aria-label={sidebarOpen ? "Close navigation" : "Open navigation"}
            onClick={() => setSidebarOpen((v) => !v)}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-border-strong bg-surface text-fg shadow-lg transition-colors hover:border-brand-500/60 hover:text-strong"
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
              <div className="mb-6 flex items-center gap-2 text-strong">
                <BookOpen size={16} className="text-brand-300" />
                <span className="text-sm font-semibold">Docs</span>
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
