import { Toaster } from "@/components/ui/sonner";
import { BarChart3, ListTodo, Quote, Sparkles, Timer } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import ReportsTab from "./components/ReportsTab";
import TasksTab from "./components/TasksTab";
import TimerTab from "./components/TimerTab";
import { getDailyQuote } from "./data/quotes";

type Tab = "timer" | "tasks" | "reports";

const TABS: { key: Tab; label: string; icon: typeof Timer; ocid: string }[] = [
  { key: "timer", label: "Timer", icon: Timer, ocid: "nav.timer.tab" },
  { key: "tasks", label: "Tasks", icon: ListTodo, ocid: "nav.tasks.tab" },
  {
    key: "reports",
    label: "Reports",
    icon: BarChart3,
    ocid: "nav.reports.tab",
  },
];

const TAB_COMPONENTS: Record<Tab, React.ComponentType> = {
  timer: TimerTab,
  tasks: TasksTab,
  reports: ReportsTab,
};

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("timer");
  const dailyQuote = getDailyQuote();

  const ActiveComponent = TAB_COMPONENTS[activeTab];

  return (
    <div
      className="min-h-dvh flex flex-col"
      style={{
        background:
          "radial-gradient(ellipse at top left, oklch(0.14 0.06 295) 0%, oklch(0.1 0.02 285) 50%, oklch(0.08 0.04 340) 100%)",
      }}
    >
      {/* Ambient background blobs */}
      <div
        aria-hidden
        className="fixed inset-0 pointer-events-none overflow-hidden"
        style={{ zIndex: 0 }}
      >
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: "oklch(0.65 0.28 295)" }}
        />
        <div
          className="absolute top-1/2 -right-32 w-80 h-80 rounded-full opacity-15 blur-3xl"
          style={{ background: "oklch(0.62 0.28 345)" }}
        />
        <div
          className="absolute -bottom-20 left-1/3 w-72 h-72 rounded-full opacity-10 blur-3xl"
          style={{ background: "oklch(0.7 0.24 210)" }}
        />
      </div>

      <div className="relative z-10 flex flex-col min-h-dvh">
        {/* Header */}
        <header className="pt-6 pb-2 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            {/* App title */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3 mb-5"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.65 0.28 295), oklch(0.62 0.28 345))",
                }}
              >
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1
                  className="text-2xl font-bold tracking-tight"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.9 0.1 295), oklch(0.85 0.15 345))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  StudyFlow
                </h1>
                <p className="text-xs text-muted-foreground tracking-wide">
                  Your daily focus companion
                </p>
              </div>
            </motion.div>

            {/* Daily quote banner */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="relative overflow-hidden rounded-2xl mb-5 p-4 md:p-5"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.18 0.08 295 / 0.7), oklch(0.16 0.06 345 / 0.5))",
                border: "1px solid oklch(0.35 0.1 295 / 0.4)",
                backdropFilter: "blur(12px)",
              }}
            >
              {/* Shimmer line */}
              <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, oklch(0.65 0.28 295 / 0.8), oklch(0.62 0.28 345 / 0.6), transparent)",
                }}
              />
              <div className="flex gap-3 items-start">
                <Quote
                  className="w-5 h-5 mt-0.5 shrink-0"
                  style={{ color: "oklch(0.7 0.22 345)" }}
                />
                <div>
                  <p
                    className="text-sm md:text-base font-medium leading-relaxed italic"
                    style={{ color: "oklch(0.9 0.05 285)" }}
                  >
                    &ldquo;{dailyQuote.quote}&rdquo;
                  </p>
                  <p
                    className="text-xs mt-2 font-semibold tracking-wide"
                    style={{
                      background:
                        "linear-gradient(90deg, oklch(0.75 0.2 295), oklch(0.72 0.22 345))",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    — {dailyQuote.author}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Tab nav */}
            <nav
              className="flex gap-1 p-1 rounded-2xl"
              style={{
                background: "oklch(0.12 0.025 285 / 0.8)",
                border: "1px solid oklch(0.25 0.04 285 / 0.5)",
              }}
            >
              {TABS.map(({ key, label, icon: Icon, ocid }) => (
                <button
                  type="button"
                  key={key}
                  data-ocid={ocid}
                  onClick={() => setActiveTab(key)}
                  className="relative flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-colors duration-200"
                  style={
                    activeTab === key
                      ? { color: "white" }
                      : { color: "oklch(0.55 0.08 285)" }
                  }
                >
                  {activeTab === key && (
                    <motion.div
                      layoutId="active-tab-bg"
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background:
                          "linear-gradient(135deg, oklch(0.65 0.28 295 / 0.9), oklch(0.58 0.25 345 / 0.8))",
                      }}
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.4,
                      }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {label}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 px-4 md:px-8 pb-6">
          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
              >
                <ActiveComponent />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* Footer */}
        <footer className="py-4 text-center text-xs text-muted-foreground px-4">
          <span>© {new Date().getFullYear()}. Built with </span>
          <span style={{ color: "oklch(0.72 0.22 345)" }}>♥</span>
          <span> using </span>
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            caffeine.ai
          </a>
        </footer>
      </div>

      <Toaster
        theme="dark"
        toastOptions={{
          style: {
            background: "oklch(0.16 0.04 285)",
            border: "1px solid oklch(0.3 0.06 285 / 0.5)",
            color: "oklch(0.92 0.02 285)",
          },
        }}
      />
    </div>
  );
}
