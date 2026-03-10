import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

// Helper: ensure user is registered before any write operation
async function ensureAndRun<T>(
  actor: import("../backend").backendInterface,
  fn: () => Promise<T>,
): Promise<T> {
  await actor.ensureUser();
  return fn();
}

// ─── Sessions ──────────────────────────────────────────────────────────────

export function useGetDailySessions() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principalKey = identity?.getPrincipal().toString() ?? "anon";
  return useQuery({
    queryKey: ["daily-sessions", principalKey],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getDailySessions();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useSaveDailySession() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const principalKey = identity?.getPrincipal().toString() ?? "anon";
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      date,
      studySeconds,
      breakSeconds,
      stopCount,
    }: {
      date: string;
      studySeconds: bigint;
      breakSeconds: bigint;
      stopCount: bigint;
    }) => {
      if (!actor) throw new Error("No actor");
      return ensureAndRun(actor, () =>
        actor.saveDailySession(date, studySeconds, breakSeconds, stopCount),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["daily-sessions", principalKey],
      });
    },
  });
}

// ─── Todos ─────────────────────────────────────────────────────────────────

export function useGetTodos() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principalKey = identity?.getPrincipal().toString() ?? "anon";
  return useQuery({
    queryKey: ["todos", principalKey],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTodos();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useAddTodo() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const principalKey = identity?.getPrincipal().toString() ?? "anon";
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (text: string) => {
      if (!actor) throw new Error("No actor");
      return ensureAndRun(actor, () => actor.addTodo(text));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos", principalKey] });
    },
  });
}

export function useToggleTodo() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const principalKey = identity?.getPrincipal().toString() ?? "anon";
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return ensureAndRun(actor, () => actor.toggleTodo(id));
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["todos", principalKey] });
      const prev = queryClient.getQueryData(["todos", principalKey]);
      queryClient.setQueryData(
        ["todos", principalKey],
        (
          old: Array<{
            id: bigint;
            completed: boolean;
            text: string;
            createdAt: bigint;
          }> = [],
        ) =>
          old.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
      );
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev)
        queryClient.setQueryData(["todos", principalKey], ctx.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["todos", principalKey] });
    },
  });
}

export function useDeleteTodo() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const principalKey = identity?.getPrincipal().toString() ?? "anon";
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return ensureAndRun(actor, () => actor.deleteTodo(id));
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["todos", principalKey] });
      const prev = queryClient.getQueryData(["todos", principalKey]);
      queryClient.setQueryData(
        ["todos", principalKey],
        (old: Array<{ id: bigint }> = []) => old.filter((t) => t.id !== id),
      );
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev)
        queryClient.setQueryData(["todos", principalKey], ctx.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["todos", principalKey] });
    },
  });
}

// ─── Subjects ──────────────────────────────────────────────────────────────

