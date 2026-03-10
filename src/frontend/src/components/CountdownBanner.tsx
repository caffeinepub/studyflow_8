import { Pencil, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "studyflow_countdown_target";

function getDefaultTarget(): string {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  // Format as datetime-local value: YYYY-MM-DDTHH:MM
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function getStoredTarget(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) || getDefaultTarget();
  } catch {
    return getDefaultTarget();
  }
}

interface TimeLeft {
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

function computeTimeLeft(targetMs: number): TimeLeft {
  const total = targetMs - Date.now();
  if (total <= 0) {
    return { months: 0, days: 0, hours: 0, minutes: 0, seconds: 0, total };
  }

  const totalSeconds = Math.floor(total / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalDays = Math.floor(totalHours / 24);

  const months = Math.floor(totalDays / 30);
  const days = totalDays % 30;
  const hours = totalHours % 24;
  const minutes = totalMinutes % 60;
  const seconds = totalSeconds % 60;

  return { months, days, hours, minutes, seconds, total };
}

interface SegmentProps {
  value: number;
  label: string;
  color: string;
  bgColor: string;
}

function Segment({ value, label, color, bgColor }: SegmentProps) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="flex items-center justify-center rounded-2xl min-w-[3rem] md:min-w-[4rem] px-2 py-1.5 md:px-3 md:py-2"
        style={{ background: bgColor }}
      >
        <span
          className="text-xl md:text-3xl font-bold font-mono tabular-nums leading-none"
          style={{ color }}
        >
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span
        className="text-[9px] md:text-[10px] font-bold tracking-widest uppercase mt-1"
        style={{ color: "oklch(0.5 0.06 285)" }}
      >
        {label}
      </span>
    </div>
  );
}

