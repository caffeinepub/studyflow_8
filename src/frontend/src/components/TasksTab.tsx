import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAddTodo,
  useDeleteTodo,
  useGetTodos,
  useToggleTodo,
} from "@/hooks/useQueries";
import {
  CheckCircle2,
  Circle,
  ClipboardList,
  Plus,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

export default function TasksTab() {
  const [newTask, setNewTask] = useState("");

  const { data: todos = [], isLoading } = useGetTodos();
  const { mutate: addTodo, isPending: isAdding } = useAddTodo();
  const { mutate: toggleTodo } = useToggleTodo();
  const { mutate: deleteTodo } = useDeleteTodo();

  const handleAdd = () => {
    const text = newTask.trim();
    if (!text) return;
    addTodo(text, {
      onSuccess: () => {
        setNewTask("");
        toast.success("Task added!");
      },
      onError: () => toast.error("Failed to add task"),
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAdd();
  };

  const pending = todos.filter((t) => !t.completed);
  const completed = todos.filter((t) => t.completed);
  const completionPct =
    todos.length > 0 ? Math.round((completed.length / todos.length) * 100) : 0;

  return (
    <div className="flex flex-col gap-6 py-6 px-4 max-w-2xl mx-auto w-full">
      {/* Task Stats Card */}
      {todos.length > 0 && (
        <motion.div
          data-ocid="todo.stats.card"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Task Progress
            </h3>
            <span
              className="text-sm font-bold"
              style={{
                background:
                  completionPct === 100
                    ? "linear-gradient(135deg, oklch(0.55 0.22 155), oklch(0.58 0.2 180))"
                    : "linear-gradient(135deg, oklch(0.5 0.28 295), oklch(0.52 0.26 345))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {completionPct}%
            </span>
          </div>

          {/* Progress bar */}
          <div
            className="h-2.5 rounded-full overflow-hidden mb-4"
            style={{ background: "oklch(0.92 0.03 285)" }}
          >
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${completionPct}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              style={{
                background:
                  completionPct === 100
                    ? "linear-gradient(90deg, oklch(0.55 0.22 155), oklch(0.7 0.2 155))"
                    : "linear-gradient(90deg, oklch(0.65 0.28 295), oklch(0.62 0.28 345))",
              }}
            />
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2">
            <div
              className="rounded-xl px-3 py-2 text-center"
              style={{ background: "oklch(0.96 0.02 285)" }}
            >
              <div
                className="text-lg font-bold font-mono"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.45 0.2 285), oklch(0.5 0.18 295))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {todos.length}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">
                Total
              </div>
            </div>

            <div
              className="rounded-xl px-3 py-2 text-center"
              style={{ background: "oklch(0.96 0.02 285)" }}
            >
              <div
                className="text-lg font-bold font-mono"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.55 0.22 155), oklch(0.58 0.2 180))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {completed.length}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">
                Done
              </div>
            </div>

            <div
              className="rounded-xl px-3 py-2 text-center"
              style={{ background: "oklch(0.96 0.02 285)" }}
            >
              <div
                className="text-lg font-bold font-mono"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.52 0.26 345), oklch(0.52 0.24 25))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {pending.length}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">
                Pending
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Add task */}
      <div className="glass-card rounded-2xl p-4">
        <div className="flex gap-3">
          <Input
            data-ocid="todo.input"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a new task..."
            className="flex-1 border-border focus:border-primary/60 text-foreground placeholder:text-muted-foreground"
            style={{ background: "oklch(0.98 0.01 285)" }}
          />
          <Button
            data-ocid="todo.add_button"
            onClick={handleAdd}
            disabled={isAdding || !newTask.trim()}
            className="gap-2 font-semibold"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.65 0.28 295), oklch(0.62 0.28 345))",
              color: "white",
              border: "none",
            }}
          >
            <Plus className="w-4 h-4" />
            Add
          </Button>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div data-ocid="todo.loading_state" className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 rounded-xl bg-card/50" />
          ))}
        </div>
      )}

      {/* Tasks list */}
      {!isLoading && todos.length === 0 && (
        <motion.div
          data-ocid="todo.empty_state"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-12 text-center"
        >
          <ClipboardList
            className="w-12 h-12 mx-auto mb-4"
            style={{ color: "oklch(0.6 0.12 295)" }}
          />
          <p className="text-lg font-semibold text-foreground mb-2">
            No tasks yet
          </p>
          <p className="text-sm text-muted-foreground">
            Add your first study task above
          </p>
        </motion.div>
      )}

      {!isLoading && pending.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
            <Circle className="w-3 h-3" />
            Pending ({pending.length})
          </h3>
          <div className="flex flex-col gap-2">
            <AnimatePresence>
              {pending.map((todo, index) => (
                <motion.div
                  key={String(todo.id)}
                  data-ocid={`todo.item.${index + 1}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="glass-card rounded-xl p-4 flex items-center gap-4 group"
                >
                  <Checkbox
                    data-ocid={`todo.checkbox.${index + 1}`}
                    checked={todo.completed}
                    onCheckedChange={() => toggleTodo(todo.id)}
                    className="border-primary/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <span className="flex-1 text-foreground">{todo.text}</span>
                  <Button
                    data-ocid={`todo.delete_button.${index + 1}`}
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      deleteTodo(todo.id, {
                        onError: () => toast.error("Failed to delete"),
                      })
                    }
                    className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {!isLoading && completed.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
            <CheckCircle2
              className="w-3 h-3"
              style={{ color: "oklch(0.7 0.2 155)" }}
            />
            Completed ({completed.length})
          </h3>
          <div className="flex flex-col gap-2">
            <AnimatePresence>
              {completed.map((todo, index) => (
                <motion.div
                  key={String(todo.id)}
                  data-ocid={`todo.item.${pending.length + index + 1}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  className="glass-card rounded-xl p-4 flex items-center gap-4 group opacity-60"
                >
                  <Checkbox
                    data-ocid={`todo.checkbox.${pending.length + index + 1}`}
                    checked={todo.completed}
                    onCheckedChange={() => toggleTodo(todo.id)}
                    className="border-primary/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <span className="flex-1 text-muted-foreground line-through">
                    {todo.text}
                  </span>
                  <Button
                    data-ocid={`todo.delete_button.${pending.length + index + 1}`}
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      deleteTodo(todo.id, {
                        onError: () => toast.error("Failed to delete"),
                      })
                    }
                    className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
