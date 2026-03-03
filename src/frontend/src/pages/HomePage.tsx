import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import { BookOpen, Search, Stethoscope } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { Subject, Topic } from "../backend.d";
import AppHeader from "../components/AppHeader";
import { useAllSubjects, useSearchTopics } from "../hooks/useQueries";

const COLOR_MAP: Record<string, string> = {
  teal: "subject-card-teal",
  mint: "subject-card-mint",
  sky: "subject-card-sky",
  rose: "subject-card-rose",
  violet: "subject-card-violet",
  amber: "subject-card-amber",
};

const ICON_BG: Record<string, string> = {
  teal: "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300",
  mint: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
  sky: "bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300",
  rose: "bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-300",
  violet:
    "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300",
  amber: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
};

function getColorClass(colorTag: string) {
  return COLOR_MAP[colorTag] ?? "subject-card-teal";
}

function getIconBg(colorTag: string) {
  return ICON_BG[colorTag] ?? ICON_BG.teal;
}

function SubjectCard({
  subject,
  index,
}: {
  subject: Subject;
  index: number;
}) {
  const navigate = useNavigate();
  const colorClass = getColorClass(subject.colorTag);
  const iconBg = getIconBg(subject.colorTag);

  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.04 }}
      whileTap={{ scale: 0.96 }}
      onClick={() =>
        navigate({
          to: "/subject/$subjectId",
          params: { subjectId: subject.id.toString() },
        })
      }
      data-ocid={`home.subject_card.${index + 1}`}
      className={`${colorClass} border rounded-2xl p-4 text-left w-full transition-shadow hover:shadow-md active:shadow-sm`}
    >
      <div
        className={`${iconBg} rounded-xl w-11 h-11 flex items-center justify-center text-2xl mb-3`}
      >
        {subject.iconEmoji || "📚"}
      </div>
      <p className="font-display font-semibold text-sm text-foreground leading-tight line-clamp-2">
        {subject.name}
      </p>
    </motion.button>
  );
}

// Default subjects for first-load sample content
const SAMPLE_SUBJECTS: Subject[] = [
  {
    id: 1n,
    order: 1n,
    name: "Nursing Foundation",
    description: "Core nursing principles and fundamentals",
    colorTag: "teal",
    iconEmoji: "🏥",
  },
  {
    id: 2n,
    order: 2n,
    name: "Medical Surgical Nursing",
    description: "Adult health nursing care",
    colorTag: "sky",
    iconEmoji: "💊",
  },
  {
    id: 3n,
    order: 3n,
    name: "Community Health Nursing",
    description: "Public and community health",
    colorTag: "mint",
    iconEmoji: "🌿",
  },
  {
    id: 4n,
    order: 4n,
    name: "Obstetrics & Gynecology",
    description: "Maternal and women's health nursing",
    colorTag: "rose",
    iconEmoji: "👶",
  },
  {
    id: 5n,
    order: 5n,
    name: "Pediatric Nursing",
    description: "Child health nursing care",
    colorTag: "amber",
    iconEmoji: "🧸",
  },
  {
    id: 6n,
    order: 6n,
    name: "Psychiatric Nursing",
    description: "Mental health nursing",
    colorTag: "violet",
    iconEmoji: "🧠",
  },
  {
    id: 7n,
    order: 7n,
    name: "Anatomy & Physiology",
    description: "Human body structure and function",
    colorTag: "teal",
    iconEmoji: "🦴",
  },
  {
    id: 8n,
    order: 8n,
    name: "Microbiology",
    description: "Microorganisms and disease",
    colorTag: "mint",
    iconEmoji: "🔬",
  },
  {
    id: 9n,
    order: 9n,
    name: "Pharmacology",
    description: "Drug therapy and medications",
    colorTag: "sky",
    iconEmoji: "💉",
  },
  {
    id: 10n,
    order: 10n,
    name: "Pathology",
    description: "Disease mechanisms and diagnosis",
    colorTag: "rose",
    iconEmoji: "🩺",
  },
  {
    id: 11n,
    order: 11n,
    name: "Nutrition",
    description: "Diet and nutritional therapy",
    colorTag: "amber",
    iconEmoji: "🥗",
  },
  {
    id: 12n,
    order: 12n,
    name: "Sociology",
    description: "Social factors in health",
    colorTag: "violet",
    iconEmoji: "👥",
  },
  {
    id: 13n,
    order: 13n,
    name: "Psychology",
    description: "Behavioral and mental health",
    colorTag: "teal",
    iconEmoji: "🧬",
  },
  {
    id: 14n,
    order: 14n,
    name: "Nursing Research & Statistics",
    description: "Evidence-based nursing practice",
    colorTag: "sky",
    iconEmoji: "📊",
  },
  {
    id: 15n,
    order: 15n,
    name: "Professional Trends & Ethics",
    description: "Nursing profession and ethics",
    colorTag: "mint",
    iconEmoji: "⚕️",
  },
];

