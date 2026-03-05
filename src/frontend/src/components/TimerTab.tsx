import { Button } from "@/components/ui/button";
import { useGetDailySessions, useSaveDailySession } from "@/hooks/useQueries";
import { Coffee, Play, RotateCcw, Square, Timer } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type TimerMode = "idle" | "studying" | "break";

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

interface SessionStats {
  studySeconds: number;
  breakSeconds: number;
  stopCount: number;
}

export default function TimerTab() {
  const [mode, setMode] = useState<TimerMode>("idle");
  const [elapsed, setElapsed] = useState(0); // seconds for current segment
  const [stats, setStats] = useState<SessionStats>({
    studySeconds: 0,
    breakSeconds: 0,
    stopCount: 0,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const todayDate = new Date().toISOString().split("T")[0];

  const { data: sessions } = useGetDailySessions();
  const { mutate: saveSession, isPending: isSaving } = useSaveDailySession();

  // Pre-populate today's stats on mount
  useEffect(() => {
    if (!sessions) return;
    const todaySession = sessions.find((s) => s.date === todayDate);
    if (todaySession) {
      setStats({
        studySeconds: Number(todaySession.studySeconds),
        breakSeconds: Number(todaySession.breakSeconds),
        stopCount: Number(todaySession.stopCount),
      });
    }
  }, [sessions, todayDate]);

  const tick = useCallback(() => {
    setElapsed((prev) => prev + 1);
  }, []);

  const startInterval = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(tick, 1000);
  }, [tick]);

  const stopInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Flush elapsed seconds into stats
  const flushElapsed = useCallback(
    (currentMode: TimerMode, currentElapsed: number) => {
      if (currentMode === "studying") {
        setStats((prev) => ({
          ...prev,
          studySeconds: prev.studySeconds + currentElapsed,
        }));
      } else if (currentMode === "break") {
        setStats((prev) => ({
          ...prev,
          breakSeconds: prev.breakSeconds + currentElapsed,
        }));
      }
    },
    [],
  );

  const handleStartStudying = () => {
    setMode("studying");
    setElapsed(0);
    startInterval();
  };

  const handleTakeBreak = () => {
    flushElapsed(mode, elapsed);
    setMode("break");
    setElapsed(0);
    startInterval();
  };

  const handleResumeStudying = () => {
    flushElapsed(mode, elapsed);
    setMode("studying");
    setElapsed(0);
    startInterval();
  };

  const handleStop = () => {
    stopInterval();
    // Flush current segment
    const finalStats = { ...stats };
    if (mode === "studying") {
      finalStats.studySeconds += elapsed;
    } else if (mode === "break") {
      finalStats.breakSeconds += elapsed;
    }
    finalStats.stopCount += 1;

    setStats(finalStats);
    setMode("idle");
    setElapsed(0);

    // Save to backend
    saveSession(
      {
        date: todayDate,
        studySeconds: BigInt(finalStats.studySeconds),
        breakSeconds: BigInt(finalStats.breakSeconds),
        stopCount: BigInt(finalStats.stopCount),
      },
      {
        onSuccess: () => toast.success("Session saved! Great work! 🎉"),
        onError: () => toast.error("Failed to save session"),
      },
    );
  };

  const handleReset = () => {
    stopInterval();
    setMode("idle");
    setElapsed(0);
    setStats({ studySeconds: 0, breakSeconds: 0, stopCount: 0 });
  };

  useEffect(() => {
    return () => stopInterval();
  }, [stopInterval]);

  // Current display time
  const currentElapsed = elapsed;
  // Total study = accumulated + current if studying
  const displayStudy =
    stats.studySeconds + (mode === "studying" ? currentElapsed : 0);
  const displayBreak =
    stats.breakSeconds + (mode === "break" ? currentElapsed : 0);

  const isStudying = mode === "studying";
  const isOnBreak = mode === "break";
  const isActive = isStudying || isOnBreak;

  return (
    <div className="flex flex-col items-center gap-8 py-6 px-4">
      {/* Mode label */}
      <motion.div
        key={mode}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2"
      >
        {isStudying && (
          <span className="flex items-center gap-2 text-sm font-semibold tracking-widest uppercase text-primary">
            <span className="w-2 h-2 rounded-full bg-primary glow-pulse inline-block" />
            Studying
          </span>
        )}
        {isOnBreak && (
          <span className="flex items-center gap-2 text-sm font-semibold tracking-widest uppercase text-secondary-foreground">
            <span className="w-2 h-2 rounded-full bg-cyan-400 glow-pulse inline-block" />
            On Break
          </span>
        )}
        {!isActive && (
          <span className="flex items-center gap-2 text-sm font-semibold tracking-widest uppercase text-muted-foreground">
            <Timer className="w-4 h-4" />
            Ready
          </span>
        )}
      </motion.div>

      {/* Big stopwatch */}
      <motion.div
        className={`relative flex items-center justify-center rounded-full w-64 h-64 md:w-80 md:h-80 ${
          isStudying
            ? "timer-ring-studying"
            : isOnBreak
              ? "timer-ring-break"
              : ""
        }`}
        style={{
          background: isStudying
            ? "radial-gradient(circle at 40% 40%, oklch(0.18 0.06 295), oklch(0.12 0.03 285))"
            : isOnBreak
              ? "radial-gradient(circle at 40% 40%, oklch(0.18 0.06 210), oklch(0.12 0.03 285))"
              : "radial-gradient(circle at 40% 40%, oklch(0.16 0.04 285), oklch(0.11 0.02 285))",
          border: isStudying
            ? "2px solid oklch(0.65 0.28 295 / 0.5)"
            : isOnBreak
              ? "2px solid oklch(0.7 0.24 210 / 0.5)"
              : "2px solid oklch(0.3 0.05 285 / 0.5)",
        }}
      >
        {/* Decorative ring */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: isStudying
              ? "conic-gradient(from 0deg, oklch(0.65 0.28 295 / 0.3), oklch(0.62 0.28 345 / 0.1), oklch(0.65 0.28 295 / 0.3))"
              : "transparent",
          }}
        />

        <div className="relative z-10 text-center">
          <div
            className="timer-display font-mono text-5xl md:text-6xl font-bold tracking-wider"
            style={{
              color: isStudying
                ? "oklch(0.85 0.2 295)"
                : isOnBreak
                  ? "oklch(0.8 0.2 210)"
                  : "oklch(0.7 0.06 285)",
              textShadow: isStudying
                ? "0 0 30px oklch(0.65 0.28 295 / 0.5)"
                : isOnBreak
                  ? "0 0 30px oklch(0.7 0.24 210 / 0.5)"
                  : "none",
            }}
          >
            {formatTime(currentElapsed)}
          </div>
          <div className="text-xs text-muted-foreground mt-1 uppercase tracking-widest">
            {isStudying ? "focus time" : isOnBreak ? "break time" : "stopped"}
          </div>
        </div>
      </motion.div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 justify-center">
        {!isActive && (
          <Button
            data-ocid="timer.start_button"
            onClick={handleStartStudying}
            size="lg"
            className="font-semibold px-8 gap-2"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.65 0.28 295), oklch(0.62 0.28 345))",
              color: "white",
              border: "none",
            }}
          >
            <Play className="w-5 h-5" />
            Start Studying
          </Button>
        )}

        {isStudying && (
          <Button
            data-ocid="timer.break_button"
            onClick={handleTakeBreak}
            size="lg"
            variant="outline"
            className="font-semibold px-8 gap-2 border-cyan-500/40 hover:border-cyan-400/70"
            style={{ color: "oklch(0.8 0.2 210)" }}
          >
            <Coffee className="w-5 h-5" />
            Take a Break
          </Button>
        )}

        {isOnBreak && (
          <Button
            data-ocid="timer.resume_button"
            onClick={handleResumeStudying}
            size="lg"
            className="font-semibold px-8 gap-2"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.65 0.28 295), oklch(0.62 0.28 345))",
              color: "white",
              border: "none",
            }}
          >
            <Play className="w-5 h-5" />
            Resume Studying
          </Button>
        )}

        {isActive && (
          <Button
            data-ocid="timer.stop_button"
            onClick={handleStop}
            disabled={isSaving}
            size="lg"
            variant="outline"
            className="font-semibold px-8 gap-2 border-pink-500/40 hover:border-pink-400/70"
            style={{ color: "oklch(0.75 0.22 345)" }}
          >
            <Square className="w-5 h-5" />
            {isSaving ? "Saving..." : "Stop Session"}
          </Button>
        )}

        <Button
          data-ocid="timer.reset.button"
          onClick={handleReset}
          size="lg"
          variant="ghost"
          className="font-semibold px-6 gap-2 text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </Button>
      </div>

      {/* Today's Stats */}
      <div className="w-full max-w-2xl">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4 text-center">
          Today's Stats
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <motion.div
            data-ocid="timer.study_time.panel"
            className="glass-card rounded-2xl p-4 text-center"
            whileHover={{ scale: 1.02 }}
          >
            <div
              className="text-xl font-bold font-mono mb-1"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.75 0.2 295), oklch(0.75 0.22 345))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {formatTime(displayStudy)}
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">
              Study Time
            </div>
          </motion.div>

          <motion.div
            data-ocid="timer.break_time.panel"
            className="glass-card rounded-2xl p-4 text-center"
            whileHover={{ scale: 1.02 }}
          >
            <div
              className="text-xl font-bold font-mono mb-1"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.8 0.2 210), oklch(0.75 0.2 180))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {formatTime(displayBreak)}
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">
              Break Time
            </div>
          </motion.div>

          <motion.div
            data-ocid="timer.stops.panel"
            className="glass-card rounded-2xl p-4 text-center"
            whileHover={{ scale: 1.02 }}
          >
            <div
              className="text-xl font-bold font-mono mb-1"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.75 0.22 345), oklch(0.75 0.2 25))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {stats.stopCount + (mode !== "idle" ? 0 : 0)}
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">
              Sessions
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
