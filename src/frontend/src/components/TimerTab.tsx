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

const BREAK_ALARM_THRESHOLD = 900; // 15 minutes in seconds

function playAlarmBeep() {
  try {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, ctx.currentTime);
    gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.5);
    oscillator.onended = () => ctx.close();
  } catch {
    // AudioContext unavailable — silently ignore
  }
}

export default function TimerTab() {
  const [mode, setMode] = useState<TimerMode>("idle");
  // elapsed is only used to trigger re-renders; wall-clock is the source of truth
  const [, setElapsed] = useState(0);
  const [stats, setStats] = useState<SessionStats>({
    studySeconds: 0,
    breakSeconds: 0,
    stopCount: 0,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Wall-clock reference: when current segment started
  const startTimeRef = useRef<number>(0);
  // How many seconds were accumulated in previous segments for display
  const baseStudyRef = useRef<number>(0);
  const baseBreakRef = useRef<number>(0);
  // Track if alarm has already fired for the current break session
  const alarmFiredRef = useRef<boolean>(false);

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

  // Returns the wall-clock elapsed seconds for the CURRENT active segment only
  const getWallSegmentElapsed = useCallback((): number => {
    if (mode === "idle") return 0;
    return Math.floor((Date.now() - startTimeRef.current) / 1000);
  }, [mode]);

  const stopInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startInterval = useCallback(
    (isBreak = false) => {
      stopInterval();
      intervalRef.current = setInterval(() => {
        setElapsed((e) => e + 1);
        // Check break alarm only when in break mode
        if (isBreak && !alarmFiredRef.current) {
          const elapsed = Math.floor(
            (Date.now() - startTimeRef.current) / 1000,
          );
          if (elapsed >= BREAK_ALARM_THRESHOLD) {
            alarmFiredRef.current = true;
            playAlarmBeep();
            toast.warning(
              "⏰ Break time! You've been on break for 15 minutes. Time to get back to studying!",
              { duration: Number.POSITIVE_INFINITY, dismissible: true },
            );
          }
        }
      }, 1000);
    },
    [stopInterval],
  );

  const handleStartStudying = () => {
    // Reset base accumulators for display
    baseStudyRef.current = stats.studySeconds;
    baseBreakRef.current = stats.breakSeconds;
    startTimeRef.current = Date.now();
    alarmFiredRef.current = false;
    setMode("studying");
    setElapsed(0);
    startInterval(false);
  };

  const handleTakeBreak = () => {
    // Flush current study segment into stats
    const studyElapsed = getWallSegmentElapsed();
    setStats((prev) => {
      const updated = {
        ...prev,
        studySeconds: prev.studySeconds + studyElapsed,
      };
      baseStudyRef.current = updated.studySeconds;
      baseBreakRef.current = updated.breakSeconds;
      return updated;
    });
    // Start break segment
    startTimeRef.current = Date.now();
    alarmFiredRef.current = false;
    setMode("break");
    setElapsed(0);
    startInterval(true);
  };

  const handleResumeStudying = () => {
    // Flush current break segment into stats
    const breakElapsed = getWallSegmentElapsed();
    setStats((prev) => {
      const updated = {
        ...prev,
        breakSeconds: prev.breakSeconds + breakElapsed,
      };
      baseStudyRef.current = updated.studySeconds;
      baseBreakRef.current = updated.breakSeconds;
      return updated;
    });
    // Start study segment — reset alarm ref
    startTimeRef.current = Date.now();
    alarmFiredRef.current = false;
    setMode("studying");
    setElapsed(0);
    startInterval(false);
  };

  const handleStop = () => {
    stopInterval();
    alarmFiredRef.current = false;
    const segmentElapsed = Math.floor(
      (Date.now() - startTimeRef.current) / 1000,
    );

    const finalStats = { ...stats };
    if (mode === "studying") {
      finalStats.studySeconds += segmentElapsed;
    } else if (mode === "break") {
      finalStats.breakSeconds += segmentElapsed;
    }
    finalStats.stopCount += 1;

    setStats(finalStats);
    setMode("idle");
    setElapsed(0);
    startTimeRef.current = 0;

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
    alarmFiredRef.current = false;
    setMode("idle");
    setElapsed(0);
    startTimeRef.current = 0;
    baseStudyRef.current = 0;
    baseBreakRef.current = 0;
    setStats({ studySeconds: 0, breakSeconds: 0, stopCount: 0 });
  };

  useEffect(() => {
    return () => stopInterval();
  }, [stopInterval]);

  // Compute display values from wall clock
  const segmentElapsed =
    mode !== "idle"
      ? Math.floor((Date.now() - startTimeRef.current) / 1000)
      : 0;

  const displayStudy =
    stats.studySeconds + (mode === "studying" ? segmentElapsed : 0);
  const displayBreak =
    stats.breakSeconds + (mode === "break" ? segmentElapsed : 0);

  const isStudying = mode === "studying";
  const isOnBreak = mode === "break";
  const isActive = isStudying || isOnBreak;

  // Break warning indicator: orange at 10min, red at 15min
  const breakElapsedForDisplay = isOnBreak
    ? Math.floor((Date.now() - startTimeRef.current) / 1000)
    : 0;
  const breakWarning = breakElapsedForDisplay >= 600 && isOnBreak;
  const breakAlarm =
    breakElapsedForDisplay >= BREAK_ALARM_THRESHOLD && isOnBreak;

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
          <span
            className="flex items-center gap-2 text-sm font-semibold tracking-widest uppercase"
            style={{ color: "oklch(0.45 0.28 295)" }}
          >
            <span
              className="w-2 h-2 rounded-full glow-pulse inline-block"
              style={{ background: "oklch(0.55 0.28 295)" }}
            />
            Studying
          </span>
        )}
        {isOnBreak && (
          <span
            className="flex items-center gap-2 text-sm font-semibold tracking-widest uppercase"
            style={{
              color: breakAlarm
                ? "oklch(0.50 0.26 25)"
                : breakWarning
                  ? "oklch(0.52 0.22 60)"
                  : "oklch(0.42 0.22 210)",
            }}
          >
            <span
              className="w-2 h-2 rounded-full glow-pulse inline-block"
              style={{
                background: breakAlarm
                  ? "oklch(0.6 0.28 25)"
                  : breakWarning
                    ? "oklch(0.65 0.22 60)"
                    : "oklch(0.6 0.24 210)",
              }}
            />
            {breakAlarm ? "⚠️ Break Too Long!" : "On Break"}
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
            ? "radial-gradient(circle at 40% 40%, oklch(0.95 0.04 295), oklch(0.98 0.01 285))"
            : isOnBreak
              ? breakAlarm
                ? "radial-gradient(circle at 40% 40%, oklch(0.95 0.06 25), oklch(0.98 0.01 285))"
                : "radial-gradient(circle at 40% 40%, oklch(0.94 0.04 210), oklch(0.98 0.01 285))"
              : "radial-gradient(circle at 40% 40%, oklch(0.97 0.02 285), oklch(1 0 0))",
          border: isStudying
            ? "2px solid oklch(0.65 0.28 295 / 0.5)"
            : isOnBreak
              ? breakAlarm
                ? "2px solid oklch(0.6 0.28 25 / 0.6)"
                : "2px solid oklch(0.6 0.24 210 / 0.5)"
              : "2px solid oklch(0.85 0.05 285 / 0.6)",
          boxShadow:
            isStudying || isOnBreak
              ? "0 4px 32px oklch(0.55 0.2 295 / 0.12)"
              : "0 2px 16px oklch(0.55 0.1 285 / 0.06)",
        }}
      >
        {/* Decorative conic ring for studying */}
        {isStudying && (
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "conic-gradient(from 0deg, oklch(0.65 0.28 295 / 0.12), oklch(0.62 0.28 345 / 0.04), oklch(0.65 0.28 295 / 0.12))",
            }}
          />
        )}

        <div className="relative z-10 text-center">
          <div
            className="timer-display font-mono text-5xl md:text-6xl font-bold tracking-wider"
            style={{
              color: isStudying
                ? "oklch(0.4 0.28 295)"
                : isOnBreak
                  ? breakAlarm
                    ? "oklch(0.45 0.28 25)"
                    : "oklch(0.38 0.22 210)"
                  : "oklch(0.35 0.06 285)",
              textShadow: isStudying
                ? "0 2px 12px oklch(0.65 0.28 295 / 0.2)"
                : isOnBreak
                  ? "0 2px 12px oklch(0.6 0.24 210 / 0.2)"
                  : "none",
            }}
          >
            {formatTime(segmentElapsed)}
          </div>
          <div
            className="text-xs mt-1 uppercase tracking-widest font-semibold"
            style={{ color: "oklch(0.55 0.06 285)" }}
          >
            {isStudying ? "focus time" : isOnBreak ? "break time" : "stopped"}
          </div>
          {/* Break limit warning bar */}
          {isOnBreak && (
            <div className="mt-2 w-24 mx-auto">
              <div
                className="h-1.5 rounded-full overflow-hidden"
                style={{ background: "oklch(0.9 0.04 285)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${Math.min(100, (breakElapsedForDisplay / BREAK_ALARM_THRESHOLD) * 100)}%`,
                    background: breakAlarm
                      ? "oklch(0.6 0.28 25)"
                      : breakWarning
                        ? "oklch(0.65 0.22 60)"
                        : "oklch(0.6 0.24 210)",
                  }}
                />
              </div>
              <div
                className="text-[9px] mt-0.5 text-center"
                style={{
                  color: breakAlarm
                    ? "oklch(0.5 0.26 25)"
                    : "oklch(0.6 0.06 285)",
                }}
              >
                {breakAlarm ? "15 min limit reached" : "15 min limit"}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 justify-center">
        {!isActive && (
          <Button
            data-ocid="timer.start_button"
            onClick={handleStartStudying}
            size="lg"
            className="font-semibold px-8 gap-2 shadow-md"
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
            className="font-semibold px-8 gap-2"
            style={{
              borderColor: "oklch(0.6 0.24 210 / 0.5)",
              color: "oklch(0.38 0.22 210)",
              background: "oklch(0.95 0.03 210)",
            }}
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
            className="font-semibold px-8 gap-2 shadow-md"
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
            className="font-semibold px-8 gap-2"
            style={{
              borderColor: "oklch(0.58 0.26 345 / 0.5)",
              color: "oklch(0.45 0.24 345)",
              background: "oklch(0.97 0.03 345)",
            }}
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
                  "linear-gradient(135deg, oklch(0.5 0.28 295), oklch(0.52 0.26 345))",
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
                  "linear-gradient(135deg, oklch(0.45 0.22 210), oklch(0.48 0.2 180))",
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
                  "linear-gradient(135deg, oklch(0.52 0.26 345), oklch(0.52 0.24 25))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {stats.stopCount}
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
