import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import {
  BarChart3,
  BookOpen,
  ListTodo,
  Loader2,
  LogOut,
  Quote,
  Sparkles,
  Timer,
  User,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import CountdownBanner from "./components/CountdownBanner";
import LoginScreen from "./components/LoginScreen";
import ReportsTab from "./components/ReportsTab";
import SubjectPlannerTab from "./components/SubjectPlannerTab";
import TasksTab from "./components/TasksTab";
import TimerTab from "./components/TimerTab";
import { getDailyQuote } from "./data/quotes";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useUserSetup } from "./hooks/useUserSetup";

type Tab = "timer" | "tasks" | "reports" | "planner";

const TABS: { key: Tab; label: string; icon: typeof Timer; ocid: string }[] = [
  { key: "timer", label: "Timer", icon: Timer, ocid: "nav.timer.tab" },
  { key: "tasks", label: "Tasks", icon: ListTodo, ocid: "nav.tasks.tab" },
  {
    key: "reports",
    label: "Reports",
    icon: BarChart3,
    ocid: "nav.reports.tab",
  },
  {
    key: "planner",
    label: "Planner",
    icon: BookOpen,
    ocid: "nav.planner.tab",
  },
];

const TAB_COMPONENTS: Record<Tab, React.ComponentType> = {
  timer: TimerTab,
  tasks: TasksTab,
  reports: ReportsTab,
  planner: SubjectPlannerTab,
};

function truncatePrincipal(principal: string): string {
  if (principal.length <= 10) return principal;
  return `${principal.slice(0, 5)}...${principal.slice(-3)}`;
}

