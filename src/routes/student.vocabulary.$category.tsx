import { createFileRoute, Link, useParams, Navigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Volume2, ArrowRight, ArrowLeft, Check, Sparkles, RotateCcw } from "lucide-react";
import { completeStep, addXP, recordLesson, recordWords } from "@/lib/progress";

export const Route = createFileRoute("/student/vocabulary/$category")({
  component: CategoryPage,
});

type Word = { en: string; pt: string; emoji: string };

const WORDS: Record<string, { title: string; gradient: string; words: Word[] }> = {
  school: {
    title: "School",
    gradient: "from-sky-400 to-blue-600",
    words: [
      { en: "Book", pt: "Livro", emoji: "📘" },
      { en: "Pencil", pt: "Lápis", emoji: "✏️" },
      { en: "Teacher", pt: "Professor", emoji: "🧑‍🏫" },
      { en: "Backpack", pt: "Mochila", emoji: "🎒" },
      { en: "Chair", pt: "Cadeira", emoji: "🪑" },
    ],
  },
  food: {
    title: "Food",
    gradient: "from-rose-400 to-orange-500",
    words: [
      { en: "Apple", pt: "Maçã", emoji: "🍎" },
      { en: "Bread", pt: "Pão", emoji: "🍞" },
      { en: "Milk", pt: "Leite", emoji: "🥛" },
      { en: "Cheese", pt: "Queijo", emoji: "🧀" },
      { en: "Banana", pt: "Banana", emoji: "🍌" },
    ],
  },
  family: {
    title: "Family",
    gradient: "from-violet-400 to-fuchsia-600",
    words: [
      { en: "Mother", pt: "Mãe", emoji: "👩" },
      { en: "Father", pt: "Pai", emoji: "👨" },
      { en: "Sister", pt: "Irmã", emoji: "👧" },
      { en: "Brother", pt: "Irmão", emoji: "👦" },
      { en: "Baby", pt: "Bebê", emoji: "👶" },
    ],
  },
};

function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = 0.85;
  u.pitch = 1.1;
  window.speechSynthesis.speak(u);
}

