import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useSubjectPlanner } from "@/hooks/useSubjectPlanner";
import { BookOpen, ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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
  }[];
  cardIndex: number;
  onDeleteSubject: (id: string) => void;
  onAddTopics: (
    subjectId: string,
    texts: string[],
    onSuccess: () => void,
    onError: (savedTexts: string[]) => void,
  ) => void;
  onToggleTopic: (id: string) => void;
  onDeleteTopic: (
    id: string,
    onSuccess: () => void,
    onError: () => void,
  ) => void;
}) {
  const [topicInput, setTopicInput] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const lines = topicInput
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const completedCount = topics.filter((t) => t.completed).length;
  const totalCount = topics.length;
  const allDone = totalCount > 0 && completedCount === totalCount;

  const handleAddTopics = () => {
    if (lines.length === 0) {
      toast.error("Please enter at least one topic");
      return;
    }
    setIsAdding(true);
    const savedTexts = [...lines];
    setTopicInput("");
    onAddTopics(
      subject.id,
      savedTexts,
      () => {
        setIsAdding(false);
        toast.success(
          savedTexts.length === 1
            ? "Topic added!"
            : `${savedTexts.length} topics added!`,
        );
      },
      (originalTexts) => {
        setIsAdding(false);
        setTopicInput(originalTexts.join("\n"));
        toast.error("Failed to add topic. Please try again.");
      },
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
            onClick={() => onDeleteSubject(subject.id)}
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
                "Type topics, one per line\n" +
                "Or paste from Excel — each row becomes a topic\n" +
                "(Ctrl+Enter to add)"
              }
              rows={4}
              className="resize-none text-sm border-border focus:border-primary/60 text-foreground placeholder:text-muted-foreground/70"
              style={{ background: "oklch(0.98 0.01 285)" }}
            />

            <Button
              data-ocid={`subject.add_topics_button.${cardIndex + 1}`}
              onClick={handleAddTopics}
              disabled={lines.length === 0 || isAdding}
              size="sm"
              className="self-end gap-2 font-semibold rounded-xl"
              style={{ background: gradient, color: "white", border: "none" }}
            >
              <Plus className="w-3.5 h-3.5" />
              {isAdding
                ? "Adding..."
                : `Add ${lines.length > 1 ? `${lines.length} Topics` : "Topic"}`}
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
              {topics.map((topic, tIdx) => (
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
                  <button
                    type="button"
                    data-ocid={`subject.topic_delete_button.${cardIndex + 1}.${tIdx + 1}`}
                    onClick={() =>
                      onDeleteTopic(
                        topic.id,
                        () => toast.success("Topic removed"),
                        () => toast.error("Failed to remove topic"),
                      )
                    }
                    className="w-6 h-6 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    style={{ color: "oklch(0.55 0.22 25)" }}
                    aria-label="Delete topic"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
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

  const handleDeleteSubject = (id: string) => {
    deleteSubject(
      id,
      () => toast.success("Subject removed"),
      () => toast.error("Failed to remove subject"),
    );
  };

  const handleAddTopics = (
    subjectId: string,
    texts: string[],
    onSuccess: () => void,
    onError: (savedTexts: string[]) => void,
  ) => {
    addTopics(subjectId, texts, onSuccess, () => onError(texts));
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
            Add your first subject above, then type or paste topics from Excel.
            Each row becomes a separate topic.
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
                onDeleteSubject={handleDeleteSubject}
                onAddTopics={handleAddTopics}
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
