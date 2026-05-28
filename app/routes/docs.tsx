import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router";
import { Menu, X, BookOpen, ExternalLink } from "lucide-react";
import { DOCS_NAV } from "~/lib/docs-nav";

const GITHUB_DOCS_BASE =
  "https://github.com/KwaminaWhyte/rivetr/tree/main/docs";

function SidebarContent({ onLinkClick }: { onLinkClick?: () => void }) {
  const location = useLocation();

  return (
    <nav aria-label="Documentation navigation" className="space-y-6">
      {DOCS_NAV.map((group) => (
        <div key={group.group}>
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-widest text-mist-400">
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
                        : "text-mist-300 hover:bg-ink-800 hover:text-white",
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

      <div className="border-t border-ink-700 pt-4">
        <a
          href={GITHUB_DOCS_BASE}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-mist-400 transition-colors hover:text-white"
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
    <div className="min-h-screen bg-ink-950">
      {/* Top bar — same height as site-nav to account for fixed nav */}
      <div className="h-14" aria-hidden="true" />

      <div className="mx-auto flex w-full max-w-7xl px-4 sm:px-8">
        {/* Desktop sidebar */}
        <aside className="hidden w-56 shrink-0 lg:block xl:w-64">
          <div className="sticky top-[72px] max-h-[calc(100vh-72px)] overflow-y-auto py-8 pr-6">
            {/* Docs label */}
            <div className="mb-6 flex items-center gap-2 text-white">
              <BookOpen size={16} className="text-brand-400" />
              <span className="text-sm font-semibold">Docs</span>
            </div>
            <SidebarContent />
          </div>
        </aside>

        {/* Mobile sidebar toggle */}
        <div className="fixed bottom-6 right-6 z-40 lg:hidden">
          <button
            aria-label={sidebarOpen ? "Close navigation" : "Open navigation"}
            onClick={() => setSidebarOpen((v) => !v)}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-ink-600 bg-ink-900 text-mist-200 shadow-lg transition-colors hover:border-brand-500/60 hover:text-white"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile sidebar drawer */}
        {sidebarOpen && (
          <>
            <div
              className="fixed inset-0 z-30 bg-ink-950/80 backdrop-blur-sm lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <aside className="fixed inset-y-0 left-0 z-40 w-64 overflow-y-auto border-r border-ink-700 bg-ink-900 p-6 lg:hidden">
              <div className="mb-6 flex items-center gap-2 text-white">
                <BookOpen size={16} className="text-brand-400" />
                <span className="text-sm font-semibold">Docs</span>
              </div>
              <SidebarContent onLinkClick={() => setSidebarOpen(false)} />
            </aside>
          </>
        )}

        {/* Main content */}
        <main className="min-w-0 flex-1 py-8 lg:pl-8 xl:pl-12">
          <div className="mx-auto max-w-3xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