function CategoryPage() {
  const { category } = useParams({ from: "/student/vocabulary/$category" });
  const data = WORDS[category];

  if (!data) return <Navigate to="/student/vocabulary" />;

  const [phase, setPhase] = useState<"cards" | "game" | "done">("cards");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const total = data.words.length;
  const progress =
    phase === "cards" ? ((index + 1) / total) * 50 : phase === "game" ? 50 : 100;

  return (
    <main className="mx-auto max-w-2xl px-6 pb-20">
      <div className="mb-2 flex items-center justify-between text-sm font-bold">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 shadow-soft backdrop-blur">
          📚 {data.title}
        </span>
        <span className="text-muted-foreground">
          {phase === "cards" ? `Card ${index + 1} / ${total}` : phase === "game" ? "Match the Word" : "Complete!"}
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-white/60 shadow-soft">
        <div
          className="h-full rounded-full bg-student-gradient transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {phase === "cards" && (
        <Flashcards
          words={data.words}
          gradient={data.gradient}
          index={index}
          onPrev={() => setIndex((i) => Math.max(0, i - 1))}
          onNext={() => {
            if (index + 1 >= total) setPhase("game");
            else setIndex(index + 1);
          }}
        />
      )}

      {phase === "game" && (
        <MatchGame
          words={data.words}
          onWin={() => {
            addXP(40);
            completeStep("vocab");
            recordLesson({ title: `Vocabulary — ${data.title}`, emoji: "📚", xp: 40 });
            recordWords(data.words.map((w) => w.en));
            setPhase("done");
          }}
        />
      )}

      {phase === "done" && (
        <section className="mt-10 rounded-[2rem] bg-student-gradient p-10 text-center text-white shadow-soft">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-white/25 backdrop-blur">
            <Sparkles className="h-10 w-10" />
          </div>
          <h2 className="mt-5 text-3xl font-extrabold md:text-4xl">+40 XP earned!</h2>
          <p className="mt-2 text-lg font-semibold text-white/90">
            Vocabulary step complete. Way to go! 🎉
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/student/vocabulary"
              className="rounded-full bg-white/20 px-6 py-3 font-extrabold backdrop-blur hover:bg-white/30"
            >
              Pick another world
            </Link>
            <Link
              to="/student"
              className="rounded-full bg-accent px-6 py-3 font-extrabold text-accent-foreground shadow-pop hover:scale-105"
            >
              Back to dashboard
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}

function Flashcards({
  words,
  gradient,
  index,
  onPrev,
  onNext,
}: {
  words: Word[];
  gradient: string;
  index: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  const w = words[index];
  return (
    <>
      <section
        key={index}
        className={`mt-8 overflow-hidden rounded-[2rem] bg-gradient-to-br ${gradient} p-10 text-center text-white shadow-soft animate-[scale-in_0.25s_ease-out]`}
      >
        <div className="mx-auto grid h-48 w-48 place-items-center rounded-3xl bg-white/25 text-[7rem] leading-none backdrop-blur md:h-56 md:w-56">
          {w.emoji}
        </div>
        <h2 className="mt-6 text-5xl font-extrabold tracking-tight md:text-6xl">{w.en}</h2>
        <p className="mt-2 text-lg font-semibold text-white/80">{w.pt}</p>
        <button
          onClick={() => speak(w.en)}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-extrabold text-foreground shadow-pop hover:scale-105"
        >
          <Volume2 className="h-5 w-5" /> Hear it
        </button>
      </section>

      <div className="mt-6 flex items-center justify-between gap-3">
        <button
          onClick={onPrev}
          disabled={index === 0}
          className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-5 py-3 font-bold text-foreground shadow-soft backdrop-blur disabled:opacity-40"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div className="flex gap-1.5">
          {words.map((_, i) => (
            <span
              key={i}
              className={`h-2.5 w-2.5 rounded-full transition-all ${i === index ? "w-6 bg-primary" : "bg-white/70"}`}
            />
          ))}
        </div>
        <button
          onClick={onNext}
          className="inline-flex items-center gap-1.5 rounded-full bg-student-gradient px-6 py-3 font-extrabold text-white shadow-pop hover:scale-105"
        >
          {index + 1 >= words.length ? "Play game" : "Next"} <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </>
  );
}

function MatchGame({ words, onWin }: { words: Word[]; onWin: () => void }) {
  const [shuffledTargets] = useState(() => [...words].sort(() => Math.random() - 0.5));
  const [matched, setMatched] = useState<Record<string, boolean>>({});
  const [dragging, setDragging] = useState<string | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [wrong, setWrong] = useState<string | null>(null);

  const allDone = Object.keys(matched).length === words.length;

  useEffect(() => {
    if (allDone) {
      const t = setTimeout(onWin, 900);
      return () => clearTimeout(t);
    }
  }, [allDone, onWin]);

  const tryMatch = (englishWord: string, targetEn: string) => {
    if (englishWord === targetEn) {
      setMatched((m) => ({ ...m, [englishWord]: true }));
      speak(englishWord);
    } else {
      setWrong(englishWord);
      setTimeout(() => setWrong(null), 600);
    }
    setDragging(null);
    setPicked(null);
  };

  const reset = () => {
    setMatched({});
    setPicked(null);
  };

  return (
    <section className="mt-8 rounded-[2rem] bg-card p-4 shadow-soft sm:p-6 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold">Match the Word 🎯</h2>
          <p className="text-sm text-muted-foreground">Drag each English word onto its picture.</p>
        </div>
        <button
          onClick={reset}
          className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-bold hover:bg-secondary/20"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reset
        </button>
      </div>

      {/* Hint for mobile */}
      <p className="mt-3 text-xs text-muted-foreground sm:hidden">
        Tap a word, then tap its picture.
      </p>

      {/* Word chips */}
      <div className="mt-5 flex flex-wrap gap-2 sm:mt-6 sm:gap-3">
        {words.map((w) => {
          const isMatched = matched[w.en];
          const isWrong = wrong === w.en;
          const isPicked = picked === w.en;
          return (
            <button
              key={w.en}
              draggable={!isMatched}
              onDragStart={() => setDragging(w.en)}
              onDragEnd={() => setDragging(null)}
              onClick={() => {
                if (isMatched) return;
                speak(w.en);
                setPicked((p) => (p === w.en ? null : w.en));
              }}
              className={`select-none rounded-full px-4 py-2.5 text-sm font-extrabold shadow-pop transition-all sm:px-5 sm:py-3 sm:text-base ${
                isMatched
                  ? "cursor-default bg-emerald-100 text-emerald-700 opacity-60"
                  : isWrong
                    ? "cursor-grab bg-rose-500 text-white animate-[scale-in_0.2s] ring-4 ring-rose-300"
                    : dragging === w.en || isPicked
                      ? "cursor-grabbing bg-primary text-primary-foreground scale-105"
                      : "cursor-grab bg-student-gradient text-white hover:scale-105"
              }`}
            >
              {w.en}
            </button>
          );
        })}
      </div>

      {/* Drop targets */}
      <div className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-2">
        {shuffledTargets.map((t) => {
          const isMatched = matched[t.en];
          return (
            <button
              type="button"
              key={t.en}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => dragging && tryMatch(dragging, t.en)}
              onClick={() => {
                if (isMatched) return;
                if (picked) tryMatch(picked, t.en);
              }}
              disabled={isMatched}
              className={`flex w-full items-center justify-between gap-3 rounded-2xl border-2 border-dashed p-3 text-left transition-all sm:p-4 ${
                isMatched
                  ? "border-emerald-400 bg-emerald-50"
                  : picked
                    ? "border-primary/70 bg-secondary/10 active:scale-[0.98]"
                    : "border-border bg-muted/40 hover:border-primary/60 hover:bg-secondary/10"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl sm:text-4xl">{t.emoji}</span>
                <span className="text-base font-bold text-muted-foreground">{t.pt}</span>
              </div>
              {isMatched ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1.5 text-sm font-extrabold text-white">
                  <Check className="h-4 w-4" strokeWidth={3} /> {t.en}
                </span>
              ) : (
                <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-muted-foreground shadow">
                  {picked ? "tap to drop" : "drop here"}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {allDone && (
        <div className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-emerald-50 p-4 text-emerald-700 animate-[fade-in_0.3s]">
          <Sparkles className="h-5 w-5" />
          <p className="text-lg font-extrabold">All matched! +40 XP 🌟</p>
        </div>
      )}
    </section>
  );
}