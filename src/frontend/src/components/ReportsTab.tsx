import { Skeleton } from "@/components/ui/skeleton";
import { useGetDailySessions } from "@/hooks/useQueries";
import { BarChart3, Clock, TrendingUp, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ReportView = "daily" | "weekly" | "monthly";

interface StudySession {
  date: string;
  studySeconds: bigint;
  breakSeconds: bigint;
  stopCount: bigint;
}

function getWeekNumber(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function buildDailyData(sessions: StudySession[]) {
  const last14: { label: string; hours: number; date: string }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const session = sessions.find((s) => s.date === dateStr);
    const hours = session ? Number(session.studySeconds) / 3600 : 0;
    last14.push({
      date: dateStr,
      label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      hours: Math.round(hours * 100) / 100,
    });
  }
  return last14;
}

function buildWeeklyData(sessions: StudySession[]) {
  const weekMap = new Map<string, number>();
  const last12WeekKeys: string[] = [];

  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i * 7);
    const wn = getWeekNumber(d);
    const year = d.getFullYear();
    const key = `${year}-W${String(wn).padStart(2, "0")}`;
    if (!last12WeekKeys.includes(key)) {
      last12WeekKeys.push(key);
      weekMap.set(key, 0);
    }
  }

  for (const s of sessions) {
    const d = new Date(s.date);
    const wn = getWeekNumber(d);
    const year = d.getFullYear();
    const key = `${year}-W${String(wn).padStart(2, "0")}`;
    if (weekMap.has(key)) {
      weekMap.set(key, (weekMap.get(key) || 0) + Number(s.studySeconds) / 3600);
    }
  }

  return last12WeekKeys.map((key) => ({
    label: key.replace("-", " "),
    hours: Math.round((weekMap.get(key) || 0) * 100) / 100,
  }));
}

function buildMonthlyData(sessions: StudySession[]) {
  const monthMap = new Map<string, number>();
  for (const s of sessions) {
    const d = new Date(s.date);
    const key = d.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
    monthMap.set(key, (monthMap.get(key) || 0) + Number(s.studySeconds) / 3600);
  }
  return Array.from(monthMap.entries())
    .map(([label, hours]) => ({ label, hours: Math.round(hours * 100) / 100 }))
    .sort((a, b) => {
      const da = new Date(a.label);
      const db = new Date(b.label);
      return da.getTime() - db.getTime();
    });
}

// Custom tooltip
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div
        className="rounded-xl px-4 py-3 text-sm shadow-xl"
        style={{
          background: "oklch(1 0 0)",
          border: "1px solid oklch(0.88 0.05 285 / 0.7)",
          boxShadow: "0 4px 20px oklch(0.55 0.2 295 / 0.12)",
        }}
      >
        <p className="text-xs mb-1" style={{ color: "oklch(0.5 0.06 285)" }}>
          {label}
        </p>
        <p className="font-bold" style={{ color: "oklch(0.45 0.28 295)" }}>
          {payload[0].value.toFixed(2)}h studied
        </p>
      </div>
    );
  }
  return null;
}

