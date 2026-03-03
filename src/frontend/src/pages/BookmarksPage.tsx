import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import { Bookmark, LogIn } from "lucide-react";
import type { Bookmark as BookmarkType } from "../backend.d";
import AppHeader from "../components/AppHeader";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useBookmarks } from "../hooks/useQueries";

function BookmarkItem({
  bookmark,
  index,
}: {
  bookmark: BookmarkType;
  index: number;
}) {
  return (
    <div
      data-ocid={`bookmarks.item.${index + 1}`}
      className="bg-card border border-border rounded-xl p-4 flex items-center gap-3"
    >
      <div className="bg-rose-50 dark:bg-rose-500/10 rounded-lg w-9 h-9 flex items-center justify-center flex-shrink-0">
        <Bookmark size={16} className="text-rose-500" fill="currentColor" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">
          Topic #{bookmark.topicId.toString()}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">Bookmarked</p>
      </div>
    </div>
  );
}

function BookmarksWithData() {
  const navigate = useNavigate();
  const { data: bookmarks = [], isLoading } = useBookmarks();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <div
        data-ocid="bookmarks.empty_state"
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <div className="bg-rose-50 dark:bg-rose-500/10 rounded-full p-5 mb-4">
          <Bookmark size={32} className="text-rose-400" />
        </div>
        <p className="font-display font-semibold text-foreground mb-1">
          No bookmarks yet
        </p>
        <p className="text-sm text-muted-foreground max-w-xs">
          Tap the heart icon on any topic to save it here for quick access
        </p>
        <Button
          variant="outline"
          onClick={() => navigate({ to: "/" })}
          className="mt-4"
        >
          Browse Subjects
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">
        {bookmarks.length} saved topic{bookmarks.length !== 1 ? "s" : ""}
      </p>
      {bookmarks.map((bm, i) => (
        <BookmarkItem key={bm.topicId.toString()} bookmark={bm} index={i} />
      ))}
    </div>
  );
}

export default function BookmarksPage() {
  const { identity, login } = useInternetIdentity();
  const isLoggedIn = !!identity;

  return (
    <div className="page-enter">
      <AppHeader
        title="Saved Topics"
        subtitle="Your bookmarked study material"
      />

      <div className="px-4 pt-4">
        {!isLoggedIn ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="bg-primary/10 rounded-full p-5 mb-4">
              <LogIn size={32} className="text-primary" />
            </div>
            <p className="font-display font-semibold text-foreground mb-2">
              Login to view bookmarks
            </p>
            <p className="text-sm text-muted-foreground max-w-xs mb-5">
              Create an account to save topics and access them from any device
            </p>
            <Button
              onClick={login}
              data-ocid="auth.login_button"
              size="lg"
              className="rounded-xl"
            >
              <LogIn size={17} className="mr-2" />
              Login
            </Button>
          </div>
        ) : (
          <BookmarksWithData />
        )}
      </div>
    </div>
  );
}
