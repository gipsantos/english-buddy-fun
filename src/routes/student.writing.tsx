import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { Celebration } from "@/components/Celebration";
import { ArrowLeft, ArrowRight, Check, X, Lightbulb } from "lucide-react";
import { completeStep, addXP } from "@/lib/progress";

export const Route = createFileRoute("/student/writing")({
  head: () => ({
    meta: [{ title: "Writing — English Buddy" }],
  }),
  component: WritingLab,
});

type Item = { before: string; after: string; answers: string[]; hint: string };

const items: Item[] = [
  { before: "I", after: "to school every day.", answers: ["go", "walk"], hint: "A verb of movement" },
  { before: "She", after: "an apple for lunch.", answers: ["eats", "has"], hint: "Present tense, 3rd person" },
  { before: "We are playing", after: "the park.", answers: ["in", "at"], hint: "A small word for places" },
  { before: "The cat is", after: "the chair.", answers: ["on", "under", "near"], hint: "Where is the cat?" },
];

function check(input: string, answers: string[]) {
  const v = input.trim().toLowerCase().replace(/[.,!?]/g, "");
  return answers.some((a) => a.toLowerCase() === v);
}

function WritingLab() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<"idle" | "right" | "wrong">("idle");
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  const total = items.length;
  const item = items[index];
  const progress = ((index + (status === "right" ? 1 : 0)) / total) * 100;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || status === "right") return;
    if (check(value, item.answers)) {
      setStatus("right");
      setScore((s) => s + 1);
    } else {
      setStatus("wrong");
    }
  };

  const next = () => {
    if (index + 1 >= total) {
      addXP(35);
      completeStep("write");
      setCelebrate(true);
      return;
    }
    setIndex(index + 1);
    setValue("");
    setStatus("idle");
    setShowHint(false);
  };

  return (
    <div className="min-h-screen bg-app-gradient">
      <header className="flex items-center justify-between px-6 py-6 md:px-12">
        <Logo />
        <Link
          to="/student"
          className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-4 py-2 text-sm font-bold text-primary shadow-soft backdrop-blur hover:bg-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
      </header>

      <main className="mx-auto max-w-2xl px-6 pb-20">
        <div className="mb-2 flex items-center justify-between text-sm font-bold">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 shadow-soft backdrop-blur">
            ✍️ Writing
          </span>
          <span className="text-muted-foreground">
            {index + 1} / {total}
          </span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-white/60 shadow-soft">
          <div
            className="h-full rounded-full bg-student-gradient transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <section className="mt-8 rounded-[2rem] bg-card p-8 shadow-soft md:p-10">
          <p className="text-center text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Fill in the blank
          </p>

          <form
            onSubmit={submit}
            className="mt-6 flex flex-wrap items-end justify-center gap-3 text-2xl font-extrabold leading-snug md:text-3xl"
          >
            <span>{item.before}</span>
            <input
              autoFocus
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                if (status !== "idle") setStatus("idle");
              }}
              placeholder="___"
              className={`w-44 rounded-2xl border-b-4 bg-muted/60 px-4 py-2 text-center font-extrabold outline-none transition-colors focus:bg-secondary/10 ${
                status === "right"
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : status === "wrong"
                    ? "border-rose-500 bg-rose-50 text-rose-700 animate-[scale-in_0.15s]"
                    : "border-primary/40 focus:border-primary"
              }`}
            />
            <span>{item.after}</span>
          </form>

          <div className="mt-6 flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => setShowHint((s) => !s)}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline"
            >
              <Lightbulb className="h-4 w-4" /> {showHint ? "Hide hint" : "Need a hint?"}
            </button>
            {showHint && (
              <p className="rounded-xl bg-accent/30 px-4 py-2 text-sm font-semibold text-foreground">
                💡 {item.hint}
              </p>
            )}
          </div>

          {status === "wrong" && (
            <div className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-rose-50 p-3 text-rose-700">
              <X className="h-5 w-5" strokeWidth={3} />
              <p className="font-extrabold">Not quite — try again!</p>
            </div>
          )}

          {status === "right" ? (
            <div className="mt-6 flex flex-col items-center gap-4 rounded-2xl bg-emerald-50 p-5 animate-[fade-in_0.3s]">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-emerald-500 text-white shadow-pop animate-[scale-in_0.3s]">
                <Check className="h-8 w-8" strokeWidth={3.5} />
              </div>
              <p className="text-lg font-extrabold text-emerald-700">Perfect! ✨</p>
              <button
                onClick={next}
                className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-7 py-3 text-lg font-extrabold text-white shadow-pop hover:scale-105"
              >
                {index + 1 >= total ? "Finish" : "Next"} <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <div className="mt-8 flex justify-center">
              <button
                onClick={submit as never}
                disabled={!value.trim()}
                className="rounded-full bg-student-gradient px-8 py-3.5 text-lg font-extrabold text-white shadow-pop transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Check answer
              </button>
            </div>
          )}

          <p className="mt-6 text-center text-xs font-semibold text-muted-foreground">
            Score: {score} / {total}
          </p>
        </section>
      </main>

      {celebrate && (
        <Celebration
          title="You're a writer! ✍️"
          subtitle={`You got ${score} of ${total} correct.`}
          xp={35}
          onContinue={() => navigate({ to: "/student" })}
        />
      )}
    </div>
  );
}