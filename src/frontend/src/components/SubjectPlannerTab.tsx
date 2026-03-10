import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useSubjectPlanner } from "@/hooks/useSubjectPlanner";
import {
  BookOpen,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// Parse Excel paste: each line may be "topic\tdate" or just "topic"
function parseExcelPaste(raw: string): { text: string; date: string }[] {
  return raw
    .split("\n")
    .map((line) => {
      const parts = line.split("\t");
      const text = (parts[0] ?? "").trim();
      let date = (parts[1] ?? "").trim();
      if (date) {
        const parsed = new Date(date.replace(/\//g, "-"));
        if (!Number.isNaN(parsed.getTime())) {
          const y = parsed.getFullYear();
          const m = String(parsed.getMonth() + 1).padStart(2, "0");
          const d = String(parsed.getDate()).padStart(2, "0");
          date = `${y}-${m}-${d}`;
        } else {
          date = "";
        }
      }
      return { text, date };
    })
    .filter((r) => r.text.length > 0);
}

function formatDateDisplay(iso: string) {
  try {
    return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function SubjectCard({
  subject,
  topics,
  cardIndex,
  onDeleteSubject,
  onAddTopics,
  onToggleTopic,
  onDeleteTopic,
}: {
  subject: { id: string; name: string; createdAt: bigint };
  topics: {
    id: string;
    subjectId: string;
    text: string;
    completed: boolean;
    dueDate: [] | [string];
  }[];
  cardIndex: number;
  onDeleteSubject: (id: string) => void;
  onAddTopics: (
    subjectId: string,
    items: { text: string; date?: string }[],
  ) => void;
  onToggleTopic: (id: string) => void;
  onDeleteTopic: (id: string) => void;
}) {
  const [topicInput, setTopicInput] = useState("");
  const [globalDate, setGlobalDate] = useState("");
  const [collapsed, setCollapsed] = useState(false);

  const parsed = topicInput.trim() ? parseExcelPaste(topicInput) : [];
  const hasTabDates = parsed.some((r) => r.date);

  const completedCount = topics.filter((t) => t.completed).length;
  const totalCount = topics.length;
  const allDone = totalCount > 0 && completedCount === totalCount;

  const handleAddTopics = () => {
    if (parsed.length === 0) {
      toast.error("Please enter at least one topic");
      return;
    }
    const items = parsed.map((r) => ({
      text: r.text,
      date: r.date || globalDate || undefined,
    }));
    onAddTopics(subject.id, items);
    setTopicInput("");
    setGlobalDate("");
    toast.success(
      items.length === 1 ? "Topic added!" : `${items.length} topics added!`,
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleAddTopics();
    }
  };

  const gradients = [
    "linear-gradient(135deg, oklch(0.65 0.28 295), oklch(0.62 0.28 345))",
    "linear-gradient(135deg, oklch(0.6 0.24 210), oklch(0.58 0.22 180))",
    "linear-gradient(135deg, oklch(0.62 0.26 345), oklch(0.60 0.22 20))",
    "linear-gradient(135deg, oklch(0.55 0.22 155), oklch(0.58 0.2 180))",
    "linear-gradient(135deg, oklch(0.65 0.2 60), oklch(0.62 0.22 40))",
    "linear-gradient(135deg, oklch(0.6 0.26 305), oklch(0.58 0.24 280))",
  ];
  const gradient = gradients[cardIndex % gradients.length];

  const pillColors = [
    {
      bg: "oklch(0.92 0.06 295 / 0.9)",
      text: "oklch(0.38 0.22 295)",
      border: "oklch(0.78 0.12 295 / 0.6)",
    },
    {
      bg: "oklch(0.91 0.06 210 / 0.9)",
      text: "oklch(0.35 0.18 210)",
      border: "oklch(0.76 0.1 210 / 0.6)",
    },
    {
      bg: "oklch(0.92 0.06 345 / 0.9)",
      text: "oklch(0.4 0.2 345)",
      border: "oklch(0.78 0.12 345 / 0.6)",
    },
    {
      bg: "oklch(0.91 0.06 155 / 0.9)",
      text: "oklch(0.35 0.16 155)",
      border: "oklch(0.76 0.1 155 / 0.6)",
    },
    {
      bg: "oklch(0.93 0.06 60 / 0.9)",
      text: "oklch(0.38 0.18 60)",
      border: "oklch(0.78 0.1 60 / 0.6)",
    },
    {
      bg: "oklch(0.91 0.06 305 / 0.9)",
      text: "oklch(0.38 0.2 305)",
      border: "oklch(0.76 0.12 305 / 0.6)",
    },
  ];
  const pill = pillColors[cardIndex % pillColors.length];

  return (
    <div
      data-ocid={`subject.item.${cardIndex + 1}`}
      className="glass-card rounded-2xl overflow-hidden"
    >
      {/* Card header */}
      <div
        className="relative px-4 py-3 flex items-center justify-between"
        style={{ background: gradient }}
      >
        <div className="relative flex items-center gap-3 min-w-0">
          <BookOpen className="w-4 h-4 text-white shrink-0 opacity-90" />
          <h3
            className="font-bold text-white text-base truncate"
            title={subject.name}
          >
            {subject.name}
          </h3>
          <span
            className="shrink-0 text-xs font-semibold px-2.5 py-0.5 rounded-full"
            style={{
              background: allDone
                ? "oklch(0.4 0.15 155 / 0.8)"
                : "oklch(0 0 0 / 0.2)",
              color: "white",
              backdropFilter: "blur(8px)",
              border: "1px solid oklch(1 0 0 / 0.2)",
            }}
          >
            {completedCount} / {totalCount}
          </span>
        </div>
        <div className="relative flex items-center gap-1">
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "oklch(1 0 0 / 0.15)", color: "white" }}
            aria-label={collapsed ? "Expand subject" : "Collapse subject"}
          >
            {collapsed ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </button>
          <button
            type="button"
            data-ocid={`subject.delete_button.${cardIndex + 1}`}
            onClick={() => {
              onDeleteSubject(subject.id);
              toast.success("Subject removed");
            }}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-500/30"
            style={{ background: "oklch(1 0 0 / 0.15)", color: "white" }}
            aria-label="Delete subject"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Card body */}
      {!collapsed && (
        <div className="p-4 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Textarea
              data-ocid={`subject.topics_textarea.${cardIndex + 1}`}
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                "Paste from Excel:\n" +
                "\u2022 One column  \u2192  just topics\n" +
                "\u2022 Two columns \u2192  topic[TAB]date per row\n" +
                "Or type topics, one per line  (Ctrl+Enter to add)"
              }
              rows={4}
              className="resize-none text-sm border-border focus:border-primary/60 text-foreground placeholder:text-muted-foreground/70"
              style={{ background: "oklch(0.98 0.01 285)" }}
            />

            {/* Live preview when paste includes dates */}
            {parsed.length > 0 && hasTabDates && (
              <div
                className="rounded-xl p-3 flex flex-col gap-1.5"
                style={{
                  background: "oklch(0.95 0.03 285)",
                  border: "1px solid oklch(0.88 0.05 285 / 0.5)",
                }}
              >
                <p
                  className="text-[11px] font-semibold uppercase tracking-widest mb-1"
                  style={{ color: "oklch(0.5 0.06 285)" }}
                >
                  Preview ({parsed.length} topics detected)
                </p>
                {parsed.slice(0, 6).map((r) => (
                  <div
                    key={`${r.text}-${r.date}`}
                    className="flex items-center gap-2 text-xs"
                  >
                    <span className="flex-1 text-foreground truncate">
                      {r.text}
                    </span>
                    {r.date && (
                      <span
                        className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold"
                        style={{
                          background: pill.bg,
                          color: pill.text,
                          border: `1px solid ${pill.border}`,
                        }}
                      >
                        <CalendarDays className="w-3 h-3" />
                        {formatDateDisplay(r.date)}
                      </span>
                    )}
                  </div>
                ))}
                {parsed.length > 6 && (
                  <p
                    className="text-[11px]"
                    style={{ color: "oklch(0.55 0.06 285)" }}
                  >
                    +{parsed.length - 6} more
                  </p>
                )}
              </div>
            )}

            {/* Global due date — only when no per-row dates */}
            {!hasTabDates && (
              <div className="flex items-center gap-2">
                <Label
                  htmlFor={`due-date-${subject.id}`}
                  className="text-xs font-medium shrink-0 flex items-center gap-1.5"
                  style={{ color: "oklch(0.5 0.06 285)" }}
                >
                  <CalendarDays className="w-3.5 h-3.5" />
                  Due Date
                  <span className="font-normal opacity-60">
                    (optional, applies to all)
                  </span>
                </Label>
                <Input
                  id={`due-date-${subject.id}`}
                  data-ocid={`subject.topic_date_input.${cardIndex + 1}`}
                  type="date"
                  value={globalDate}
                  onChange={(e) => setGlobalDate(e.target.value)}
                  className="h-8 text-xs border-border focus:border-primary/60 text-foreground flex-1 max-w-[180px]"
                  style={{ background: "oklch(0.98 0.01 285)" }}
                />
                {globalDate && (
                  <button
                    type="button"
                    onClick={() => setGlobalDate("")}
                    className="text-xs px-2 py-1 rounded-lg"
                    style={{
                      color: "oklch(0.5 0.06 285)",
                      background: "oklch(0.93 0.02 285)",
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>
            )}

            <Button
              data-ocid={`subject.add_topics_button.${cardIndex + 1}`}
              onClick={handleAddTopics}
              disabled={parsed.length === 0}
              size="sm"
              className="self-end gap-2 font-semibold rounded-xl"
              style={{ background: gradient, color: "white", border: "none" }}
            >
              <Plus className="w-3.5 h-3.5" />
              Add {parsed.length > 1 ? `${parsed.length} Topics` : "Topic"}
            </Button>
          </div>

          {/* Topics list */}
          {topics.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <p
                className="text-[11px] font-semibold uppercase tracking-widest mb-1"
                style={{ color: "oklch(0.5 0.06 285)" }}
              >
                Topics ({totalCount})
              </p>
              {topics.map((topic, tIdx) => {
                const hasDueDate = topic.dueDate.length > 0 && topic.dueDate[0];
                const formattedDate = hasDueDate
                  ? formatDateDisplay(topic.dueDate[0] as string)
                  : null;
                return (
                  <div
                    key={topic.id}
                    data-ocid={`subject.topic_item.${cardIndex + 1}.${tIdx + 1}`}
                    className="flex items-start gap-3 rounded-xl px-3 py-2.5 group"
                    style={{
                      background: topic.completed
                        ? "oklch(0.97 0.01 285)"
                        : "oklch(0.99 0.005 285)",
                      border: "1px solid oklch(0.9 0.03 285 / 0.7)",
                    }}
                  >
                    <Checkbox
                      data-ocid={`subject.topic_checkbox.${cardIndex + 1}.${tIdx + 1}`}
                      checked={topic.completed}
                      onCheckedChange={() => onToggleTopic(topic.id)}
                      className="mt-0.5 border-primary/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary shrink-0"
                    />
                    <span
                      className={`flex-1 text-sm leading-relaxed break-words min-w-0 ${
                        topic.completed
                          ? "line-through text-muted-foreground"
                          : "text-foreground"
                      }`}
                    >
                      {topic.text}
                    </span>
                    {formattedDate && (
                      <span
                        className="shrink-0 inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          background: pill.bg,
                          color: pill.text,
                          border: `1px solid ${pill.border}`,
                        }}
                      >
                        <CalendarDays className="w-3 h-3" />
                        {formattedDate}
                      </span>
                    )}
                    <button
                      type="button"
                      data-ocid={`subject.topic_delete_button.${cardIndex + 1}.${tIdx + 1}`}
                      onClick={() => onDeleteTopic(topic.id)}
                      className="w-6 h-6 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      style={{ color: "oklch(0.55 0.22 25)" }}
                      aria-label="Delete topic"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {topics.length === 0 && (
            <p
              className="text-sm text-center py-2"
              style={{ color: "oklch(0.6 0.04 285)" }}
            >
              No topics yet — type or paste from Excel above
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function SubjectPlannerTab() {
  const [subjectName, setSubjectName] = useState("");
  const {
    subjects,
    topics,
    addSubject,
    deleteSubject,
    addTopics,
    toggleTopic,
    deleteTopic,
    isLoading,
  } = useSubjectPlanner();

  const handleAddSubject = () => {
    const name = subjectName.trim();
    if (!name) return;
    addSubject(name);
    setSubjectName("");
    toast.success("Subject added!");
  };

  const handleAddTopicsWithItems = (
    subjectId: string,
    items: { text: string; date?: string }[],
  ) => {
    // Group by date so each unique date is one backend call
    const byDate = new Map<string, string[]>();
    for (const item of items) {
      const key = item.date ?? "";
      if (!byDate.has(key)) byDate.set(key, []);
      byDate.get(key)!.push(item.text);
    }
    for (const [date, txts] of byDate) {
      addTopics(subjectId, txts, date || undefined);
    }
  };

  return (
    <div className="flex flex-col gap-6 py-6 px-4 max-w-3xl mx-auto w-full">
      <div className="flex flex-col gap-1">
        <h2
          className="text-xl font-bold tracking-tight"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.45 0.28 295), oklch(0.48 0.26 345))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Subject Planner
        </h2>
        <p className="text-sm text-muted-foreground">
          Organise your study subjects and track topics per subject
        </p>
      </div>

      {/* Add subject */}
      <div className="glass-card rounded-2xl p-4">
        <div className="flex gap-3">
          <Input
            data-ocid="subject.name_input"
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddSubject();
            }}
            placeholder="e.g. Mathematics, Physics, History..."
            className="flex-1 border-border focus:border-primary/60 text-foreground placeholder:text-muted-foreground"
            style={{ background: "oklch(0.98 0.01 285)" }}
          />
          <Button
            data-ocid="subject.add_button"
            onClick={handleAddSubject}
            disabled={!subjectName.trim()}
            className="gap-2 font-semibold shrink-0"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.65 0.28 295), oklch(0.62 0.28 345))",
              color: "white",
              border: "none",
            }}
          >
            <Plus className="w-4 h-4" />
            Add Subject
          </Button>
        </div>
      </div>

      {isLoading && (
        <div data-ocid="subject.loading_state" className="flex flex-col gap-3">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-16 rounded-2xl bg-card/50" />
          ))}
        </div>
      )}

      {!isLoading && subjects.length === 0 && (
        <div
          data-ocid="subject.empty_state"
          className="glass-card rounded-2xl p-12 text-center"
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.65 0.28 295 / 0.12), oklch(0.62 0.28 345 / 0.12))",
              border: "1px solid oklch(0.75 0.15 295 / 0.3)",
            }}
          >
            <BookOpen
              className="w-8 h-8"
              style={{ color: "oklch(0.55 0.28 295)" }}
            />
          </div>
          <p className="text-lg font-semibold text-foreground mb-2">
            No subjects yet
          </p>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            Add your first subject above, then paste topics from Excel. Copy two
            columns (topic + date) and each row becomes a topic with its own due
            date.
          </p>
        </div>
      )}

      {!isLoading && (
        <div className="flex flex-col gap-4">
          {subjects.map((subject, idx) => {
            const subjectTopics = topics.filter(
              (t) => t.subjectId === subject.id,
            );
            return (
              <SubjectCard
                key={subject.id}
                subject={subject}
                topics={subjectTopics}
                cardIndex={idx}
                onDeleteSubject={deleteSubject}
                onAddTopics={handleAddTopicsWithItems}
                onToggleTopic={toggleTopic}
                onDeleteTopic={deleteTopic}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
