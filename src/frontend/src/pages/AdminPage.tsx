import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Check, Loader2, Pencil, Plus, Shield, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Subject, Topic } from "../backend.d";
import AppHeader from "../components/AppHeader";
import {
  useAllSubjects,
  useCreateSubject,
  useCreateTopic,
  useDeleteSubject,
  useDeleteTopic,
  useIsAdmin,
  useTopicsBySubject,
  useUpdateSubject,
  useUpdateTopic,
} from "../hooks/useQueries";

const COLOR_OPTIONS = ["teal", "mint", "sky", "rose", "violet", "amber"];

// ── Subject Form ──────────────────────────────────────────────────────────────
interface SubjectFormData {
  name: string;
  description: string;
  iconEmoji: string;
  colorTag: string;
  order: string;
}

const EMPTY_SUBJECT_FORM: SubjectFormData = {
  name: "",
  description: "",
  iconEmoji: "📚",
  colorTag: "teal",
  order: "1",
};

function SubjectFormDialog({
  open,
  onClose,
  editSubject,
  nextOrder,
}: {
  open: boolean;
  onClose: () => void;
  editSubject: Subject | null;
  nextOrder: number;
}) {
  const createSubject = useCreateSubject();
  const updateSubject = useUpdateSubject();
  const isEdit = !!editSubject;

  const [form, setForm] = useState<SubjectFormData>(
    editSubject
      ? {
          name: editSubject.name,
          description: editSubject.description,
          iconEmoji: editSubject.iconEmoji,
          colorTag: editSubject.colorTag,
          order: String(editSubject.order),
        }
      : { ...EMPTY_SUBJECT_FORM, order: String(nextOrder) },
  );

  const isPending = createSubject.isPending || updateSubject.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Subject name is required");
      return;
    }
    try {
      const subject: Subject = {
        id: editSubject?.id ?? BigInt(Date.now()),
        name: form.name.trim(),
        description: form.description.trim(),
        iconEmoji: form.iconEmoji,
        colorTag: form.colorTag,
        order: BigInt(Number.parseInt(form.order) || nextOrder),
      };

      if (isEdit) {
        await updateSubject.mutateAsync(subject);
        toast.success("Subject updated");
      } else {
        await createSubject.mutateAsync(subject);
        toast.success("Subject added");
      }
      onClose();
    } catch {
      toast.error("Failed to save subject");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm mx-4 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display">
            {isEdit ? "Edit Subject" : "Add New Subject"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="sub-name">Subject Name *</Label>
            <Input
              id="sub-name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Pediatric Nursing"
              data-ocid="admin.subject_name_input"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sub-desc">Description</Label>
            <Input
              id="sub-desc"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="Brief description"
              data-ocid="admin.subject_desc_input"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="sub-emoji">Emoji Icon</Label>
              <Input
                id="sub-emoji"
                value={form.iconEmoji}
                onChange={(e) =>
                  setForm((f) => ({ ...f, iconEmoji: e.target.value }))
                }
                placeholder="📚"
                data-ocid="admin.subject_emoji_input"
                className="text-2xl text-center"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Color</Label>
              <Select
                value={form.colorTag}
                onValueChange={(v) => setForm((f) => ({ ...f, colorTag: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COLOR_OPTIONS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sub-order">Display Order</Label>
            <Input
              id="sub-order"
              type="number"
              value={form.order}
              onChange={(e) =>
                setForm((f) => ({ ...f, order: e.target.value }))
              }
              min="1"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              data-ocid="admin.subject_submit_button"
              className="flex-1"
            >
              {isPending ? (
                <Loader2 size={15} className="animate-spin mr-2" />
              ) : (
                <Check size={15} className="mr-2" />
              )}
              {isEdit ? "Save" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Subject Manager ───────────────────────────────────────────────────────────
function SubjectManager() {
  const { data: subjects = [], isLoading } = useAllSubjects();
  const deleteSubject = useDeleteSubject();
  const [formOpen, setFormOpen] = useState(false);
  const [editSubject, setEditSubject] = useState<Subject | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Subject | null>(null);

  const handleEdit = (subject: Subject) => {
    setEditSubject(subject);
    setFormOpen(true);
  };

  const handleAdd = () => {
    setEditSubject(null);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteSubject.mutateAsync(deleteTarget.id);
      toast.success("Subject deleted");
    } catch {
      toast.error("Failed to delete subject");
    }
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {subjects.length} subject{subjects.length !== 1 ? "s" : ""}
        </p>
        <Button
          size="sm"
          onClick={handleAdd}
          data-ocid="admin.add_subject_button"
          className="h-9 rounded-xl"
        >
          <Plus size={15} className="mr-1.5" />
          Add Subject
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : subjects.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <p className="text-sm">No subjects yet. Add your first subject!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {subjects.map((subject, i) => (
            <div
              key={subject.id.toString()}
              data-ocid={`admin.subject_item.${i + 1}`}
              className="bg-card border border-border rounded-xl p-3.5 flex items-center gap-3"
            >
              <span className="text-xl">{subject.iconEmoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground truncate">
                  {subject.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  Order: {subject.order.toString()} · {subject.colorTag}
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => handleEdit(subject)}
                  data-ocid={`admin.edit_subject_button.${i + 1}`}
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  <Pencil size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(subject)}
                  data-ocid={`admin.delete_subject_button.${i + 1}`}
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Subject form dialog */}
      <SubjectFormDialog
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditSubject(null);
        }}
        editSubject={editSubject}
        nextOrder={subjects.length + 1}
      />

      {/* Delete confirm */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent className="rounded-2xl mx-4">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete subject?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{deleteTarget?.name}" and all its
              topics. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ── Topic Form ────────────────────────────────────────────────────────────────
interface TopicFormData {
  title: string;
  videoUrl: string;
  notes: string;
  order: string;
}

const EMPTY_TOPIC_FORM: TopicFormData = {
  title: "",
  videoUrl: "",
  notes: "",
  order: "1",
};

function TopicFormDialog({
  open,
  onClose,
  editTopic,
  subjectId,
  nextOrder,
}: {
  open: boolean;
  onClose: () => void;
  editTopic: Topic | null;
  subjectId: bigint;
  nextOrder: number;
}) {
  const createTopic = useCreateTopic();
  const updateTopic = useUpdateTopic();
  const isEdit = !!editTopic;

  const [form, setForm] = useState<TopicFormData>(
    editTopic
      ? {
          title: editTopic.title,
          videoUrl: editTopic.videoUrl,
          notes: editTopic.notes,
          order: String(editTopic.order),
        }
      : { ...EMPTY_TOPIC_FORM, order: String(nextOrder) },
  );

  const isPending = createTopic.isPending || updateTopic.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Topic title is required");
      return;
    }
    try {
      const topic: Topic = {
        id: editTopic?.id ?? BigInt(Date.now()),
        title: form.title.trim(),
        videoUrl: form.videoUrl.trim(),
        notes: form.notes.trim(),
        subjectId,
        order: BigInt(Number.parseInt(form.order) || nextOrder),
      };

      if (isEdit) {
        await updateTopic.mutateAsync(topic);
        toast.success("Topic updated");
      } else {
        await createTopic.mutateAsync(topic);
        toast.success("Topic added");
      }
      onClose();
    } catch {
      toast.error("Failed to save topic");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm mx-4 rounded-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">
            {isEdit ? "Edit Topic" : "Add New Topic"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="topic-title">Topic Title *</Label>
            <Input
              id="topic-title"
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              placeholder="e.g. Vital Signs Measurement"
              data-ocid="admin.topic_title_input"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="topic-video">Video URL</Label>
            <Input
              id="topic-video"
              value={form.videoUrl}
              onChange={(e) =>
                setForm((f) => ({ ...f, videoUrl: e.target.value }))
              }
              placeholder="YouTube or direct video URL"
              data-ocid="admin.topic_video_input"
              type="url"
            />
            <p className="text-xs text-muted-foreground">
              Supports YouTube links and direct video files
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="topic-notes">Study Notes</Label>
            <Textarea
              id="topic-notes"
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
              placeholder="Enter study notes, key points..."
              data-ocid="admin.topic_notes_input"
              rows={5}
              className="resize-none"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="topic-order">Display Order</Label>
            <Input
              id="topic-order"
              type="number"
              value={form.order}
              onChange={(e) =>
                setForm((f) => ({ ...f, order: e.target.value }))
              }
              min="1"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              data-ocid="admin.topic_submit_button"
              className="flex-1"
            >
              {isPending ? (
                <Loader2 size={15} className="animate-spin mr-2" />
              ) : (
                <Check size={15} className="mr-2" />
              )}
              {isEdit ? "Save" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Topic Manager ─────────────────────────────────────────────────────────────
function TopicManager() {
  const { data: subjects = [] } = useAllSubjects();
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    subjects[0]?.id.toString() ?? "",
  );
  const subjectIdBig = BigInt(selectedSubjectId || "0");
  const { data: topics = [], isLoading } = useTopicsBySubject(subjectIdBig);
  const deleteTopic = useDeleteTopic();
  const [formOpen, setFormOpen] = useState(false);
  const [editTopic, setEditTopic] = useState<Topic | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Topic | null>(null);

  const _currentSubject = subjects.find(
    (s) => s.id.toString() === selectedSubjectId,
  );

  const handleEdit = (topic: Topic) => {
    setEditTopic(topic);
    setFormOpen(true);
  };

  const handleAdd = () => {
    setEditTopic(null);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteTopic.mutateAsync({
        id: deleteTarget.id,
        subjectId: deleteTarget.subjectId,
      });
      toast.success("Topic deleted");
    } catch {
      toast.error("Failed to delete topic");
    }
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-3">
      {/* Subject selector */}
      <div className="space-y-1.5">
        <Label>Select Subject</Label>
        <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose a subject..." />
          </SelectTrigger>
          <SelectContent>
            {subjects.map((s) => (
              <SelectItem key={s.id.toString()} value={s.id.toString()}>
                {s.iconEmoji} {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedSubjectId && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {topics.length} topic{topics.length !== 1 ? "s" : ""}
            </p>
            <Button
              size="sm"
              onClick={handleAdd}
              disabled={!selectedSubjectId}
              data-ocid="admin.add_topic_button"
              className="h-9 rounded-xl"
            >
              <Plus size={15} className="mr-1.5" />
              Add Topic
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
          ) : topics.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <p className="text-sm">No topics for this subject yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {topics.map((topic, i) => (
                <div
                  key={topic.id.toString()}
                  data-ocid={`admin.topic_item.${i + 1}`}
                  className="bg-card border border-border rounded-xl p-3.5 flex items-center gap-3"
                >
                  <div className="bg-primary/10 rounded-lg w-8 h-8 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary">
                      {i + 1}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate">
                      {topic.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {topic.videoUrl ? "▶ Video · " : ""}
                      {topic.notes ? "📝 Notes" : "No notes"}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => handleEdit(topic)}
                      data-ocid={`admin.edit_topic_button.${i + 1}`}
                      className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(topic)}
                      data-ocid={`admin.delete_topic_button.${i + 1}`}
                      className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Topic form dialog */}
      <TopicFormDialog
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditTopic(null);
        }}
        editTopic={editTopic}
        subjectId={subjectIdBig}
        nextOrder={topics.length + 1}
      />

      {/* Delete confirm */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent className="rounded-2xl mx-4">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete topic?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{deleteTarget?.title}". This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ── Main Admin Page ───────────────────────────────────────────────────────────
export default function AdminPage() {
  const { data: isAdmin, isLoading } = useIsAdmin();

  if (isLoading) {
    return (
      <div className="page-enter">
        <AppHeader title="Admin Panel" />
        <div className="px-4 pt-8 space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="page-enter">
        <AppHeader title="Admin Panel" />
        <div className="flex flex-col items-center justify-center py-20 text-center px-6">
          <div className="bg-muted rounded-full p-5 mb-4">
            <Shield size={36} className="text-muted-foreground" />
          </div>
          <p className="font-display font-bold text-lg text-foreground mb-2">
            Admin Access Required
          </p>
          <p className="text-sm text-muted-foreground max-w-xs">
            You need admin privileges to access this panel. Please login with an
            admin account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter">
      <AppHeader title="Admin Panel" subtitle="Manage subjects and topics" />

      <div className="px-4 pt-4">
        {/* Admin badge */}
        <div className="flex items-center gap-2 bg-primary/8 border border-primary/20 rounded-xl p-3 mb-4">
          <Shield size={15} className="text-primary" />
          <p className="text-xs font-medium text-primary">Admin Mode Active</p>
        </div>

        <Tabs defaultValue="subjects">
          <TabsList className="grid grid-cols-2 w-full mb-4">
            <TabsTrigger
              value="subjects"
              data-ocid="admin.subjects_tab"
              className="font-medium"
            >
              Subjects
            </TabsTrigger>
            <TabsTrigger
              value="topics"
              data-ocid="admin.topics_tab"
              className="font-medium"
            >
              Topics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="subjects">
            <SubjectManager />
          </TabsContent>

          <TabsContent value="topics">
            <TopicManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
