import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Logo } from "@/components/Logo";
import { Play, Repeat, Check, X, ArrowRight, ArrowLeft, Volume2, Sparkles } from "lucide-react";

export const Route = createFileRoute("/student/listening")({
  head: () => ({
    meta: [
      { title: "Listening — English Buddy" },
      { name: "description", content: "Listen and answer to level up your English." },
    ],
  }),
  component: ListeningModule,
});

type Exercise = {
  audio: string;
  question: string;
  options: string[];
  answer: number;
};

const exercises: Exercise[] = [
  {
    audio: "Hello! My name is Mia. I am seven years old.",
    question: "What is her name?",
    options: ["Mia", "Lily", "Anna", "Sara"],
    answer: 0,
  },
  {
    audio: "I have a red apple and a yellow banana for lunch.",
    question: "Which fruits did you hear?",
    options: ["Apple and orange", "Apple and banana", "Banana and grape", "Apple and pear"],
    answer: 1,
  },
  {
    audio: "The cat is sleeping on the soft blue chair.",
    question: "Where is the cat sleeping?",
    options: ["On the bed", "On the floor", "On the chair", "On the table"],
    answer: 2,
  },
  {
    audio: "Good morning! It is sunny and warm today.",
    question: "How is the weather?",
    options: ["Rainy and cold", "Snowy", "Sunny and warm", "Windy"],
    answer: 2,
  },
];

function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = 0.9;
  u.pitch = 1.05;
  window.speechSynthesis.speak(u);
}

