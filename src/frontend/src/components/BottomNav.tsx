import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import { Bookmark, Clock, Home, Settings } from "lucide-react";
import { useIsAdmin } from "../hooks/useQueries";

const navItems = [
  {
    to: "/",
    label: "Home",
    icon: Home,
    ocid: "nav.home_button",
    exact: true,
  },
  {
    to: "/bookmarks",
    label: "Saved",
    icon: Bookmark,
    ocid: "nav.bookmarks_button",
    exact: false,
  },
  {
    to: "/recent",
    label: "Recent",
    icon: Clock,
    ocid: "nav.recent_button",
    exact: false,
  },
] as const;

export default function BottomNav() {
  const { data: isAdmin } = useIsAdmin();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const allItems = isAdmin
    ? [
        ...navItems,
        {
          to: "/admin" as const,
          label: "Admin",
          icon: Settings,
          ocid: "nav.admin_button",
          exact: false,
        },
      ]
    : navItems;

  return (
    <nav className="bottom-nav safe-bottom">
      <div className="flex items-center justify-around px-2 h-16">
        {allItems.map(({ to, label, icon: Icon, ocid, exact }) => {
          const isActive = exact
            ? currentPath === to
            : currentPath.startsWith(to);

          return (
            <Link
              key={to}
              to={to}
              data-ocid={ocid}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all min-w-[60px]",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon
                size={22}
                className={cn("transition-transform", isActive && "scale-110")}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
              <span
                className={cn(
                  "text-xs font-medium",
                  isActive && "font-semibold",
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
