import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/student")({
  head: () => ({
    meta: [
      { title: "Student Dashboard — English Buddy" },
      { name: "description", content: "Your learning adventure starts here." },
    ],
  }),
  component: StudentDashboard,
});

const lessons = [
  { title: "Animal Words", emoji: "🦁", progress: 80 },
  { title: "Colors & Shapes", emoji: "🎨", progress: 45 },
  { title: "Family", emoji: "👨‍👩‍👧", progress: 20 },
  { title: "Food Fun", emoji: "🍎", progress: 0 },
];

function StudentDashboard() {
  return (
    <div className="min-h-screen bg-app-gradient">
      <header className="flex items-center justify-between px-6 py-6 md:px-12">
        <Logo />
        <Link to="/" className="rounded-full bg-white/80 px-4 py-2 text-sm font-bold text-primary shadow-soft backdrop-blur hover:bg-white">
          ← Switch profile
        </Link>
      </header>

      <main className="mx-auto max-w-5xl px-6 pb-16">
        <div className="rounded-[2rem] bg-student-gradient p-8 text-white shadow-soft md:p-10">
          <p className="text-sm font-bold uppercase tracking-wider text-white/80">Hi there!</p>
          <h1 className="mt-2 text-4xl font-extrabold md:text-5xl">Ready for today's quest? 🚀</h1>
          <div className="mt-6 flex flex-wrap gap-4">
            <Stat icon="🔥" label="Streak" value="5 days" />
            <Stat icon="⭐" label="Stars" value="128" />
            <Stat icon="💎" label="Gems" value="42" />
          </div>
        </div>

        <h2 className="mt-10 mb-4 text-2xl font-extrabold">Pick a lesson</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          {lessons.map((l) => (
            <div key={l.title} className="rounded-3xl bg-card p-6 shadow-soft transition-transform hover:-translate-y-1">
              <div className="flex items-center gap-4">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-secondary/20 text-3xl">{l.emoji}</div>
                <div>
                  <h3 className="text-lg font-extrabold">{l.title}</h3>
                  <p className="text-sm text-muted-foreground">{l.progress}% complete</p>
                </div>
              </div>
              <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-student-gradient" style={{ width: `${l.progress}%` }} />
              </div>
              <button className="mt-5 w-full rounded-full bg-student-gradient py-3 font-bold text-white shadow-pop transition-transform hover:scale-[1.02]">
                {l.progress > 0 ? "Continue" : "Start"}
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white/20 px-4 py-3 backdrop-blur">
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-white/80">{label}</p>
        <p className="text-lg font-extrabold">{value}</p>
      </div>
    </div>
  );
}