function ListeningModule() {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [done, setDone] = useState(false);
  const [score, setScore] = useState(0);

  const total = exercises.length;
  const ex = exercises[index];
  const progress = useMemo(
    () => (done ? 100 : ((index + (locked ? 1 : 0)) / total) * 100),
    [index, locked, total, done],
  );

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const play = () => {
    setHasPlayed(true);
    setSpeaking(true);
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setTimeout(() => setSpeaking(false), 1500);
      return;
    }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(ex.audio);
    u.lang = "en-US";
    u.rate = 0.9;
    u.pitch = 1.05;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  };

  const choose = (i: number) => {
    if (locked) return;
    setSelected(i);
    setLocked(true);
    if (i === ex.answer) setScore((s) => s + 1);
  };

  const next = () => {
    if (index + 1 >= total) {
      setDone(true);
      return;
    }
    setIndex((n) => n + 1);
    setSelected(null);
    setLocked(false);
    setHasPlayed(false);
  };

  const restart = () => {
    setIndex(0);
    setSelected(null);
    setLocked(false);
    setHasPlayed(false);
    setDone(false);
    setScore(0);
  };

  const isCorrect = locked && selected === ex.answer;
  const isWrong = locked && selected !== ex.answer;

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
        {/* Progress bar */}
        <div className="mb-2 flex items-center justify-between text-sm font-bold text-foreground">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 shadow-soft backdrop-blur">
            🎧 Listening
          </span>
          <span className="text-muted-foreground">
            {Math.min(index + 1, total)} / {total}
          </span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-white/60 shadow-soft">
          <div
            className="h-full rounded-full bg-student-gradient transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {done ? (
          <FinishedCard score={score} total={total} onRestart={restart} />
        ) : (
          <section className="mt-8 rounded-[2rem] bg-card p-8 shadow-soft md:p-10">
            {/* Audio player */}
            <div className="flex flex-col items-center text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Tap to listen
              </p>
              <button
                onClick={play}
                aria-label="Play audio"
                className={`mt-4 grid h-32 w-32 place-items-center rounded-full bg-student-gradient text-white shadow-pop transition-transform hover:scale-105 active:scale-95 ${
                  speaking ? "animate-pulse" : ""
                }`}
              >
                {speaking ? <Volume2 className="h-14 w-14" /> : <Play className="h-14 w-14" fill="currentColor" />}
              </button>
              <button
                onClick={play}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-muted px-5 py-2.5 text-sm font-bold text-foreground hover:bg-secondary/20"
              >
                <Repeat className="h-4 w-4" /> Listen and Repeat
              </button>
              {!hasPlayed && (
                <p className="mt-3 text-xs font-semibold text-muted-foreground">
                  Press play to hear the clip
                </p>
              )}
            </div>

            {/* Question */}
            <h2 className="mt-10 text-center text-2xl font-extrabold md:text-3xl">
              {ex.question}
            </h2>

            {/* Options */}
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {ex.options.map((opt, i) => {
                const isSel = selected === i;
                const isAns = ex.answer === i;
                let cls =
                  "border-border bg-card hover:-translate-y-0.5 hover:border-primary/50 hover:bg-secondary/10";
                if (locked) {
                  if (isAns)
                    cls =
                      "border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-400/40";
                  else if (isSel)
                    cls = "border-rose-500 bg-rose-50 text-rose-700";
                  else cls = "border-border bg-card opacity-60";
                }
                return (
                  <button
                    key={opt}
                    disabled={locked || !hasPlayed}
                    onClick={() => choose(i)}
                    className={`group flex items-center justify-between gap-3 rounded-2xl border-2 px-5 py-4 text-left text-lg font-bold shadow-sm transition-all disabled:cursor-not-allowed disabled:opacity-60 ${cls}`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="grid h-9 w-9 place-items-center rounded-xl bg-muted text-sm font-extrabold text-foreground group-hover:bg-secondary/20">
                        {String.fromCharCode(65 + i)}
                      </span>
                      {opt}
                    </span>
                    {locked && isAns && <Check className="h-6 w-6 text-emerald-500" strokeWidth={3} />}
                    {locked && isSel && !isAns && <X className="h-6 w-6 text-rose-500" strokeWidth={3} />}
                  </button>
                );
              })}
            </div>
            {!hasPlayed && (
              <p className="mt-4 text-center text-xs font-semibold text-muted-foreground">
                Listen first, then choose your answer.
              </p>
            )}

            {/* Feedback */}
            {isCorrect && <CorrectBanner onNext={next} isLast={index + 1 >= total} />}
            {isWrong && (
              <div className="mt-8 flex flex-col items-center gap-4 rounded-2xl bg-rose-50 p-5 text-center">
                <p className="text-lg font-extrabold text-rose-700">
                  Not quite! The answer is "{ex.options[ex.answer]}".
                </p>
                <button
                  onClick={next}
                  className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-6 py-3 font-extrabold text-white shadow-pop hover:scale-[1.02]"
                >
                  Keep going <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

function CorrectBanner({ onNext, isLast }: { onNext: () => void; isLast: boolean }) {
  return (
    <div className="mt-8 flex flex-col items-center gap-4 rounded-2xl bg-emerald-50 p-5 text-center animate-[fade-in_0.3s_ease-out]">
      <div className="grid h-16 w-16 place-items-center rounded-full bg-emerald-500 text-white shadow-pop animate-[scale-in_0.3s_ease-out]">
        <Check className="h-9 w-9" strokeWidth={3.5} />
      </div>
      <p className="text-xl font-extrabold text-emerald-700">Great job! 🎉</p>
      <button
        onClick={onNext}
        className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-7 py-3 text-lg font-extrabold text-white shadow-pop transition-transform hover:scale-105"
      >
        {isLast ? "Finish" : "Next"} <ArrowRight className="h-5 w-5" />
      </button>
    </div>
  );
}

function FinishedCard({
  score,
  total,
  onRestart,
}: {
  score: number;
  total: number;
  onRestart: () => void;
}) {
  return (
    <section className="mt-10 rounded-[2rem] bg-student-gradient p-10 text-center text-white shadow-soft">
      <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-white/25 backdrop-blur">
        <Sparkles className="h-10 w-10" />
      </div>
      <h2 className="mt-5 text-3xl font-extrabold md:text-4xl">Mission complete!</h2>
      <p className="mt-2 text-lg font-semibold text-white/90">
        You got {score} of {total} correct.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          onClick={onRestart}
          className="rounded-full bg-white/20 px-6 py-3 font-extrabold backdrop-blur hover:bg-white/30"
        >
          Play again
        </button>
        <Link
          to="/student"
          className="rounded-full bg-accent px-6 py-3 font-extrabold text-accent-foreground shadow-pop hover:scale-105"
        >
          Back to dashboard
        </Link>
      </div>
    </section>
  );
}