export default function CountdownBanner() {
  const [targetStr, setTargetStr] = useState<string>(getStoredTarget);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() =>
    computeTimeLeft(new Date(getStoredTarget()).getTime()),
  );
  const [showEdit, setShowEdit] = useState(false);
  const [editValue, setEditValue] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Update countdown every second using wall-clock diff
  useEffect(() => {
    const targetMs = new Date(targetStr).getTime();

    const tick = () => {
      setTimeLeft(computeTimeLeft(targetMs));
    };

    tick(); // immediate
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetStr]);

  // Focus input when shown
  useEffect(() => {
    if (showEdit && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showEdit]);

  const handleEditOpen = () => {
    setEditValue(targetStr);
    setShowEdit(true);
  };

  const handleEditClose = () => {
    setShowEdit(false);
  };

  const handleApply = () => {
    if (!editValue) return;
    try {
      const ms = new Date(editValue).getTime();
      if (Number.isNaN(ms)) return;
      setTargetStr(editValue);
      localStorage.setItem(STORAGE_KEY, editValue);
      setShowEdit(false);
    } catch {
      // ignore invalid
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleApply();
    if (e.key === "Escape") handleEditClose();
  };

  const isExpired = timeLeft.total <= 0;

  // Format target date for display
  const targetDateDisplay = (() => {
    try {
      return new Date(targetStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  })();

  const segments = [
    {
      value: timeLeft.months,
      label: "MONTHS",
      color: "oklch(0.45 0.28 295)",
      bgColor:
        "linear-gradient(135deg, oklch(0.92 0.06 295), oklch(0.94 0.04 285))",
    },
    {
      value: timeLeft.days,
      label: "DAYS",
      color: "oklch(0.45 0.26 345)",
      bgColor:
        "linear-gradient(135deg, oklch(0.94 0.06 345), oklch(0.95 0.03 320))",
    },
    {
      value: timeLeft.hours,
      label: "HOURS",
      color: "oklch(0.42 0.22 210)",
      bgColor:
        "linear-gradient(135deg, oklch(0.92 0.06 210), oklch(0.94 0.04 220))",
    },
    {
      value: timeLeft.minutes,
      label: "MINS",
      color: "oklch(0.45 0.22 155)",
      bgColor:
        "linear-gradient(135deg, oklch(0.92 0.06 155), oklch(0.94 0.04 170))",
    },
    {
      value: timeLeft.seconds,
      label: "SECS",
      color: "oklch(0.45 0.2 60)",
      bgColor:
        "linear-gradient(135deg, oklch(0.94 0.06 60), oklch(0.95 0.03 45))",
    },
  ];

  return (
    <div
      data-ocid="countdown.panel"
      className="relative overflow-hidden rounded-2xl mb-4 px-4 py-3 md:px-6 md:py-4"
      style={{
        background: "oklch(1 0 0 / 0.9)",
        border: "1px solid oklch(0.85 0.06 285 / 0.6)",
        boxShadow:
          "0 2px 20px oklch(0.55 0.28 295 / 0.08), 0 1px 4px oklch(0.55 0.28 295 / 0.05)",
      }}
    >
      {/* Colorful top border stripe */}
      <div
        className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
        style={{
          background:
            "linear-gradient(90deg, oklch(0.65 0.28 295), oklch(0.62 0.28 345), oklch(0.65 0.24 210), oklch(0.68 0.22 155), oklch(0.7 0.2 60))",
        }}
      />

      <div className="flex flex-col gap-3">
        {/* Header row */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.65 0.28 295), oklch(0.62 0.28 345))",
              }}
            />
            <span
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: "oklch(0.4 0.08 285)" }}
            >
              Countdown
            </span>
            {targetDateDisplay && (
              <span
                className="text-xs hidden sm:inline"
                style={{ color: "oklch(0.6 0.05 285)" }}
              >
                → {targetDateDisplay}
              </span>
            )}
          </div>
          <button
            type="button"
            data-ocid="countdown.edit_button"
            onClick={handleEditOpen}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all hover:scale-105"
            style={{
              background: "oklch(0.94 0.03 285)",
              border: "1px solid oklch(0.85 0.06 285 / 0.7)",
              color: "oklch(0.45 0.08 285)",
            }}
          >
            <Pencil className="w-3 h-3" />
            <span className="hidden sm:inline">Set Date</span>
          </button>
        </div>

        {/* Edit input */}
        {showEdit && (
          <div
            className="flex items-center gap-2 p-3 rounded-xl"
            style={{
              background: "oklch(0.96 0.02 285)",
              border: "1px solid oklch(0.88 0.04 285)",
            }}
          >
            <input
              ref={inputRef}
              data-ocid="countdown.input"
              type="datetime-local"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 text-sm bg-transparent outline-none min-w-0"
              style={{ color: "oklch(0.2 0.04 285)" }}
            />
            <button
              type="button"
              onClick={handleApply}
              className="px-3 py-1 rounded-lg text-xs font-bold text-white transition-all hover:scale-105"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.55 0.28 295), oklch(0.52 0.26 345))",
              }}
            >
              Apply
            </button>
            <button
              type="button"
              onClick={handleEditClose}
              className="p-1 rounded-lg transition-colors hover:bg-muted"
              style={{ color: "oklch(0.5 0.06 285)" }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Countdown segments */}
        {isExpired ? (
          <div className="flex items-center justify-center py-4 gap-3">
            <span className="text-2xl">🎉</span>
            <span
              className="text-lg font-bold"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.55 0.28 295), oklch(0.58 0.26 345))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Time's Up! You made it!
            </span>
            <span className="text-2xl">🎉</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 md:gap-3 flex-wrap">
            {segments.map(({ value, label, color, bgColor }, i) => (
              <div key={label} className="flex items-center gap-2 md:gap-3">
                <Segment
                  value={value}
                  label={label}
                  color={color}
                  bgColor={bgColor}
                />
                {i < segments.length - 1 && (
                  <span
                    className="text-xl md:text-2xl font-bold pb-4"
                    style={{ color: "oklch(0.75 0.08 285)" }}
                  >
                    :
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
