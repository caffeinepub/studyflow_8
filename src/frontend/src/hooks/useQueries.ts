import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";

// ─── Sessions ──────────────────────────────────────────────────────────────

export function useGetDailySessions() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["daily-sessions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getDailySessions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveDailySession() {
  const { actor } = useActor();
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
      return actor.saveDailySession(
        date,
        studySeconds,
        breakSeconds,
        stopCount,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily-sessions"] });
    },
  });
}

// ─── Todos ─────────────────────────────────────────────────────────────────

export function useGetTodos() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["todos"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTodos();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddTodo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (text: string) => {
      if (!actor) throw new Error("No actor");
      return actor.addTodo(text);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
}

export function useToggleTodo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.toggleTodo(id);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["todos"] });
      const prev = queryClient.getQueryData(["todos"]);
      queryClient.setQueryData(
        ["todos"],
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
      if (ctx?.prev) queryClient.setQueryData(["todos"], ctx.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
}

export function useDeleteTodo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteTodo(id);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["todos"] });
      const prev = queryClient.getQueryData(["todos"]);
      queryClient.setQueryData(["todos"], (old: Array<{ id: bigint }> = []) =>
        old.filter((t) => t.id !== id),
      );
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["todos"], ctx.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
}
