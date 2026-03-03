import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import { Clock, LogIn, PlayCircle } from "lucide-react";
import { motion } from "motion/react";
import type { RecentlyWatched } from "../backend.d";
import AppHeader from "../components/AppHeader";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useRecentlyWatched } from "../hooks/useQueries";

function formatRelativeTime(watchedAtNanos: bigint): string {
  const watchedAtMs = Number(watchedAtNanos / 1_000_000n);
  const now = Date.now();
  const diffMs = now - watchedAtMs;
  if (diffMs < 0) return "Just now";
  if (diffMs < 60_000) return "Just now";
  if (diffMs < 3_600_000) {
    const mins = Math.floor(diffMs / 60_000);
    return `${mins}m ago`;
  }
  if (diffMs < 86_400_000) {
    const hrs = Math.floor(diffMs / 3_600_000);
    return `${hrs}h ago`;
  }
  const days = Math.floor(diffMs / 86_400_000);
  return `${days}d ago`;
}

function formatDuration(seconds: bigint): string {
  const secs = Number(seconds);
  if (secs === 0) return "";
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function RecentItem({
  item,
  index,
}: {
  item: RecentlyWatched;
  index: number;
}) {
  const timeAgo = formatRelativeTime(item.watchedAt);
  const duration = formatDuration(item.videoPositionSeconds);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05 }}
      data-ocid={`recent.item.${index + 1}`}
      className="bg-card border border-border rounded-xl p-4 flex items-center gap-3"
    >
      <div className="bg-primary/10 rounded-lg w-9 h-9 flex items-center justify-center flex-shrink-0">
        <PlayCircle size={18} className="text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">
          Topic #{item.topicId.toString()}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <Clock size={11} className="text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{timeAgo}</span>
          {duration && (
            <>
              <span className="text-muted-foreground/40 text-xs">·</span>
              <span className="text-xs text-muted-foreground">
                Stopped at {duration}
              </span>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function RecentList() {
  const { data: recentItems = [], isLoading } = useRecentlyWatched();

  const sorted = [...recentItems].sort(
    (a, b) => Number(b.watchedAt) - Number(a.watchedAt),
  );

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    );
  }

  if (sorted.length === 0) {
    return (
      <div
        data-ocid="recent.empty_state"
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <div className="bg-primary/10 rounded-full p-5 mb-4">
          <Clock size={32} className="text-primary" />
        </div>
        <p className="font-display font-semibold text-foreground mb-1">
          No watch history yet
        </p>
        <p className="text-sm text-muted-foreground max-w-xs">
          Videos you watch will appear here so you can continue where you left
          off
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">
        {sorted.length} recently watched
      </p>
      {sorted.map((item, i) => (
        <RecentItem
          key={`${item.topicId}-${item.watchedAt}`}
          item={item}
          index={i}
        />
      ))}
    </div>
  );
}

export default function RecentPage() {
  const { identity, login } = useInternetIdentity();
  const isLoggedIn = !!identity;

  return (
    <div className="page-enter">
      <AppHeader title="Recently Watched" subtitle="Continue your learning" />

      <div className="px-4 pt-4">
        {!isLoggedIn ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="bg-primary/10 rounded-full p-5 mb-4">
              <LogIn size={32} className="text-primary" />
            </div>
            <p className="font-display font-semibold text-foreground mb-2">
              Login to track your progress
            </p>
            <p className="text-sm text-muted-foreground max-w-xs mb-5">
              Your watch history will be saved across all your devices
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
          <RecentList />
        )}
      </div>
    </div>
  );
}