function SearchResults({
  keyword,
  subjects,
}: {
  keyword: string;
  subjects: Subject[];
}) {
  const { data: results = [], isLoading } = useSearchTopics(keyword);
  const navigate = useNavigate();

  const getSubjectName = (subjectId: bigint) => {
    return subjects.find((s) => s.id === subjectId)?.name ?? "Unknown Subject";
  };

  if (isLoading) {
    return (
      <div className="space-y-3 mt-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="mt-8 text-center">
        <Search size={40} className="mx-auto text-muted-foreground/40 mb-3" />
        <p className="text-muted-foreground text-sm">
          No topics found for "{keyword}"
        </p>
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-2">
      <p className="text-xs text-muted-foreground font-medium px-1">
        {results.length} result{results.length !== 1 ? "s" : ""} found
      </p>
      {results.map((topic: Topic) => (
        <button
          type="button"
          key={topic.id.toString()}
          onClick={() =>
            navigate({
              to: "/topic/$subjectId/$topicId",
              params: {
                subjectId: topic.subjectId.toString(),
                topicId: topic.id.toString(),
              },
            })
          }
          className="w-full text-left bg-card border border-border rounded-xl p-3.5 hover:bg-accent transition-colors"
        >
          <p className="font-semibold text-sm text-foreground line-clamp-1">
            {topic.title}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {getSubjectName(topic.subjectId)}
            {topic.videoUrl && (
              <span className="ml-2 text-primary">▶ Video</span>
            )}
          </p>
        </button>
      ))}
    </div>
  );
}

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: subjects, isLoading } = useAllSubjects();
  const displaySubjects =
    subjects && subjects.length > 0 ? subjects : SAMPLE_SUBJECTS;

  const isSearching = searchQuery.trim().length > 1;

  return (
    <div className="page-enter">
      <AppHeader
        showLogo
        title="NORCET Prep"
        subtitle="Nursing Exam Preparation"
      />

      <div className="px-4 pt-4 pb-2">
        {/* Hero banner */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-4"
        >
          <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center gap-3">
            <div className="bg-primary/15 rounded-xl p-2.5 flex-shrink-0">
              <Stethoscope size={22} className="text-primary" />
            </div>
            <div>
              <p className="font-display font-semibold text-sm text-foreground">
                AIIMS NORCET 2025
              </p>
              <p className="text-xs text-muted-foreground">
                15 subjects · All topics covered
              </p>
            </div>
          </div>
        </motion.div>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="relative mb-4"
        >
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search subjects, topics..."
            data-ocid="home.search_input"
            className="pl-9 h-11 bg-card border-border rounded-xl text-sm"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-lg leading-none w-6 h-6 flex items-center justify-center"
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </motion.div>

        {/* Search results or subject grid */}
        {isSearching ? (
          <SearchResults keyword={searchQuery} subjects={displaySubjects} />
        ) : (
          <>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1 mb-3">
              All Subjects ({displaySubjects.length})
            </p>

            {isLoading ? (
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 10 }, (_, i) => i).map((i) => (
                  <Skeleton key={`skel-${i}`} className="h-28 rounded-2xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {displaySubjects.map((subject, i) => (
                  <SubjectCard
                    key={subject.id.toString()}
                    subject={subject}
                    index={i}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-8 pb-2 text-center">
        <p className="text-xs text-muted-foreground/60">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-muted-foreground"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
