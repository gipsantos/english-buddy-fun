import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";

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
          <Panel title="Recent activity" icon="📘">
            <ul className="space-y-3 text-sm">
              <Activity emoji="🦁" text="Finished Animal Words — 100%" />
              <Activity emoji="🎨" text="Practiced Colors & Shapes" />
              <Activity emoji="⭐" text="Earned 25 stars" />
              <Activity emoji="🔥" text="Kept a 5-day streak" />
            </ul>
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