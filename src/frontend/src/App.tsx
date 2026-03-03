import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import BottomNav from "./components/BottomNav";
import AdminPage from "./pages/AdminPage";
import BookmarksPage from "./pages/BookmarksPage";
import HomePage from "./pages/HomePage";
import RecentPage from "./pages/RecentPage";
import SubjectPage from "./pages/SubjectPage";
import TopicPage from "./pages/TopicPage";

function Layout() {
  return (
    <div className="min-h-dvh flex flex-col bg-background max-w-lg mx-auto">
      <main className="flex-1 pb-20">
        <Outlet />
      </main>
      <BottomNav />
      <Toaster position="top-center" />
    </div>
  );
}

const rootRoute = createRootRoute({ component: Layout });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const subjectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/subject/$subjectId",
  component: SubjectPage,
});

const topicRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/topic/$subjectId/$topicId",
  component: TopicPage,
});

const bookmarksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/bookmarks",
  component: BookmarksPage,
});

const recentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/recent",
  component: RecentPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  subjectRoute,
  topicRoute,
  bookmarksRoute,
  recentRoute,
  adminRoute,
]);

const router = createRouter({ routeTree, defaultPreload: "intent" });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  const [, forceUpdate] = useState(0);

  // Initialise dark mode from localStorage
  useEffect(() => {
    const isDark = localStorage.getItem("darkMode") === "true";
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    forceUpdate((n) => n + 1);
  }, []);

  return <RouterProvider router={router} />;
}
