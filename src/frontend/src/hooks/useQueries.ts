import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Subject, Topic, UserRole } from "../backend.d";
import { useActor } from "./useActor";

// ── Subjects ──────────────────────────────────────────────────────────────────
export function useAllSubjects() {
  const { actor, isFetching } = useActor();
  return useQuery<Subject[]>({
    queryKey: ["subjects"],
    queryFn: async () => {
      if (!actor) return [];
      const subjects = await actor.getAllSubjects();
      return [...subjects].sort((a, b) => Number(a.order) - Number(b.order));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTopicsBySubject(subjectId: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<Topic[]>({
    queryKey: ["topics", subjectId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      const topics = await actor.getTopicsBySubject(subjectId);
      return [...topics].sort((a, b) => Number(a.order) - Number(b.order));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSearchTopics(keyword: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Topic[]>({
    queryKey: ["search", keyword],
    queryFn: async () => {
      if (!actor || !keyword.trim()) return [];
      return actor.searchTopicsByKeyword(keyword.trim());
    },
    enabled: !!actor && !isFetching && keyword.trim().length > 1,
  });
}

// ── Bookmarks ─────────────────────────────────────────────────────────────────
export function useBookmarks() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["bookmarks"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getBookmarks();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddBookmark() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (topicId: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.addBookmark(topicId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bookmarks"] }),
  });
}

export function useRemoveBookmark() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (topicId: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.removeBookmark(topicId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bookmarks"] }),
  });
}

// ── Recently Watched ──────────────────────────────────────────────────────────
export function useRecentlyWatched() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["recently-watched"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getRecentlyWatched();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRecordRecentlyWatched() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      topicId,
      position,
    }: {
      topicId: bigint;
      position: bigint;
    }) => {
      if (!actor) return;
      return actor.recordRecentlyWatched(topicId, position);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["recently-watched"] }),
  });
}

// ── Admin / Role ──────────────────────────────────────────────────────────────
export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["is-admin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCallerRole() {
  const { actor, isFetching } = useActor();
  return useQuery<UserRole>({
    queryKey: ["caller-role"],
    queryFn: async () => {
      if (!actor) return "guest" as UserRole;
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

// ── Subject CRUD ──────────────────────────────────────────────────────────────
export function useCreateSubject() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (subject: Subject) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.createSubject(subject);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["subjects"] }),
  });
}

export function useUpdateSubject() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (subject: Subject) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.updateSubject(subject);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["subjects"] }),
  });
}

export function useDeleteSubject() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.deleteSubject(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["subjects"] }),
  });
}

// ── Topic CRUD ────────────────────────────────────────────────────────────────
export function useCreateTopic() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (topic: Topic) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.createTopic(topic);
    },
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({ queryKey: ["topics", vars.subjectId.toString()] }),
  });
}

export function useUpdateTopic() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (topic: Topic) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.updateTopic(topic);
    },
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({ queryKey: ["topics", vars.subjectId.toString()] }),
  });
}

export function useDeleteTopic() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      subjectId: _subjectId,
    }: {
      id: bigint;
      subjectId: bigint;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.deleteTopic(id);
    },
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({ queryKey: ["topics", vars.subjectId.toString()] }),
  });
}
