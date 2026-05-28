import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  CartesianGrid,
} from "recharts";
import {
  getWeeklyXP,
  getHistory,
  getWords,
  getStreak,
  getXP,
  getCompletedSteps,
  type LessonEntry,
} from "@/lib/progress";

export const Route = createFileRoute("/parent")({
  head: () => ({
    meta: [
      { title: "Parent Dashboard — English Buddy" },
      { name: "description", content: "Track your child's English learning progress." },
    ],
  }),
  component: ParentDashboard,
});

function ParentDashboard() {
  const [weekly, setWeekly] = useState(() => getWeeklyXP());
  const [history, setHistory] = useState<LessonEntry[]>(() => getHistory());
  const [words, setWords] = useState<string[]>(() => getWords());
  const [streak, setStreak] = useState(() => getStreak());
  const [totalXp, setTotalXp] = useState(() => getXP());
  const [completed, setCompleted] = useState(() => getCompletedSteps());

  useEffect(() => {
    const sync = () => {
      setWeekly(getWeeklyXP());
      setHistory(getHistory());
      setWords(getWords());
      setStreak(getStreak());
      setTotalXp(getXP());
      setCompleted(getCompletedSteps());
    };
    sync();
    window.addEventListener("eb-progress", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("eb-progress", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const weeklyXpTotal = weekly.reduce((s, d) => s + d.xp, 0);
  const lessonsThisWeek = history.filter((h) => Date.now() - h.at < 7 * 24 * 3600 * 1000).length;
  const minutesEstimate = Math.round(lessonsThisWeek * 6);
  const skillCounts: Record<string, number> = { School: 0, Food: 0, Family: 0, Listening: 0, Speaking: 0, Writing: 0 };
  history.forEach((h) => {
    if (h.title.includes("School")) skillCounts.School += 1;
    if (h.title.includes("Food")) skillCounts.Food += 1;
    if (h.title.includes("Family")) skillCounts.Family += 1;
    if (h.title.startsWith("Listening")) skillCounts.Listening += 1;
    if (h.title.startsWith("Speaking")) skillCounts.Speaking += 1;
    if (h.title.startsWith("Writing")) skillCounts.Writing += 1;
  });
  const skills = Object.entries(skillCounts).map(([skill, c]) => ({
    skill,
    mastery: Math.min(100, c * 25),
  }));
  const hasAnyActivity = history.length > 0 || weeklyXpTotal > 0;

  return (
    <div className="min-h-screen bg-app-gradient animate-[fade-in_0.3s_ease-out]">
      <header className="flex items-center justify-between px-6 py-6 md:px-12">
        <Logo />
        <Link to="/" className="rounded-full bg-white/80 px-4 py-2 text-sm font-bold text-primary shadow-soft backdrop-blur hover:bg-white">
          ← Switch profile
        </Link>
      </header>

      <main className="mx-auto max-w-5xl px-6 pb-16">
        <div className="rounded-[2rem] bg-parent-gradient p-8 text-white shadow-soft md:p-10 animate-[fade-in_0.3s_ease-out]">
          <p className="text-sm font-bold uppercase tracking-wider text-white/80">Welcome back</p>
          <h1 className="mt-2 text-4xl font-extrabold md:text-5xl">Emma's progress this week 🌟</h1>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <Metric label="Time spent" value={minutesEstimate > 0 ? `${minutesEstimate}m` : "—"} delta={`${lessonsThisWeek} lessons`} />
            <Metric label="XP this week" value={String(weeklyXpTotal)} delta={`Total ${totalXp}`} />
            <Metric label="New words" value={String(words.length)} delta={`${streak}-day streak`} />
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <Panel title="Weekly Progress" icon="📊">
            <p className="mb-3 text-sm text-muted-foreground">XP earned each day, last 7 days</p>
            {weeklyXpTotal === 0 ? (
              <EmptyState
                emoji="📅"
                title="No XP earned this week yet"
                desc="Once Emma finishes a lesson, daily XP will appear here."
              />
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekly} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    cursor={{ fill: "var(--muted)", opacity: 0.4 }}
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid var(--border)",
                      background: "var(--card)",
                      fontWeight: 600,
                    }}
                  />
                  <Bar dataKey="xp" fill="var(--primary)" radius={[8, 8, 0, 0]} />
                </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Panel>

          <Panel title="Skills Radar" icon="🎯">
            <p className="mb-3 text-sm text-muted-foreground">Mastery across topic areas</p>
            {history.length === 0 ? (
              <EmptyState
                emoji="🎯"
                title="No skills measured yet"
                desc="Finish lessons to see Emma's strengths across topics."
              />
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={skills} outerRadius="75%">
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="skill" tick={{ fill: "var(--foreground)", fontSize: 11, fontWeight: 600 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name="Mastery"
                    dataKey="mastery"
                    stroke="var(--accent)"
                    fill="var(--accent)"
                    fillOpacity={0.45}
                  />
                </RadarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Panel>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <Panel title="Learning History" icon="📘">
            {history.length === 0 ? (
              <EmptyState
                emoji="📖"
                title="No lessons completed yet this week"
                desc="Emma's finished lessons will show up here as she learns."
              />
            ) : (
              <ul className="space-y-3 text-sm">
                {history.slice(0, 6).map((h, i) => (
                  <li key={`${h.title}-${i}`} className="flex items-center gap-3 rounded-xl bg-muted/60 px-3 py-2">
                    <span className="text-xl">{h.emoji}</span>
                    <div className="flex-1">
                      <p className="font-bold">{h.title}</p>
                      <p className="text-xs text-muted-foreground">
                        +{h.xp} XP · {timeAgo(h.at)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-5">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                New words learned ({words.length})
              </p>
              {words.length === 0 ? (
                <p className="rounded-xl bg-muted/60 px-3 py-2 text-sm text-muted-foreground">
                  No new words yet — play a Vocabulary game to start collecting.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {words.slice(0, 20).map((w) => (
                    <span key={w} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                      {w}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Panel>
          <Panel title="Suggested for Emma" icon="💡">
            <ul className="space-y-3">
              {!completed.listen && <Suggestion title="Try Listening" desc="Short audio clips with fun questions." />}
              {!completed.vocab && <Suggestion title="Vocabulary worlds" desc="Cards + matching game in School, Food, Family." />}
              {!completed.speak && <Suggestion title="Speaking practice" desc="Record short answers to friendly prompts." />}
              {!completed.write && <Suggestion title="Writing blanks" desc="Fill in the missing words to build sentences." />}
              {Object.values(completed).every(Boolean) && (
                <Suggestion title="All done today! 🎉" desc="Come back tomorrow to keep the streak alive." />
              )}
            </ul>
          </Panel>
        </div>

        {!hasAnyActivity && (
          <p className="mt-10 rounded-2xl bg-card p-6 text-center text-sm text-muted-foreground shadow-soft">
            Tip: switch to Emma's profile and finish a lesson — this dashboard will update instantly.
          </p>
        )}
      </main>
    </div>
  );
}

function EmptyState({ emoji, title, desc }: { emoji: string; title: string; desc: string }) {
  return (
    <div className="flex h-64 flex-col items-center justify-center rounded-2xl bg-muted/40 px-6 text-center">
      <div className="text-4xl">{emoji}</div>
      <p className="mt-3 text-base font-extrabold">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

function timeAgo(ts: number) {
  const s = Math.round((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
}

function Metric({ label, value, delta }: { label: string; value: string; delta: string }) {
  return (
    <div className="rounded-2xl bg-white/20 p-4 backdrop-blur">
      <p className="text-xs font-bold uppercase tracking-wider text-white/80">{label}</p>
      <p className="mt-1 text-2xl font-extrabold">{value}</p>
      <p className="text-xs font-semibold text-white/90">{delta}</p>
    </div>
  );
}

function Panel({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl bg-card p-6 shadow-soft">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-extrabold">
        <span>{icon}</span> {title}
      </h2>
      {children}
    </div>
  );
}

function Activity({ emoji, text }: { emoji: string; text: string }) {
  return (
    <li className="flex items-center gap-3 rounded-xl bg-muted/60 px-3 py-2">
      <span className="text-xl">{emoji}</span>
      <span className="font-semibold">{text}</span>
    </li>
  );
}

function Suggestion({ title, desc }: { title: string; desc: string }) {
  return (
    <li className="rounded-2xl border border-border bg-background/60 p-4">
      <p className="font-extrabold">{title}</p>
      <p className="text-sm text-muted-foreground">{desc}</p>
    </li>
  );
}