export default function ReportsTab() {
  const [view, setView] = useState<ReportView>("daily");
  const { data: sessions = [], isLoading } = useGetDailySessions();

  const dailyData = buildDailyData(sessions);
  const weeklyData = buildWeeklyData(sessions);
  const monthlyData = buildMonthlyData(sessions);

  const chartData =
    view === "daily" ? dailyData : view === "weekly" ? weeklyData : monthlyData;

  const totalHours = sessions.reduce(
    (sum, s) => sum + Number(s.studySeconds) / 3600,
    0,
  );
  const totalSessions = sessions.reduce(
    (sum, s) => sum + Number(s.stopCount),
    0,
  );
  const longestDay = sessions.reduce(
    (max, s) => Math.max(max, Number(s.studySeconds) / 3600),
    0,
  );

  const hasData = chartData.some((d) => d.hours > 0);

  const viewButtons: { key: ReportView; label: string; ocid: string }[] = [
    { key: "daily", label: "Daily", ocid: "reports.daily.tab" },
    { key: "weekly", label: "Weekly", ocid: "reports.weekly.tab" },
    { key: "monthly", label: "Monthly", ocid: "reports.monthly.tab" },
  ];

  return (
    <div className="flex flex-col gap-6 py-6 px-4 max-w-4xl mx-auto w-full">
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        <motion.div
          className="glass-card rounded-2xl p-4 text-center"
          whileHover={{ scale: 1.02 }}
        >
          <Clock
            className="w-5 h-5 mx-auto mb-2"
            style={{ color: "oklch(0.7 0.22 295)" }}
          />
          <div
            className="text-2xl font-bold font-mono"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.75 0.2 295), oklch(0.75 0.22 345))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {totalHours.toFixed(1)}h
          </div>
          <div className="text-xs text-muted-foreground uppercase tracking-wide mt-1">
            Total Study
          </div>
        </motion.div>

        <motion.div
          className="glass-card rounded-2xl p-4 text-center"
          whileHover={{ scale: 1.02 }}
        >
          <Zap
            className="w-5 h-5 mx-auto mb-2"
            style={{ color: "oklch(0.75 0.22 345)" }}
          />
          <div
            className="text-2xl font-bold font-mono"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.75 0.22 345), oklch(0.75 0.2 25))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {totalSessions}
          </div>
          <div className="text-xs text-muted-foreground uppercase tracking-wide mt-1">
            Sessions
          </div>
        </motion.div>

        <motion.div
          className="glass-card rounded-2xl p-4 text-center"
          whileHover={{ scale: 1.02 }}
        >
          <TrendingUp
            className="w-5 h-5 mx-auto mb-2"
            style={{ color: "oklch(0.7 0.2 155)" }}
          />
          <div
            className="text-2xl font-bold font-mono"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.7 0.2 155), oklch(0.75 0.18 180))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {longestDay.toFixed(1)}h
          </div>
          <div className="text-xs text-muted-foreground uppercase tracking-wide mt-1">
            Best Day
          </div>
        </motion.div>
      </div>

      {/* View toggles */}
      <div className="flex gap-2 justify-center">
        {viewButtons.map(({ key, label, ocid }) => (
          <button
            type="button"
            key={key}
            data-ocid={ocid}
            onClick={() => setView(key)}
            className="px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200"
            style={
              view === key
                ? {
                    background:
                      "linear-gradient(135deg, oklch(0.65 0.28 295), oklch(0.62 0.28 345))",
                    color: "white",
                    boxShadow: "0 2px 10px oklch(0.55 0.24 295 / 0.3)",
                  }
                : {
                    background: "oklch(0.95 0.02 285)",
                    color: "oklch(0.45 0.08 285)",
                    border: "1px solid oklch(0.87 0.04 285 / 0.7)",
                  }
            }
          >
            {label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div
        data-ocid="reports.chart.panel"
        className="glass-card rounded-2xl p-6"
      >
        <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-6">
          {view === "daily"
            ? "Last 14 Days"
            : view === "weekly"
              ? "Last 12 Weeks"
              : "All Months"}{" "}
          — Study Hours
        </h3>

        {isLoading && (
          <div className="flex gap-3 items-end h-48 px-4">
            {[20, 45, 35, 60, 25, 70, 40].map((h, i) => (
              <Skeleton
                // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton heights
                key={i}
                className="flex-1 bg-muted/30 rounded-t"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        )}

        {!isLoading && !hasData && (
          <motion.div
            data-ocid="reports.empty_state"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-48 gap-3"
          >
            <BarChart3
              className="w-12 h-12"
              style={{ color: "oklch(0.45 0.08 285)" }}
            />
            <p className="text-muted-foreground text-sm">
              No study data yet for this period
            </p>
            <p className="text-xs text-muted-foreground opacity-60">
              Start a timer session to see your progress!
            </p>
          </motion.div>
        )}

        {!isLoading && hasData && (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={chartData}
              margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(0.88 0.04 285 / 0.6)"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fill: "oklch(0.45 0.06 285)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: "oklch(0.45 0.06 285)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                unit="h"
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "oklch(0.92 0.04 285 / 0.5)" }}
              />
              <Bar
                dataKey="hours"
                radius={[6, 6, 0, 0]}
                fill="url(#barGradient)"
              />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.7 0.28 295)" />
                  <stop offset="100%" stopColor="oklch(0.55 0.25 345)" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
