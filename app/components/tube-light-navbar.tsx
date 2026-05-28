import { useLocation } from "react-router";
import { Link } from "react-router";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "~/lib/utils";

export interface NavItem {
  name: string;
  url: string;
  icon: LucideIcon;
}

// A pill navigation with an animated "tube light" indicator under the active
// item. Adapted from the 21st.dev component for React Router + the site's
// dark/brand theme (no shadcn tokens). Active item is derived from the route,
// not click state, so it stays correct on navigation and back/forward.
export function TubeLightNavBar({
  items,
  className,
  bare = false,
}: {
  items: NavItem[];
  className?: string;
  // When true, render only the link list (no pill chrome) so it can nest
  // inside a larger container.
  bare?: boolean;
}) {
  const { pathname } = useLocation();

  const isActive = (url: string) =>
    url === "/" ? pathname === "/" : pathname.startsWith(url);

  return (
    <nav
      aria-label="Primary"
      className={cn(
        "flex items-center gap-1",
        !bare &&
          "rounded-full border border-ink-700 bg-ink-900/70 px-1 py-1 backdrop-blur-lg",
        className,
      )}
    >
      {items.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.url);
        return (
          <Link
            key={item.name}
            to={item.url}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60",
              active ? "text-brand-300" : "text-mist-400 hover:text-white",
            )}
          >
            <span className="hidden sm:inline">{item.name}</span>
            <span className="sm:hidden">
              <Icon size={18} strokeWidth={2.4} aria-label={item.name} />
            </span>
            {active && (
              <motion.div
                layoutId="navlamp"
                className="absolute inset-0 -z-10 w-full rounded-full bg-brand-500/10"
                initial={false}
                transition={{ type: "spring", stiffness: 320, damping: 30 }}
              >
                {/* the glowing tube above the active item */}
                <div className="absolute -top-[5px] left-1/2 h-1 w-8 -translate-x-1/2 rounded-t-full bg-brand-500">
                  <div className="absolute -left-2 -top-2 h-6 w-12 rounded-full bg-brand-500/20 blur-md" />
                  <div className="absolute -top-1 h-6 w-8 rounded-full bg-brand-500/20 blur-md" />
                  <div className="absolute left-2 top-0 h-4 w-4 rounded-full bg-brand-500/20 blur-sm" />
                </div>
              </motion.div>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
