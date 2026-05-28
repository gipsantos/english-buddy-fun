import { createFileRoute, Link, Outlet, useMatches } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { Flame, Headphones, BookOpen, Mic, PenLine, Check, Lock, Star, Sparkles } from "lucide-react";
import { getCompletedSteps, getXP, type StepKey } from "@/lib/progress";

export const Route = createFileRoute("/student")({
  head: () => ({
    meta: [
      { title: "Student Dashboard — English Buddy" },
      { name: "description", content: "Your learning adventure starts here." },
    ],
  }),
  component: StudentDashboard,
});

const STREAK = 5;
const XP_GOAL = 500;

type Step = {
  key: StepKey;
  label: string;
  icon: typeof Headphones;
  to: "/student/listening" | "/student/vocabulary" | "/student/speaking" | "/student/writing";
};

const stepDefs: Step[] = [
  { key: "listen", label: "Listening", icon: Headphones, to: "/student/listening" },
  { key: "vocab", label: "Vocabulary", icon: BookOpen, to: "/student/vocabulary" },
  { key: "speak", label: "Speaking", icon: Mic, to: "/student/speaking" },
  { key: "write", label: "Writing", icon: PenLine, to: "/student/writing" },
];

const TOTAL_LEVELS = 12;

function StudentDashboard() {
  const matches = useMatches();
  const hasChild = matches.some(
    (m) => m.routeId !== "/student" && m.routeId.startsWith("/student/"),
  );
  const [completed, setCompleted] = useState(() => getCompletedSteps());
  const [xp, setXp] = useState(() => getXP());

  useEffect(() => {
    const sync = () => {
      setCompleted(getCompletedSteps());
      setXp(getXP());
    };
    sync();
    window.addEventListener("eb-progress", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("eb-progress", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const steps = stepDefs.map((s) => ({ ...s, done: completed[s.key] }));
  const nextStep = steps.find((s) => !s.done);
  const doneCount = steps.filter((s) => s.done).length;
  const xpPct = Math.min(100, (xp / XP_GOAL) * 100);
  const unlocked = Math.max(1, doneCount + 1);

  if (hasChild) return <Outlet />;

  return (
    <div className="min-h-screen bg-app-gradient">
      <header className="flex items-center justify-between px-6 py-6 md:px-12">
        <Logo />
        <Link to="/" className="rounded-full bg-white/80 px-4 py-2 text-sm font-bold text-primary shadow-soft backdrop-blur hover:bg-white">
          ← Switch profile
        </Link>
      </header>

      <main className="mx-auto max-w-5xl px-6 pb-20">
        {/* Streak + XP banner */}
        <section className="grid gap-5 md:grid-cols-[1fr_2fr]">
          <div className="flex items-center gap-4 rounded-3xl bg-gradient-to-br from-orange-400 to-rose-500 p-6 text-white shadow-soft">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/25 backdrop-blur">
              <Flame className="h-9 w-9 drop-shadow" fill="currentColor" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-white/85">Streak</p>
              <p className="text-3xl font-extrabold leading-none">{STREAK} days 🔥</p>
              <p className="mt-1 text-xs font-semibold text-white/85">Keep it burning!</p>
            </div>
          </div>

          <div className="rounded-3xl bg-card p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <p className="text-sm font-extrabold uppercase tracking-wider text-muted-foreground">XP Progress</p>
              </div>
              <p className="text-sm font-bold text-foreground">
                {xp} / {XP_GOAL} XP
              </p>
            </div>
            <div className="relative mt-4 h-5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-student-gradient shadow-pop transition-all"
                style={{ width: `${xpPct}%` }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 text-lg"
                style={{ left: `calc(${xpPct}% - 14px)` }}
              >
                ⭐
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              {Math.max(0, XP_GOAL - xp)} XP to your next level up!
            </p>
          </div>
        </section>

        {/* Today's Mission */}
        <section className="mt-8 overflow-hidden rounded-[2rem] bg-student-gradient p-8 text-white shadow-soft md:p-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-white/80">Today's Mission</p>
              <h1 className="mt-1 text-3xl font-extrabold md:text-4xl">Become a Word Wizard 🧙‍♂️</h1>
            </div>
            <p className="rounded-full bg-white/20 px-4 py-1.5 text-sm font-bold backdrop-blur">
              {doneCount} / {steps.length} complete
            </p>
          </div>

          {/* Step tracker */}
          <div className="relative mt-8">
            <div className="absolute left-0 right-0 top-7 h-1.5 rounded-full bg-white/25" />
            <div
              className="absolute left-0 top-7 h-1.5 rounded-full bg-white transition-all"
              style={{ width: `${(doneCount / (steps.length - 1)) * 100}%` }}
            />
            <ol className="relative grid grid-cols-4 gap-2">
              {steps.map((s, i) => {
                const Icon = s.icon;
                const isNext = !s.done && steps.slice(0, i).every((p) => p.done);
                return (
                  <li key={s.key} className="flex flex-col items-center text-center">
                    <div
                      className={`grid h-14 w-14 place-items-center rounded-full border-4 transition-all ${
                        s.done
                          ? "border-white bg-white text-primary"
                          : isNext
                            ? "border-white bg-accent text-accent-foreground scale-110 shadow-pop"
                            : "border-white/40 bg-white/10 text-white/70"
                      }`}
                    >
                      {s.done ? <Check className="h-6 w-6" strokeWidth={3} /> : <Icon className="h-6 w-6" />}
                    </div>
                    <p className="mt-2 text-xs font-bold uppercase tracking-wider md:text-sm">
                      {i + 1}. {s.label}
                    </p>
                    {isNext && (
                      <span className="mt-1 rounded-full bg-white/25 px-2 py-0.5 text-[10px] font-bold backdrop-blur">
                        UP NEXT
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>

          {nextStep ? (
            <Link
              to={nextStep.to}
              className="mt-10 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-8 py-4 text-lg font-extrabold text-accent-foreground shadow-pop transition-transform hover:scale-[1.02] md:w-auto"
            >
              <Sparkles className="h-5 w-5" />
              Start Mission: {nextStep.label}
            </Link>
          ) : (
            <p className="mt-10 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white/25 px-8 py-4 text-lg font-extrabold backdrop-blur md:w-auto">
              🎉 All steps done today!
            </p>
          )}
        </section>

        {/* Star Map */}
        <section className="mt-10">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-extrabold">Star Map ✨</h2>
              <p className="text-sm text-muted-foreground">Climb the path, one star at a time.</p>
            </div>
            <p className="rounded-full bg-white/70 px-3 py-1 text-xs font-bold text-primary shadow-soft backdrop-blur">
              {unlocked} / {TOTAL_LEVELS} unlocked
            </p>
          </div>
          <StarMap unlocked={unlocked} total={TOTAL_LEVELS} />
        </section>
      </main>
    </div>
  );
}

function StarMap({ unlocked, total }: { unlocked: number; total: number }) {
  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-card p-8 shadow-soft">
      {/* decorative clouds */}
      <div className="pointer-events-none absolute -top-10 right-10 h-32 w-32 rounded-full bg-secondary/20 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-10 left-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />

      <div className="relative grid grid-cols-3 gap-y-10 sm:grid-cols-4">
        {Array.from({ length: total }).map((_, i) => {
          const isUnlocked = i < unlocked;
          const isCurrent = i === unlocked - 1;
          const isNext = i === unlocked;
          // zig-zag the layout
          const row = Math.floor(i / 4);
          const offset = row % 2 === 0 ? "translate-y-0" : "translate-y-6";
          return (
            <div key={i} className={`flex flex-col items-center ${offset}`}>
              <div
                className={`relative grid h-20 w-20 place-items-center rounded-full transition-transform ${
                  isUnlocked
                    ? "bg-student-gradient text-white shadow-pop hover:scale-110"
                    : isNext
                      ? "bg-accent/40 text-accent-foreground ring-4 ring-accent ring-offset-2 ring-offset-card animate-pulse"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {isUnlocked ? (
                  <Star className="h-9 w-9" fill="currentColor" strokeWidth={1.5} />
                ) : isNext ? (
                  <Star className="h-9 w-9" strokeWidth={2.5} />
                ) : (
                  <Lock className="h-7 w-7" strokeWidth={2.5} />
                )}
                {isCurrent && (
                  <span className="absolute -bottom-2 rounded-full bg-card px-2 py-0.5 text-[10px] font-extrabold text-primary shadow">
                    YOU
                  </span>
                )}
              </div>
              <p
                className={`mt-3 text-xs font-bold ${
                  isUnlocked ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                Level {i + 1}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}