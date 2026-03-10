import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useSubjectPlanner } from "@/hooks/useSubjectPlanner";
import { BookOpen, ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

// Per-card state: textarea value + collapsed toggle
function SubjectCard({
  subject,
  topics,
  cardIndex,
  topicStartIndex,
  onDeleteSubject,
  onAddTopics,
  onToggleTopic,
  onDeleteTopic,
}: {
  subject: { id: string; name: string; createdAt: bigint };
  topics: { id: string; subjectId: string; text: string; completed: boolean }[];
  cardIndex: number;
  topicStartIndex: number;
  onDeleteSubject: (id: string) => void;
  onAddTopics: (subjectId: string, texts: string[]) => void;
  onToggleTopic: (id: string) => void;
  onDeleteTopic: (id: string) => void;
}) {
  const [topicInput, setTopicInput] = useState("");
  const [collapsed, setCollapsed] = useState(false);

  const completedCount = topics.filter((t) => t.completed).length;
  const totalCount = topics.length;
  const allDone = totalCount > 0 && completedCount === totalCount;

  const handleAddTopics = () => {
    const lines = topicInput.split("\n");
    const filtered = lines.map((l) => l.trim()).filter(Boolean);
    if (filtered.length === 0) {
      toast.error("Please enter at least one topic");
      return;
    }
    onAddTopics(subject.id, filtered);
    setTopicInput("");
    toast.success(
      filtered.length === 1
        ? "Topic added!"
        : `${filtered.length} topics added!`,
    );
  };

  const handleTextareaKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    // Ctrl/Cmd + Enter to add
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleAddTopics();
    }
  };

  // Subject color based on index for variety
  const gradients = [
    "linear-gradient(135deg, oklch(0.65 0.28 295), oklch(0.62 0.28 345))",
    "linear-gradient(135deg, oklch(0.6 0.24 210), oklch(0.58 0.22 180))",
    "linear-gradient(135deg, oklch(0.62 0.26 345), oklch(0.60 0.22 20))",
    "linear-gradient(135deg, oklch(0.55 0.22 155), oklch(0.58 0.2 180))",
    "linear-gradient(135deg, oklch(0.65 0.2 60), oklch(0.62 0.22 40))",
    "linear-gradient(135deg, oklch(0.6 0.26 305), oklch(0.58 0.24 280))",
  ];
  const gradient = gradients[cardIndex % gradients.length];

  return (
    <motion.div
      data-ocid={`subject.item.${cardIndex + 1}`}
      layout
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.97, height: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="glass-card rounded-2xl overflow-hidden"
    >
      {/* Card header */}
      <div
        className="relative px-4 py-3 flex items-center justify-between"
        style={{ background: gradient }}
      >
        {/* Subtle noise texture */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
            pointerEvents: "none",
          }}
        />
        <div className="relative flex items-center gap-3 min-w-0">
          <BookOpen className="w-4 h-4 text-white shrink-0 opacity-90" />
          <h3
            className="font-bold text-white text-base truncate"
            title={subject.name}
          >
            {subject.name}
          </h3>
          {/* Progress badge */}
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
          {/* Collapse toggle */}
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
            style={{
              background: "oklch(1 0 0 / 0.15)",
              color: "white",
            }}
            aria-label={collapsed ? "Expand subject" : "Collapse subject"}
          >
            {collapsed ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </button>
          {/* Delete subject */}
          <button
            type="button"
            data-ocid={`subject.delete_button.${cardIndex + 1}`}
            onClick={() => {
              onDeleteSubject(subject.id);
              toast.success("Subject removed");
            }}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-red-500/30"
            style={{
              background: "oklch(1 0 0 / 0.15)",
              color: "white",
            }}
            aria-label="Delete subject"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Card body */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div className="p-4 flex flex-col gap-4">
              {/* Add topics textarea */}
              <div className="flex flex-col gap-2">
                <Textarea
                  data-ocid={`subject.topics_textarea.${cardIndex + 1}`}
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  onKeyDown={handleTextareaKeyDown}
                  placeholder={
                    "Add topics... paste multiple lines from Excel, each line = one topic\n(Ctrl+Enter to add)"
                  }
                  rows={3}
                  className="resize-none text-sm border-border focus:border-primary/60 text-foreground placeholder:text-muted-foreground/70"
                  style={{ background: "oklch(0.98 0.01 285)" }}
                />
                <Button
                  data-ocid={`subject.add_topics_button.${cardIndex + 1}`}
                  onClick={handleAddTopics}
                  disabled={!topicInput.trim()}
                  size="sm"
                  className="self-end gap-2 font-semibold rounded-xl"
                  style={{
                    background: gradient,
                    color: "white",
                    border: "none",
                  }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Topics
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
                  <AnimatePresence>
                    {topics.map((topic, tIdx) => {
                      const overallIdx = topicStartIndex + tIdx + 1;
                      return (
                        <motion.div
                          key={topic.id}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 12, height: 0 }}
                          transition={{ duration: 0.18 }}
                          className="flex items-start gap-3 rounded-xl px-3 py-2.5 group transition-colors"
                          style={{
                            background: topic.completed
                              ? "oklch(0.97 0.01 285)"
                              : "oklch(0.99 0.005 285)",
                            border: "1px solid oklch(0.9 0.03 285 / 0.7)",
                          }}
                        >
                          <Checkbox
                            data-ocid={`subject.topic_checkbox.${overallIdx}`}
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
                          <button
                            type="button"
                            data-ocid={`subject.topic_delete_button.${overallIdx}`}
                            onClick={() => {
                              onDeleteTopic(topic.id);
                            }}
                            className="w-6 h-6 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                            style={{
                              color: "oklch(0.55 0.22 25)",
                            }}
                            aria-label="Delete topic"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}

              {/* No topics yet hint */}
              {topics.length === 0 && (
                <p
                  className="text-sm text-center py-2"
                  style={{ color: "oklch(0.6 0.04 285)" }}
                >
                  No topics yet — paste from Excel or type above
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAddSubject();
  };

  // Pre-compute the starting topic index per subject card for deterministic ocid markers
  const topicStartIndexes = subjects.map((_, idx) => {
    let count = 0;
    for (let i = 0; i < idx; i++) {
      count += topics.filter((t) => t.subjectId === subjects[i].id).length;
    }
    return count;
  });

  return (
    <div className="flex flex-col gap-6 py-6 px-4 max-w-3xl mx-auto w-full">
      {/* Page heading */}
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
            onKeyDown={handleKeyDown}
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

      {/* Loading state */}
      {isLoading && (
        <div data-ocid="subject.loading_state" className="flex flex-col gap-3">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-16 rounded-2xl bg-card/50" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && subjects.length === 0 && (
        <motion.div
          data-ocid="subject.empty_state"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
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
            Add your first subject above, then paste topics from Excel — each
            line becomes a separate topic automatically.
          </p>
        </motion.div>
      )}

      {/* Subject cards */}
      {!isLoading && (
        <div className="flex flex-col gap-4">
          <AnimatePresence>
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
                  topicStartIndex={topicStartIndexes[idx]}
                  onDeleteSubject={deleteSubject}
                  onAddTopics={addTopics}
                  onToggleTopic={toggleTopic}
                  onDeleteTopic={deleteTopic}
                />
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