function AppContent() {
  const [activeTab, setActiveTab] = useState<Tab>("timer");
  const { identity, clear } = useInternetIdentity();
  const { isReady } = useUserSetup();
  const dailyQuote = getDailyQuote();

  const ActiveComponent = TAB_COMPONENTS[activeTab];
  const principalStr = identity?.getPrincipal().toString() ?? "";
  const shortPrincipal = truncatePrincipal(principalStr);

  return (
    <div
      className="min-h-dvh flex flex-col"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.97 0.015 285) 0%, oklch(0.98 0.01 240) 50%, oklch(0.97 0.015 340) 100%)",
      }}
    >
      {/* Ambient background blobs */}
      <div
        aria-hidden
        className="fixed inset-0 pointer-events-none overflow-hidden"
        style={{ zIndex: 0 }}
      >
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-15 blur-3xl"
          style={{ background: "oklch(0.65 0.28 295)" }}
        />
        <div
          className="absolute top-1/2 -right-32 w-80 h-80 rounded-full opacity-12 blur-3xl"
          style={{ background: "oklch(0.62 0.28 345)" }}
        />
        <div
          className="absolute -bottom-20 left-1/3 w-72 h-72 rounded-full opacity-10 blur-3xl"
          style={{ background: "oklch(0.65 0.24 210)" }}
        />
      </div>

      <div className="relative z-10 flex flex-col min-h-dvh">
        {/* Header */}
        <header className="pt-6 pb-2 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            {/* App title + user section */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-between gap-3 mb-5"
            >
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
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
                        "linear-gradient(135deg, oklch(0.45 0.28 295), oklch(0.48 0.26 345))",
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
              </div>

              {/* User section */}
              <div className="flex items-center gap-2">
                {/* User identity badge */}
                <div
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl"
                  style={{
                    background: "oklch(0.95 0.03 285)",
                    border: "1px solid oklch(0.85 0.06 285 / 0.6)",
                  }}
                >
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.65 0.28 295 / 0.2), oklch(0.62 0.28 345 / 0.2))",
                    }}
                  >
                    <User
                      className="w-3.5 h-3.5"
                      style={{ color: "oklch(0.5 0.2 295)" }}
                    />
                  </div>
                  <span
                    className="text-xs font-mono font-medium"
                    style={{ color: "oklch(0.35 0.08 285)" }}
                  >
                    {shortPrincipal}
                  </span>
                </div>

                {/* Sign out button */}
                <Button
                  data-ocid="header.signout.button"
                  variant="ghost"
                  size="sm"
                  onClick={clear}
                  className="h-8 gap-1.5 text-xs font-medium rounded-xl transition-colors"
                  style={{
                    color: "oklch(0.45 0.08 285)",
                    border: "1px solid oklch(0.85 0.06 285 / 0.6)",
                    background: "oklch(0.95 0.02 285)",
                  }}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </div>
            </motion.div>

            {/* Countdown Banner — above daily quote */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
            >
              <CountdownBanner />
            </motion.div>

            {/* Daily quote banner */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              className="relative overflow-hidden rounded-2xl mb-5 p-4 md:p-5"
              style={{
                background: "oklch(1 0 0 / 0.9)",
                border: "1px solid oklch(0.88 0.05 285 / 0.7)",
                boxShadow: "0 2px 16px oklch(0.58 0.26 345 / 0.06)",
              }}
            >
              {/* Colorful left border accent */}
              <div
                className="absolute top-0 left-0 bottom-0 w-1 rounded-l-2xl"
                style={{
                  background:
                    "linear-gradient(180deg, oklch(0.65 0.28 295), oklch(0.62 0.28 345))",
                }}
              />
              <div className="pl-3 flex gap-3 items-start">
                <Quote
                  className="w-5 h-5 mt-0.5 shrink-0"
                  style={{ color: "oklch(0.58 0.26 345)" }}
                />
                <div>
                  <p
                    className="text-sm md:text-base font-medium leading-relaxed italic"
                    style={{ color: "oklch(0.25 0.04 285)" }}
                  >
                    &ldquo;{dailyQuote.quote}&rdquo;
                  </p>
                  <p
                    className="text-xs mt-2 font-semibold tracking-wide"
                    style={{
                      background:
                        "linear-gradient(90deg, oklch(0.5 0.22 295), oklch(0.52 0.24 345))",
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
                background: "oklch(0.93 0.02 285)",
                border: "1px solid oklch(0.87 0.04 285 / 0.6)",
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
                      : { color: "oklch(0.45 0.08 285)" }
                  }
                >
                  {activeTab === key && (
                    <motion.div
                      layoutId="active-tab-bg"
                      className="absolute inset-0 rounded-xl shadow-md"
                      style={{
                        background:
                          "linear-gradient(135deg, oklch(0.65 0.28 295 / 0.95), oklch(0.58 0.26 345 / 0.9))",
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
            {!isReady ? (
              <motion.div
                data-ocid="app.loading_state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-24 gap-4"
              >
                <Loader2
                  className="w-8 h-8 animate-spin"
                  style={{ color: "oklch(0.55 0.28 295)" }}
                />
                <p
                  className="text-sm"
                  style={{ color: "oklch(0.45 0.07 285)" }}
                >
                  Setting up your account...
                </p>
              </motion.div>
            ) : (
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
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="py-4 text-center text-xs text-muted-foreground px-4">
          <span>© {new Date().getFullYear()}. Built with </span>
          <span style={{ color: "oklch(0.58 0.26 345)" }}>♥</span>
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
        theme="light"
        toastOptions={{
          style: {
            background: "oklch(1 0 0)",
            border: "1px solid oklch(0.88 0.05 285 / 0.7)",
            color: "oklch(0.2 0.04 285)",
          },
        }}
      />
    </div>
  );
}

export default function App() {
  const { identity, login, isInitializing, isLoggingIn } =
    useInternetIdentity();

  // Show login screen if not authenticated
  if (isInitializing || !identity) {
    return (
      <>
        <LoginScreen
          onLogin={login}
          isLoggingIn={isLoggingIn}
          isInitializing={isInitializing}
        />
        <Toaster
          theme="light"
          toastOptions={{
            style: {
              background: "oklch(1 0 0)",
              border: "1px solid oklch(0.88 0.05 285 / 0.7)",
              color: "oklch(0.2 0.04 285)",
            },
          }}
        />
      </>
    );
  }

  return <AppContent />;
}
