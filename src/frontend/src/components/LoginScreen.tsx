import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Brain,
  Loader2,
  Lock,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { getDailyQuote } from "../data/quotes";

interface LoginScreenProps {
  onLogin: () => void;
  isLoggingIn: boolean;
  isInitializing: boolean;
}

const FEATURES = [
  {
    icon: Brain,
    title: "Focus Timer",
    description: "Track study & break time with precision",
    color: "oklch(0.45 0.28 295)",
    bg: "oklch(0.93 0.05 295)",
  },
  {
    icon: TrendingUp,
    title: "Progress Reports",
    description: "Daily, weekly & monthly analytics",
    color: "oklch(0.45 0.24 345)",
    bg: "oklch(0.95 0.05 345)",
  },
  {
    icon: BookOpen,
    title: "Smart Tasks",
    description: "Task list that keeps you accountable",
    color: "oklch(0.42 0.2 155)",
    bg: "oklch(0.94 0.05 155)",
  },
];

export default function LoginScreen({
  onLogin,
  isLoggingIn,
  isInitializing,
}: LoginScreenProps) {
  const dailyQuote = getDailyQuote();

  if (isInitializing) {
    return (
      <div
        className="min-h-dvh flex items-center justify-center"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.97 0.015 285) 0%, oklch(0.98 0.01 240) 50%, oklch(0.97 0.015 340) 100%)",
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.65 0.28 295), oklch(0.62 0.28 345))",
            }}
          >
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <Loader2
            className="w-6 h-6 animate-spin"
            style={{ color: "oklch(0.55 0.28 295)" }}
          />
          <p style={{ color: "oklch(0.45 0.06 285)" }} className="text-sm">
            Loading StudyFlow...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="min-h-dvh flex flex-col relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.97 0.015 285) 0%, oklch(0.98 0.01 240) 50%, oklch(0.97 0.015 340) 100%)",
      }}
    >
      {/* Ambient background blobs — subtle on light bg */}
      <div
        aria-hidden
        className="fixed inset-0 pointer-events-none overflow-hidden"
        style={{ zIndex: 0 }}
      >
        <div
          className="absolute -top-40 -left-40 w-[28rem] h-[28rem] rounded-full opacity-15 blur-3xl"
          style={{ background: "oklch(0.65 0.28 295)" }}
        />
        <div
          className="absolute top-1/3 -right-40 w-80 h-80 rounded-full opacity-12 blur-3xl"
          style={{ background: "oklch(0.62 0.28 345)" }}
        />
        <div
          className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ background: "oklch(0.65 0.24 210)" }}
        />
      </div>

      <div className="relative z-10 flex flex-col flex-1">
        {/* Header logo area */}
        <header className="pt-8 px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center float-animation shadow-md"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.65 0.28 295), oklch(0.62 0.28 345))",
                boxShadow: "0 4px 16px oklch(0.65 0.28 295 / 0.3)",
              }}
            >
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span
              className="text-xl font-bold tracking-tight"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.45 0.28 295), oklch(0.48 0.26 345))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              StudyFlow
            </span>
          </motion.div>
        </header>

        {/* Main content */}
        <main className="flex-1 flex items-center justify-center px-4 md:px-8 py-12">
          <div className="w-full max-w-2xl mx-auto text-center">
            {/* Hero heading */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="mb-6"
            >
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6"
                style={{
                  background: "oklch(0.93 0.05 295)",
                  border: "1px solid oklch(0.82 0.1 295 / 0.5)",
                  color: "oklch(0.45 0.28 295)",
                }}
              >
                <Zap className="w-3 h-3" />
                Your personal study companion
              </div>

              <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight mb-4">
                <span
                  style={{
                    color: "oklch(0.15 0.04 285)",
                  }}
                >
                  Master
                </span>
                <br />
                <span
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.55 0.28 295), oklch(0.52 0.26 345))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Your Focus
                </span>
              </h1>
              <p
                className="text-lg md:text-xl max-w-md mx-auto leading-relaxed"
                style={{ color: "oklch(0.4 0.06 285)" }}
              >
                Track sessions, crush tasks, and visualize your growth — all
                saved securely to your personal account.
              </p>
            </motion.div>

            {/* Daily quote card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative overflow-hidden rounded-2xl mb-8 p-5 mx-auto max-w-lg"
              style={{
                background: "oklch(1 0 0 / 0.9)",
                border: "1px solid oklch(0.88 0.05 285 / 0.7)",
                boxShadow: "0 2px 16px oklch(0.58 0.26 345 / 0.06)",
              }}
            >
              {/* Left color border */}
              <div
                className="absolute top-0 left-0 bottom-0 w-1 rounded-l-2xl"
                style={{
                  background:
                    "linear-gradient(180deg, oklch(0.65 0.28 295), oklch(0.62 0.28 345))",
                }}
              />
              <p
                className="text-sm font-medium leading-relaxed italic mb-2 pl-3"
                style={{ color: "oklch(0.25 0.04 285)" }}
              >
                &ldquo;{dailyQuote.quote}&rdquo;
              </p>
              <p
                className="text-xs font-semibold tracking-wide pl-3"
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
            </motion.div>

            {/* Feature pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap justify-center gap-3 mb-10"
            >
              {FEATURES.map(({ icon: Icon, title, description, color, bg }) => (
                <div
                  key={title}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl shadow-sm"
                  style={{
                    background: "oklch(1 0 0 / 0.9)",
                    border: "1px solid oklch(0.88 0.04 285 / 0.7)",
                  }}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: bg }}
                  >
                    <Icon className="w-3.5 h-3.5" style={{ color }} />
                  </div>
                  <div className="text-left">
                    <div
                      className="text-xs font-semibold"
                      style={{ color: "oklch(0.2 0.04 285)" }}
                    >
                      {title}
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: "oklch(0.5 0.05 285)" }}
                    >
                      {description}
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* CTA Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-col items-center gap-4"
            >
              <Button
                data-ocid="login.primary_button"
                onClick={onLogin}
                disabled={isLoggingIn}
                className="relative group h-14 px-10 text-base font-bold rounded-2xl overflow-hidden transition-all duration-300 shadow-lg"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.65 0.28 295), oklch(0.58 0.26 345))",
                  boxShadow:
                    "0 4px 20px oklch(0.65 0.28 295 / 0.35), 0 2px 8px oklch(0.58 0.26 345 / 0.2)",
                  border: "none",
                  color: "white",
                }}
              >
                {/* Shine overlay */}
                <span
                  aria-hidden
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.72 0.28 295), oklch(0.68 0.28 345))",
                  }}
                />
                <span className="relative flex items-center gap-2.5">
                  {isLoggingIn ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Lock className="w-5 h-5" />
                  )}
                  {isLoggingIn
                    ? "Connecting..."
                    : "Sign in with Internet Identity"}
                </span>
              </Button>

              <p
                className="text-xs max-w-xs text-center leading-relaxed"
                style={{ color: "oklch(0.5 0.05 285)" }}
              >
                Secure, passwordless login. Your data is stored privately on the
                Internet Computer blockchain.
              </p>
            </motion.div>
          </div>
        </main>

        {/* Footer */}
        <footer
          className="py-5 text-center text-xs px-4"
          style={{ color: "oklch(0.55 0.04 285)" }}
        >
          <span>© {new Date().getFullYear()}. Built with </span>
          <span style={{ color: "oklch(0.58 0.26 345)" }}>♥</span>
          <span> using </span>
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline transition-colors"
            style={{ color: "oklch(0.45 0.12 295)" }}
          >
            caffeine.ai
          </a>
        </footer>
      </div>
    </div>
  );
}