export function useGetSubjects() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principalKey = identity?.getPrincipal().toString() ?? "anon";
  return useQuery({
    queryKey: ["subjects", principalKey],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSubjects();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useGetTopics() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principalKey = identity?.getPrincipal().toString() ?? "anon";
  return useQuery({
    queryKey: ["topics", principalKey],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTopics();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useAddSubject() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const principalKey = identity?.getPrincipal().toString() ?? "anon";
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error("No actor");
      return ensureAndRun(actor, () => actor.addSubject(name));
    },
    onMutate: async (name) => {
      await queryClient.cancelQueries({ queryKey: ["subjects", principalKey] });
      const prev = queryClient.getQueryData(["subjects", principalKey]);
      const optimisticSubject = {
        id: `optimistic-${Date.now()}`,
        name,
        createdAt: BigInt(Date.now()) * BigInt(1_000_000),
      };
      queryClient.setQueryData(
        ["subjects", principalKey],
        (old: Array<{ id: string; name: string; createdAt: bigint }> = []) => [
          ...old,
          optimisticSubject,
        ],
      );
      return { prev };
    },
    onError: (_err, _name, ctx) => {
      if (ctx?.prev)
        queryClient.setQueryData(["subjects", principalKey], ctx.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects", principalKey] });
    },
  });
}

export function useDeleteSubject() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const principalKey = identity?.getPrincipal().toString() ?? "anon";
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("No actor");
      return ensureAndRun(actor, () => actor.deleteSubject(id));
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["subjects", principalKey] });
      await queryClient.cancelQueries({ queryKey: ["topics", principalKey] });
      const prevSubjects = queryClient.getQueryData(["subjects", principalKey]);
      const prevTopics = queryClient.getQueryData(["topics", principalKey]);
      queryClient.setQueryData(
        ["subjects", principalKey],
        (old: Array<{ id: string }> = []) => old.filter((s) => s.id !== id),
      );
      queryClient.setQueryData(
        ["topics", principalKey],
        (old: Array<{ subjectId: string }> = []) =>
          old.filter((t) => t.subjectId !== id),
      );
      return { prevSubjects, prevTopics };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prevSubjects)
        queryClient.setQueryData(["subjects", principalKey], ctx.prevSubjects);
      if (ctx?.prevTopics)
        queryClient.setQueryData(["topics", principalKey], ctx.prevTopics);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects", principalKey] });
      queryClient.invalidateQueries({ queryKey: ["topics", principalKey] });
    },
  });
}

export function useAddTopics() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const principalKey = identity?.getPrincipal().toString() ?? "anon";
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      subjectId,
      texts,
      dueDate,
    }: {
      subjectId: string;
      texts: string[];
      dueDate?: string;
    }) => {
      if (!actor) throw new Error("No actor");
      const topicInputs = texts.map((text) => ({
        text,
        dueDate: dueDate ? ([dueDate] as [string]) : ([] as []),
      }));
      return ensureAndRun(actor, () =>
        (actor as any).addTopics(subjectId, topicInputs),
      );
    },
    onMutate: async ({ subjectId, texts, dueDate }) => {
      await queryClient.cancelQueries({ queryKey: ["topics", principalKey] });
      const prev = queryClient.getQueryData(["topics", principalKey]);
      const now = Date.now();
      const optimisticTopics = texts.map((text, i) => ({
        id: `optimistic-${now}-${i}`,
        subjectId,
        text,
        completed: false,
        createdAt: BigInt(now + i) * BigInt(1_000_000),
        dueDate: dueDate ? ([dueDate] as [string]) : ([] as []),
      }));
      queryClient.setQueryData(
        ["topics", principalKey],
        (
          old: Array<{
            id: string;
            subjectId: string;
            text: string;
            completed: boolean;
            createdAt: bigint;
            dueDate: [] | [string];
          }> = [],
        ) => [...old, ...optimisticTopics],
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev)
        queryClient.setQueryData(["topics", principalKey], ctx.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["topics", principalKey] });
    },
  });
}

export function useToggleTopic() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const principalKey = identity?.getPrincipal().toString() ?? "anon";
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("No actor");
      return ensureAndRun(actor, () => actor.toggleTopic(id));
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["topics", principalKey] });
      const prev = queryClient.getQueryData(["topics", principalKey]);
      queryClient.setQueryData(
        ["topics", principalKey],
        (old: Array<{ id: string; completed: boolean }> = []) =>
          old.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
      );
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev)
        queryClient.setQueryData(["topics", principalKey], ctx.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["topics", principalKey] });
    },
  });
}

export function useDeleteTopic() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const principalKey = identity?.getPrincipal().toString() ?? "anon";
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("No actor");
      return ensureAndRun(actor, () => actor.deleteTopic(id));
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["topics", principalKey] });
      const prev = queryClient.getQueryData(["topics", principalKey]);
      queryClient.setQueryData(
        ["topics", principalKey],
        (old: Array<{ id: string }> = []) => old.filter((t) => t.id !== id),
      );
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev)
        queryClient.setQueryData(["topics", principalKey], ctx.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["topics", principalKey] });
    },
  });
}
