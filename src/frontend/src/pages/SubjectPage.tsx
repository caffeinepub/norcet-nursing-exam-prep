import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, FileText, PlayCircle } from "lucide-react";
import { motion } from "motion/react";
import type { Topic } from "../backend.d";
import { useAllSubjects, useTopicsBySubject } from "../hooks/useQueries";

// Sample topics for seed content
const SAMPLE_TOPICS: Record<string, Topic[]> = {
  "1": [
    {
      id: 101n,
      title: "Introduction to Nursing",
      order: 1n,
      subjectId: 1n,
      notes:
        "Overview of nursing as a profession, its history, and core values.",
      videoUrl: "",
    },
    {
      id: 102n,
      title: "Nursing Process (ADPIE)",
      order: 2n,
      subjectId: 1n,
      notes: "Assessment, Diagnosis, Planning, Implementation, and Evaluation.",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    },
    {
      id: 103n,
      title: "Vital Signs Measurement",
      order: 3n,
      subjectId: 1n,
      notes:
        "Temperature, Pulse, Respiration, Blood Pressure, SpO2 techniques.",
      videoUrl: "",
    },
    {
      id: 104n,
      title: "Body Mechanics & Patient Positioning",
      order: 4n,
      subjectId: 1n,
      notes:
        "Safe body mechanics for nurses and proper patient positioning techniques.",
      videoUrl: "",
    },
    {
      id: 105n,
      title: "Infection Control & Asepsis",
      order: 5n,
      subjectId: 1n,
      notes: "Standard precautions, hand hygiene, PPE use, sterile technique.",
      videoUrl: "",
    },
  ],
  "2": [
    {
      id: 201n,
      title: "Cardiovascular System Disorders",
      order: 1n,
      subjectId: 2n,
      notes: "Heart failure, MI, hypertension management and nursing care.",
      videoUrl: "",
    },
    {
      id: 202n,
      title: "Respiratory System Nursing",
      order: 2n,
      subjectId: 2n,
      notes: "COPD, asthma, pneumonia — assessment and interventions.",
      videoUrl: "",
    },
    {
      id: 203n,
      title: "Neurological Nursing",
      order: 3n,
      subjectId: 2n,
      notes: "Stroke, epilepsy, head injury — nursing management.",
      videoUrl: "",
    },
    {
      id: 204n,
      title: "Diabetes Mellitus Management",
      order: 4n,
      subjectId: 2n,
      notes: "Type 1 & 2 diabetes, insulin therapy, patient education.",
      videoUrl: "",
    },
  ],
  "3": [
    {
      id: 301n,
      title: "Primary Health Care",
      order: 1n,
      subjectId: 3n,
      notes: "PHC principles, Alma Ata Declaration 1978, components of PHC.",
      videoUrl: "",
    },
    {
      id: 302n,
      title: "National Health Programs",
      order: 2n,
      subjectId: 3n,
      notes: "RNTCP, NVBDCP, NHM, ICDS — key programs in community health.",
      videoUrl: "",
    },
    {
      id: 303n,
      title: "Epidemiology Basics",
      order: 3n,
      subjectId: 3n,
      notes:
        "Disease causation, Agent-Host-Environment model, epidemic investigation.",
      videoUrl: "",
    },
  ],
  "4": [
    {
      id: 401n,
      title: "Antenatal Care",
      order: 1n,
      subjectId: 4n,
      notes: "ANC visits, danger signs in pregnancy, nutritional advice.",
      videoUrl: "",
    },
    {
      id: 402n,
      title: "Normal Labour & Delivery",
      order: 2n,
      subjectId: 4n,
      notes:
        "Stages of labour, mechanism of normal delivery, nursing management.",
      videoUrl: "",
    },
    {
      id: 403n,
      title: "Postnatal Care",
      order: 3n,
      subjectId: 4n,
      notes: "Puerperium, breastfeeding, postnatal complications.",
      videoUrl: "",
    },
  ],
  "5": [
    {
      id: 501n,
      title: "Growth & Development",
      order: 1n,
      subjectId: 5n,
      notes: "Milestones from birth to adolescence, developmental theories.",
      videoUrl: "",
    },
    {
      id: 502n,
      title: "Neonatal Nursing Care",
      order: 2n,
      subjectId: 5n,
      notes: "Care of newborn, APGAR score, neonatal conditions.",
      videoUrl: "",
    },
    {
      id: 503n,
      title: "Pediatric Diseases & Nursing",
      order: 3n,
      subjectId: 5n,
      notes: "Common childhood diseases, immunization schedule.",
      videoUrl: "",
    },
  ],
};

export default function SubjectPage() {
  const params = useParams({ from: "/subject/$subjectId" });
  const { subjectId } = params;
  const navigate = useNavigate();
  const subjectIdBig = BigInt(subjectId ?? "0");

  const { data: subjects } = useAllSubjects();
  const { data: topics, isLoading } = useTopicsBySubject(subjectIdBig);

  const subject = subjects?.find((s) => s.id === subjectIdBig);
  const displayTopics =
    topics && topics.length > 0
      ? topics
      : (SAMPLE_TOPICS[subjectId ?? ""] ?? []);

  return (
    <div className="page-enter min-h-dvh">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border">
        <div className="flex items-center gap-3 px-4 h-14">
          <button
            type="button"
            onClick={() => navigate({ to: "/" })}
            data-ocid="subject.back_button"
            aria-label="Go back"
            className="h-9 w-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-display font-bold text-base text-foreground truncate">
              {subject?.name ?? "Subject"}
            </h1>
            {subject?.description && (
              <p className="text-xs text-muted-foreground truncate">
                {subject.description}
              </p>
            )}
          </div>
          {subject?.iconEmoji && (
            <span className="text-2xl">{subject.iconEmoji}</span>
          )}
        </div>
      </header>

      <div className="px-4 pt-4">
        {/* Topic count banner */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-primary/8 border border-primary/20 rounded-xl p-3 mb-4 flex items-center gap-2"
        >
          <BookOpen size={16} className="text-primary flex-shrink-0" />
          <p className="text-sm text-foreground">
            <span className="font-semibold">{displayTopics.length} topics</span>
            <span className="text-muted-foreground"> available</span>
          </p>
        </motion.div>

        {/* Topics list */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : displayTopics.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen
              size={40}
              className="mx-auto text-muted-foreground/30 mb-3"
            />
            <p className="text-muted-foreground">No topics yet</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {displayTopics.map((topic, i) => (
              <motion.button
                key={topic.id.toString()}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: i * 0.04 }}
                whileTap={{ scale: 0.98 }}
                onClick={() =>
                  navigate({
                    to: "/topic/$subjectId/$topicId",
                    params: {
                      subjectId: subjectId,
                      topicId: topic.id.toString(),
                    },
                  })
                }
                data-ocid={`subject.topic_item.${i + 1}`}
                className="w-full text-left bg-card border border-border rounded-xl p-4 hover:bg-accent transition-all hover:shadow-xs"
              >
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 rounded-lg w-9 h-9 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-bold text-primary">
                      {i + 1}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground leading-snug">
                      {topic.title}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5">
                      {topic.videoUrl && (
                        <span className="flex items-center gap-1 text-xs text-primary">
                          <PlayCircle size={12} />
                          Video
                        </span>
                      )}
                      {topic.notes && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <FileText size={12} />
                          Notes
                        </span>
                      )}
                    </div>
                  </div>
                  <ArrowLeft
                    size={16}
                    className="text-muted-foreground rotate-180 flex-shrink-0 mt-1"
                  />
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
