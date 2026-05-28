import { createFileRoute, Link } from "@tanstack/react-router";
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
  const weekly = [
    { day: "Mon", xp: 40 },
    { day: "Tue", xp: 65 },
    { day: "Wed", xp: 30 },
    { day: "Thu", xp: 80 },
    { day: "Fri", xp: 55 },
    { day: "Sat", xp: 95 },
    { day: "Sun", xp: 70 },
  ];
  const skills = [
    { skill: "School", mastery: 80 },
    { skill: "Food", mastery: 65 },
    { skill: "Family", mastery: 90 },
    { skill: "Animals", mastery: 50 },
    { skill: "Colors", mastery: 75 },
    { skill: "Numbers", mastery: 60 },
  ];
  const history = [
    { emoji: "🎧", title: "Listening — Greetings", meta: "Completed · +20 XP" },
    { emoji: "📚", title: "Vocabulary — Food", meta: "5 cards · Match game 100%" },
    { emoji: "🗣️", title: "Speaking — Describe your day", meta: "Recorded · +30 XP" },
    { emoji: "✍️", title: "Writing — Fill the blanks", meta: "4/4 correct · +35 XP" },
  ];
  const newWords = ["apple", "school", "mother", "happy", "playground", "lunch", "teacher", "brother"];

  return (
    <div className="min-h-screen bg-app-gradient">
      <header className="flex items-center justify-between px-6 py-6 md:px-12">
        <Logo />
        <Link to="/" className="rounded-full bg-white/80 px-4 py-2 text-sm font-bold text-primary shadow-soft backdrop-blur hover:bg-white">
          ← Switch profile
        </Link>
      </header>

      <main className="mx-auto max-w-5xl px-6 pb-16">
        <div className="rounded-[2rem] bg-parent-gradient p-8 text-white shadow-soft md:p-10">
          <p className="text-sm font-bold uppercase tracking-wider text-white/80">Welcome back</p>
          <h1 className="mt-2 text-4xl font-extrabold md:text-5xl">Emma's progress this week 🌟</h1>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <Metric label="Time spent" value="2h 14m" delta="+18%" />
            <Metric label="Lessons done" value="9" delta="+3" />
            <Metric label="New words" value="47" delta="+12" />
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <Panel title="Weekly Progress" icon="📊">
            <p className="mb-3 text-sm text-muted-foreground">XP earned each day, last 7 days</p>
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
          </Panel>

          <Panel title="Skills Radar" icon="🎯">
            <p className="mb-3 text-sm text-muted-foreground">Mastery across topic areas</p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={skills} outerRadius="75%">
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="skill" tick={{ fill: "var(--foreground)", fontSize: 12, fontWeight: 600 }} />
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
          </Panel>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <Panel title="Learning History" icon="📘">
            <ul className="space-y-3 text-sm">
              {history.map((h) => (
                <li key={h.title} className="flex items-center gap-3 rounded-xl bg-muted/60 px-3 py-2">
                  <span className="text-xl">{h.emoji}</span>
                  <div className="flex-1">
                    <p className="font-bold">{h.title}</p>
                    <p className="text-xs text-muted-foreground">{h.meta}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-5">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">New words learned</p>
              <div className="flex flex-wrap gap-2">
                {newWords.map((w) => (
                  <span key={w} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                    {w}
                  </span>
                ))}
              </div>
            </div>
          </Panel>
          <Panel title="Suggested for Emma" icon="💡">
            <ul className="space-y-3">
              <Suggestion title="Daily 10-min challenge" desc="A bite-size quiz to stay sharp." />
              <Suggestion title="Read-aloud story" desc="The Little Fox — beginner level." />
              <Suggestion title="Vocabulary boost" desc="Food Fun unit unlocked." />
            </ul>
          </Panel>
        </div>
      </main>
    </div>
  );
}

function Metric({ label, value, delta }: { label: string; value: string; delta: string }) {
  return (
    <div className="rounded-2xl bg-white/20 p-4 backdrop-blur">
      <p className="text-xs font-bold uppercase tracking-wider text-white/80">{label}</p>
      <p className="mt-1 text-2xl font-extrabold">{value}</p>
      <p className="text-xs font-semibold text-white/90">{delta} vs last week</p>
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