import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, FileText, Heart, LogIn, PlayCircle } from "lucide-react";
import { motion } from "motion/react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Topic } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddBookmark,
  useAllSubjects,
  useBookmarks,
  useRecordRecentlyWatched,
  useRemoveBookmark,
  useTopicsBySubject,
} from "../hooks/useQueries";

function getYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) {
      return u.searchParams.get("v");
    }
    if (u.hostname === "youtu.be") {
      return u.pathname.slice(1);
    }
  } catch {
    // not a URL
  }
  return null;
}

function VideoPlayer({
  topic,
  onPositionChange,
}: {
  topic: Topic;
  onPositionChange: (pos: number) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const savedPos = Number.parseInt(
    localStorage.getItem(`videoPosition_${topic.id}`) ?? "0",
    10,
  );

  const ytId = getYouTubeId(topic.videoUrl);

  const savePosition = useCallback(() => {
    if (videoRef.current) {
      const pos = Math.floor(videoRef.current.currentTime);
      localStorage.setItem(`videoPosition_${topic.id}`, String(pos));
      onPositionChange(pos);
    }
  }, [topic.id, onPositionChange]);

  if (ytId) {
    const embedUrl = `https://www.youtube.com/embed/${ytId}?start=${savedPos}&enablejsapi=1`;
    return (
      <div className="video-container" data-ocid="topic.video_player">
        <iframe
          src={embedUrl}
          title={topic.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className="video-container" data-ocid="topic.video_player">
      <video
        ref={videoRef}
        src={topic.videoUrl}
        controls
        onPause={savePosition}
        onEnded={savePosition}
        onLoadedMetadata={() => {
          if (videoRef.current && savedPos > 0) {
            videoRef.current.currentTime = savedPos;
          }
        }}
        className="w-full h-full object-contain bg-black"
      >
        <track kind="captions" />
      </video>
    </div>
  );
}

function VideoPlaceholder() {
  return (
    <div
      data-ocid="topic.video_player"
      className="w-full aspect-video rounded-2xl bg-muted flex flex-col items-center justify-center border border-border"
    >
      <PlayCircle size={44} className="text-muted-foreground/40 mb-2" />
      <p className="text-sm text-muted-foreground">No video for this topic</p>
    </div>
  );
}

// Sample topics fallback
const SAMPLE_TOPIC_MAP: Record<string, Topic> = {
  "101": {
    id: 101n,
    title: "Introduction to Nursing",
    order: 1n,
    subjectId: 1n,
    notes:
      "Nursing is a healthcare profession focused on the care of individuals, families, and communities.\n\n**Key Points:**\n- Florence Nightingale: Founder of modern nursing\n- Nursing pledge: Nightingale Pledge\n- ICN: International Council of Nurses\n- INC: Indian Nursing Council\n\n**Types of Nursing:**\n1. Clinical Nursing\n2. Community Nursing\n3. Administrative Nursing\n4. Nursing Education\n5. Nursing Research",
    videoUrl: "",
  },
  "102": {
    id: 102n,
    title: "Nursing Process (ADPIE)",
    order: 2n,
    subjectId: 1n,
    notes:
      "The nursing process is a systematic, patient-centered approach to nursing care.\n\n**ADPIE Framework:**\n- **Assessment**: Collect subjective & objective data\n- **Diagnosis**: Identify nursing diagnoses (NANDA)\n- **Planning**: Set goals, plan interventions\n- **Implementation**: Execute the care plan\n- **Evaluation**: Evaluate outcomes, revise plan\n\n**Important:** NANDA = North American Nursing Diagnosis Association",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
  "201": {
    id: 201n,
    title: "Cardiovascular System Disorders",
    order: 1n,
    subjectId: 2n,
    notes:
      "**Heart Failure:**\n- Left-sided: Pulmonary congestion, dyspnoea, orthopnoea\n- Right-sided: Peripheral oedema, JVD, hepatomegaly\n\n**Myocardial Infarction:**\n- CRUSHING chest pain radiating to left arm/jaw\n- Elevated troponin, ST changes on ECG\n- Treatment: MONA (Morphine, O2, Nitrates, Aspirin)\n\n**Hypertension:**\n- Normal: <120/80 mmHg\n- Stage 1 HTN: 130-139/80-89 mmHg\n- Stage 2 HTN: ≥140/90 mmHg",
    videoUrl: "",
  },
  "301": {
    id: 301n,
    title: "Primary Health Care",
    order: 1n,
    subjectId: 3n,
    notes:
      "**Alma Ata Declaration (1978):**\n- Health for All by Year 2000\n- PHC is essential health care\n- Accessible, acceptable, affordable\n\n**8 Components of PHC (ESCAPE-D):**\n1. Education on health problems\n2. Safe water and sanitation\n3. Child and maternal care\n4. Adequate nutritional food\n5. Prevention of endemic diseases\n6. Essential drugs\n7. Treatment of common diseases\n8. Disease immunization",
    videoUrl: "",
  },
};

export default function TopicPage() {
  const params = useParams({ from: "/topic/$subjectId/$topicId" });
  const { subjectId, topicId } = params;
  const navigate = useNavigate();

  const subjectIdBig = BigInt(subjectId ?? "0");
  const topicIdBig = BigInt(topicId ?? "0");

  const { identity, login } = useInternetIdentity();
  const isLoggedIn = !!identity;

  const { data: subjects } = useAllSubjects();
  const { data: topics, isLoading } = useTopicsBySubject(subjectIdBig);
  const { data: bookmarks } = useBookmarks();
  const addBookmark = useAddBookmark();
  const removeBookmark = useRemoveBookmark();
  const recordWatched = useRecordRecentlyWatched();

  const topic =
    topics?.find((t) => t.id === topicIdBig) ?? SAMPLE_TOPIC_MAP[topicId ?? ""];
  const subject = subjects?.find((s) => s.id === subjectIdBig);

  const isBookmarked =
    bookmarks?.some((b) => b.topicId === topicIdBig) ?? false;

  // Record watched when visiting a topic with a video
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional – only run when topicId or auth changes
  useEffect(() => {
    if (!topic || !isLoggedIn || !topic.videoUrl) return;
    const pos = Number.parseInt(
      localStorage.getItem(`videoPosition_${topic.id}`) ?? "0",
      10,
    );
    void recordWatched.mutateAsync({
      topicId: topicIdBig,
      position: BigInt(pos),
    });
  }, [topicId, isLoggedIn]);

  const handleBookmarkToggle = async () => {
    if (!isLoggedIn) {
      toast.info("Please login to save bookmarks", {
        action: {
          label: "Login",
          onClick: login,
        },
      });
      return;
    }
    try {
      if (isBookmarked) {
        await removeBookmark.mutateAsync(topicIdBig);
        toast.success("Removed from saved");
      } else {
        await addBookmark.mutateAsync(topicIdBig);
        toast.success("Saved to bookmarks!");
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  const handlePositionChange = (pos: number) => {
    if (isLoggedIn && topic) {
      void recordWatched.mutateAsync({
        topicId: topicIdBig,
        position: BigInt(pos),
      });
    }
  };

  const renderBold = (text: string): React.ReactNode => {
    // Split on **bold** markers and interleave with <strong> elements
    const segments: React.ReactNode[] = [];
    let remaining = text;
    let segIdx = 0;
    while (remaining.length > 0) {
      const start = remaining.indexOf("**");
      if (start === -1) {
        segments.push(remaining);
        break;
      }
      if (start > 0) {
        segments.push(remaining.slice(0, start));
      }
      const end = remaining.indexOf("**", start + 2);
      if (end === -1) {
        segments.push(remaining.slice(start));
        break;
      }
      segments.push(
        <strong key={`seg-${segIdx++}`}>
          {remaining.slice(start + 2, end)}
        </strong>,
      );
      remaining = remaining.slice(end + 2);
    }
    return segments;
  };

  const renderNotes = (notes: string) => {
    return notes.split("\n").map((line, i) => {
      const lineKey = `line-${i}`;
      if (line.startsWith("- ")) {
        return (
          <li
            key={lineKey}
            className="text-sm text-foreground/90 ml-4 list-disc"
          >
            {renderBold(line.slice(2))}
          </li>
        );
      }
      if (/^\d+\. /.test(line)) {
        return (
          <li
            key={lineKey}
            className="text-sm text-foreground/90 ml-4 list-decimal"
          >
            {renderBold(line.replace(/^\d+\. /, ""))}
          </li>
        );
      }
      if (line.trim() === "") return <div key={lineKey} className="h-2" />;
      return (
        <p key={lineKey} className="text-sm text-foreground/90 leading-relaxed">
          {renderBold(line)}
        </p>
      );
    });
  };

  if (isLoading && !topic) {
    return (
      <div className="page-enter">
        <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border">
          <div className="flex items-center gap-3 px-4 h-14">
            <button
              type="button"
              onClick={() =>
                navigate({ to: "/subject/$subjectId", params: { subjectId } })
              }
              className="h-9 w-9 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-accent"
            >
              <ArrowLeft size={20} />
            </button>
            <Skeleton className="h-5 w-40" />
          </div>
        </header>
        <div className="px-4 pt-4 space-y-4">
          <Skeleton className="w-full aspect-video rounded-2xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="page-enter text-center py-20">
        <p className="text-muted-foreground">Topic not found</p>
        <Button
          variant="ghost"
          onClick={() =>
            navigate({ to: "/subject/$subjectId", params: { subjectId } })
          }
          className="mt-4"
        >
          Go back
        </Button>
      </div>
    );
  }

  return (
    <div className="page-enter">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border">
        <div className="flex items-center gap-3 px-4 h-14">
          <button
            type="button"
            onClick={() =>
              navigate({ to: "/subject/$subjectId", params: { subjectId } })
            }
            data-ocid="topic.back_button"
            aria-label="Go back"
            className="h-9 w-9 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-accent transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground truncate">
              {subject?.iconEmoji} {subject?.name}
            </p>
            <h1 className="font-display font-bold text-sm text-foreground truncate leading-snug">
              {topic.title}
            </h1>
          </div>
          <button
            type="button"
            onClick={handleBookmarkToggle}
            data-ocid="topic.bookmark_button"
            aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
            className={`h-9 w-9 rounded-xl flex items-center justify-center transition-colors ${
              isBookmarked
                ? "text-rose-500 bg-rose-50 dark:bg-rose-500/10"
                : "text-muted-foreground hover:bg-accent"
            }`}
          >
            <Heart size={18} fill={isBookmarked ? "currentColor" : "none"} />
          </button>
        </div>
      </header>

      <div className="px-4 pt-4 pb-8 space-y-5">
        {/* Video section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <PlayCircle size={16} className="text-primary" />
            <h2 className="font-display font-semibold text-sm text-foreground">
              Video Lecture
            </h2>
          </div>

          {topic.videoUrl ? (
            <VideoPlayer
              topic={topic}
              onPositionChange={handlePositionChange}
            />
          ) : (
            <VideoPlaceholder />
          )}

          {!isLoggedIn && topic.videoUrl && (
            <p className="text-xs text-muted-foreground mt-2 text-center">
              <LogIn size={11} className="inline mr-1" />
              <button
                type="button"
                onClick={login}
                className="text-primary underline"
              >
                Login
              </button>{" "}
              to save your watch progress
            </p>
          )}
        </motion.div>

        {/* Notes section */}
        {topic.notes && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-card border border-border rounded-2xl p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <FileText size={16} className="text-primary" />
              <h2 className="font-display font-semibold text-sm text-foreground">
                Study Notes
              </h2>
            </div>
            <div className="space-y-1">{renderNotes(topic.notes)}</div>
          </motion.div>
        )}

        {/* Login prompt */}
        {!isLoggedIn && (
          <div className="bg-muted rounded-xl p-4 flex items-center gap-3">
            <LogIn size={18} className="text-muted-foreground flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                Save your progress
              </p>
              <p className="text-xs text-muted-foreground">
                Login to bookmark and track your learning
              </p>
            </div>
            <Button
              size="sm"
              onClick={login}
              data-ocid="auth.login_button"
              className="flex-shrink-0 h-8"
            >
              Login
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
