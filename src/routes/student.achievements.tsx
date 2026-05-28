import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import {
  ArrowLeft,
  Flame,
  BookOpen,
  Mic,
  PenLine,
  Headphones,
  Trophy,
  Star,
  Sparkles,
  Crown,
  Lock,
} from "lucide-react";
import {
  getCompletedSteps,
  getXP,
  getLevel,
  STREAK_DAYS,
  type StepKey,
} from "@/lib/progress";

export const Route = createFileRoute("/student/achievements")({
  head: () => ({
    meta: [{ title: "Achievements — English Buddy" }],
  }),
  component: AchievementsPage,
});

type Badge = {
  id: string;
  title: string;
  desc: string;
  icon: typeof Trophy;
  unlocked: (s: { steps: Record<StepKey, boolean>; xp: number; streak: number }) => boolean;
  gradient: string;
};

const BADGES: Badge[] = [
  {
    id: "first",
    title: "First Lesson",
    desc: "Finish your first activity",
    icon: Sparkles,
    gradient: "from-sky-400 to-blue-600",
    unlocked: ({ steps }) => Object.values(steps).some(Boolean),
  },
  {
    id: "listener",
    title: "Sharp Ears",
    desc: "Complete a listening lesson",
    icon: Headphones,
    gradient: "from-cyan-400 to-sky-600",
    unlocked: ({ steps }) => steps.listen,
  },
  {
    id: "vocab",
    title: "Vocabulary Master",
    desc: "Complete vocabulary practice",
    icon: BookOpen,
    gradient: "from-violet-400 to-fuchsia-600",
    unlocked: ({ steps }) => steps.vocab,
  },
  {
    id: "speak",
    title: "Brave Voice",
    desc: "Finish a speaking session",
    icon: Mic,
    gradient: "from-rose-400 to-pink-600",
    unlocked: ({ steps }) => steps.speak,
  },
  {
    id: "writer",
    title: "Word Crafter",
    desc: "Complete a writing lab",
    icon: PenLine,
    gradient: "from-emerald-400 to-teal-600",
    unlocked: ({ steps }) => steps.write,
  },
  {
    id: "all4",
    title: "Daily Champion",
    desc: "Finish all 4 daily steps",
    icon: Crown,
    gradient: "from-amber-400 to-orange-600",
    unlocked: ({ steps }) => Object.values(steps).every(Boolean),
  },
  {
    id: "streak7",
    title: "7-Day Streak",
    desc: "Practice 7 days in a row",
    icon: Flame,
    gradient: "from-orange-400 to-rose-600",
    unlocked: ({ streak }) => streak >= 7,
  },
  {
    id: "xp500",
    title: "Star Collector",
    desc: "Reach 500 XP",
    icon: Star,
    gradient: "from-yellow-400 to-amber-500",
    unlocked: ({ xp }) => xp >= 500,
  },
  {
    id: "xp1000",
    title: "English Hero",
    desc: "Reach 1,000 XP",
    icon: Trophy,
    gradient: "from-fuchsia-500 to-purple-700",
    unlocked: ({ xp }) => xp >= 1000,
  },
];

function AchievementsPage() {
  const [snapshot, setSnapshot] = useState(() => ({
    steps: getCompletedSteps(),
    xp: getXP(),
    streak: STREAK_DAYS,
  }));

  useEffect(() => {
    const sync = () =>
      setSnapshot({ steps: getCompletedSteps(), xp: getXP(), streak: STREAK_DAYS });
    window.addEventListener("eb-progress", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("eb-progress", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const unlockedCount = BADGES.filter((b) => b.unlocked(snapshot)).length;
  const level = getLevel(snapshot.xp);

  return (
    <div className="min-h-screen bg-app-gradient">
      <header className="flex items-center justify-between px-6 py-6 md:px-12">
        <Logo />
        <Link
          to="/student"
          className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-4 py-2 text-sm font-bold text-primary shadow-soft backdrop-blur hover:bg-white"
        >
          <ArrowLeft className="h-4 w-4" /> Dashboard
        </Link>
      </header>

      <main className="mx-auto max-w-5xl px-6 pb-20">
        <section className="overflow-hidden rounded-[2rem] bg-student-gradient p-8 text-white shadow-soft md:p-10">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-white/85">Trophy Room</p>
              <h1 className="mt-1 text-4xl font-extrabold md:text-5xl">Achievements 🏆</h1>
              <p className="mt-2 max-w-md text-white/90">
                Collect badges as you learn. Locked ones light up when you earn them!
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center">
              <Pill label="Unlocked" value={`${unlockedCount} / ${BADGES.length}`} />
              <Pill label="Level" value={String(level)} />
            </div>
          </div>
        </section>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {BADGES.map((b) => {
            const unlocked = b.unlocked(snapshot);
            const Icon = b.icon;
            return (
              <article
                key={b.id}
                className={`group relative overflow-hidden rounded-3xl border-2 bg-card p-6 shadow-soft transition-all ${
                  unlocked
                    ? "border-accent/60 hover:-translate-y-1"
                    : "border-border opacity-95"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`relative grid h-16 w-16 shrink-0 place-items-center rounded-2xl text-white ${
                      unlocked
                        ? `bg-gradient-to-br ${b.gradient} animate-badge-glow`
                        : "bg-muted text-muted-foreground grayscale"
                    }`}
                  >
                    {unlocked ? (
                      <Icon className="h-8 w-8 drop-shadow" />
                    ) : (
                      <Lock className="h-7 w-7" strokeWidth={2.5} />
                    )}
                  </div>
                  <div>
                    <h3
                      className={`text-lg font-extrabold ${
                        unlocked ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {b.title}
                    </h3>
                    <p className="mt-0.5 text-sm text-muted-foreground">{b.desc}</p>
                  </div>
                </div>
                <p
                  className={`mt-5 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold ${
                    unlocked
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {unlocked ? "✓ Unlocked" : "Locked"}
                </p>
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
}

function Pill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/20 px-4 py-3 backdrop-blur">
      <p className="text-[10px] font-bold uppercase tracking-wider text-white/85">{label}</p>
      <p className="text-xl font-extrabold">{value}</p>
    </div>
  );
}