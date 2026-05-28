import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Logo } from "@/components/Logo";
import { Celebration } from "@/components/Celebration";
import { ArrowLeft, Volume2, Mic, Sparkles, Star, Home } from "lucide-react";
import {
  littlePool,
  littlePt,
  littleTopics,
  type LittleExercise,
} from "@/lib/littleExercises";
import { addXP, recordLesson } from "@/lib/progress";

export const Route = createFileRoute("/little")({
  head: () => ({
    meta: [
      { title: "Little One — English Buddy" },
      { name: "description", content: "Big buttons, big fun. English for 3-year-olds." },
    ],
  }),
  component: LittlePage,
});

function speak(text: string, lang: "en-US" | "pt-PT" = "en-US") {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  u.rate = lang === "pt-PT" ? 0.85 : 0.8;
  u.pitch = 1.2;
  window.speechSynthesis.speak(u);
}

/** Cancel anything queued and speak English, then the Portuguese translation. */
function speakBilingual(en: string, pt?: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  speak(en, "en-US");
  if (pt) speak(pt, "pt-PT");
}

function LittlePage() {
  const [topicId, setTopicId] = useState<string | null>(null);

  const exercises = useMemo(() => {
    if (!topicId) return [];
    const topic = littleTopics.find((t) => t.id === topicId);
    if (!topic || topic.topics.length === 0) {
      // "Surprise" → shuffled full pool
      return [...littlePool.exercises].sort(() => Math.random() - 0.5);
    }
    return littlePool.exercises.filter((e) => topic.topics.includes(e.topic));
  }, [topicId]);

  const [index, setIndex] = useState(0);
  const [earned, setEarned] = useState(0);
  const [finished, setFinished] = useState(false);

  // Reset session when topic changes
  useEffect(() => {
    setIndex(0);
    setEarned(0);
    setFinished(false);
  }, [topicId]);

  const current = exercises[index];

  const onCorrect = (xp: number) => {
    addXP(xp);
    setEarned((e) => e + xp);
    setTimeout(() => goNext(), 700);
  };

  const goNext = () => {
    if (index + 1 >= exercises.length) {
      const topic = littleTopics.find((t) => t.id === topicId);
      recordLesson({
        title: `Little One — ${topic?.labelEn ?? "Play"}`,
        emoji: topic?.emoji ?? "🧸",
        xp: earned,
      });
      setFinished(true);
    } else {
      setIndex(index + 1);
    }
  };

  // ----------- MENU SCREEN -----------
  if (!topicId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-100 via-orange-100 to-pink-200">
        <header className="flex items-center justify-between px-5 py-4 md:px-10">
          <Logo />
          <Link
            to="/"
            aria-label="Home"
            className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-5 py-3 text-base font-extrabold text-primary shadow-pop hover:bg-white"
          >
            <ArrowLeft className="h-5 w-5" /> Home
          </Link>
        </header>
        <main className="mx-auto max-w-4xl px-5 pb-16">
          <div className="mb-6 text-center">
            <h1 className="text-4xl font-extrabold text-orange-900 md:text-5xl">
              🧸 Pick a game!
            </h1>
            <button
              onClick={() => speakBilingual("Pick a game!", "Escolhe um jogo!")}
              className="mt-3 inline-flex items-center gap-2 rounded-full bg-sky-500 px-5 py-3 text-base font-extrabold text-white shadow-soft hover:scale-105"
            >
              <Volume2 className="h-5 w-5" /> Listen
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {littleTopics.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  speakBilingual(t.labelEn, t.labelPt);
                  setTopicId(t.id);
                }}
                onMouseEnter={() => speakBilingual(t.labelEn, t.labelPt)}
                aria-label={`${t.labelEn} — ${t.labelPt}`}
                className="group flex aspect-square flex-col items-center justify-center gap-2 rounded-3xl bg-white p-4 shadow-pop transition-all hover:scale-105 hover:bg-gradient-to-br hover:from-amber-200 hover:to-pink-200 active:scale-95"
              >
                <span className="text-6xl md:text-7xl">{t.emoji}</span>
                <span className="text-base font-extrabold text-orange-900 md:text-lg">
                  {t.labelEn}
                </span>
                <span className="text-xs font-bold text-pink-600 md:text-sm">
                  {t.labelPt}
                </span>
              </button>
            ))}
          </div>
        </main>
      </div>
    );
  }

  // ----------- EXERCISE SCREEN -----------
  if (!current) {
    // No exercises for this topic — bounce back to menu
    return (
      <div className="grid min-h-screen place-items-center bg-gradient-to-br from-amber-100 to-pink-200 p-8 text-center">
        <div>
          <p className="text-2xl font-extrabold text-orange-900">No games here yet!</p>
          <button
            onClick={() => setTopicId(null)}
            className="mt-4 rounded-full bg-amber-400 px-6 py-3 font-extrabold text-white shadow-pop"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  const progress = ((index + (finished ? 1 : 0)) / exercises.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-100 via-orange-100 to-pink-200">
      <header className="flex items-center justify-between px-5 py-4 md:px-10">
        <Logo />
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTopicId(null)}
            aria-label="Back to games"
            className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-5 py-3 text-base font-extrabold text-primary shadow-pop hover:bg-white"
          >
            <ArrowLeft className="h-5 w-5" /> Games
          </button>
          <Link
            to="/"
            aria-label="Home"
            className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-4 py-3 text-base font-extrabold text-primary shadow-pop hover:bg-white"
          >
            <Home className="h-5 w-5" />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-5 pb-16">
        <div className="mb-3 flex items-center justify-between text-base font-extrabold">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 shadow-soft">
            {littleTopics.find((t) => t.id === topicId)?.emoji}{" "}
            {littleTopics.find((t) => t.id === topicId)?.labelEn}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-4 py-2 text-white shadow-pop">
            <Star className="h-4 w-4" fill="currentColor" /> {earned} XP
          </span>
        </div>
        <div className="h-4 w-full overflow-hidden rounded-full bg-white/70 shadow-soft">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-pink-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-center text-sm font-bold text-orange-700">
          {index + 1} / {exercises.length}
        </p>

        <ExerciseCard key={current.id} ex={current} onCorrect={onCorrect} onSkip={goNext} />
      </main>

      {finished && (
        <Celebration
          title="You're a superstar! ⭐"
          subtitle={`You earned ${earned} XP playing!`}
          xp={earned}
          onContinue={() => {
            setTopicId(null);
          }}
        />
      )}
    </div>
  );
}

function ExerciseCard({
  ex,
  onCorrect,
  onSkip,
}: {
  ex: LittleExercise;
  onCorrect: (xp: number) => void;
  onSkip: () => void;
}) {
  // Auto-read the question in English, then Portuguese, when the card mounts.
  useEffect(() => {
    const en =
      ex.type === "listening"
        ? `${ex.question}`
        : ex.type === "speaking"
          ? ex.question
          : ex.question;
    const pt = littlePt[ex.id];
    speakBilingual(en, pt);
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [ex.id]);

  return (
    <section className="mt-6 rounded-[2rem] bg-white p-6 shadow-pop md:p-8">
      <div className="mb-4 flex justify-center">
        <button
          onClick={() => speakBilingual(ex.question, littlePt[ex.id])}
          aria-label="Hear question again"
          className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-5 py-2.5 text-sm font-extrabold text-white shadow-soft hover:scale-105"
        >
          <Volume2 className="h-5 w-5" /> Hear again 🇬🇧 🇵🇹
        </button>
      </div>
      {ex.type === "flashcard" || ex.type === "multiple_choice" || ex.type === "fill_blank" ? (
        <Choice ex={ex} onCorrect={onCorrect} />
      ) : ex.type === "listening" ? (
        <Listening ex={ex} onCorrect={onCorrect} />
      ) : ex.type === "speaking" ? (
        <Speaking ex={ex} onDone={() => onCorrect(ex.xpReward)} />
      ) : ex.type === "matching" ? (
        <Matching ex={ex} onCorrect={onCorrect} />
      ) : ex.type === "memory_game" ? (
        <MemoryMini ex={ex} onDone={() => onCorrect(ex.xpReward)} />
      ) : (
        <CelebrationCard ex={ex} onDone={() => onCorrect(ex.xpReward)} onSkip={onSkip} />
      )}
    </section>
  );
}

function BigButton({
  children,
  onClick,
  variant = "default",
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "correct" | "wrong";
}) {
  const styles =
    variant === "correct"
      ? "bg-emerald-500 text-white"
      : variant === "wrong"
        ? "bg-rose-200 text-rose-700"
        : "bg-gradient-to-br from-amber-300 to-orange-400 text-white hover:from-amber-400 hover:to-orange-500";
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-3xl px-6 py-6 text-2xl font-extrabold shadow-pop transition-all hover:scale-[1.02] active:scale-95 md:text-3xl ${styles}`}
    >
      {children}
    </button>
  );
}

type ChoiceEx = Extract<
  LittleExercise,
  { type: "flashcard" | "multiple_choice" | "fill_blank" }
>;
function Choice({ ex, onCorrect }: { ex: ChoiceEx; onCorrect: (xp: number) => void }) {
  const [picked, setPicked] = useState<string | null>(null);
  const handle = (opt: string) => {
    if (picked) return;
    setPicked(opt);
    if (opt === ex.correctAnswer) onCorrect(ex.xpReward);
    else setTimeout(() => setPicked(null), 800);
  };
  return (
    <>
      <h2 className="mb-6 text-center text-3xl font-extrabold text-orange-900 md:text-4xl">
        {ex.question}
      </h2>
      <div className="grid gap-4">
        {ex.options.map((opt) => (
          <BigButton
            key={opt}
            onClick={() => handle(opt)}
            variant={
              picked === opt
                ? opt === ex.correctAnswer
                  ? "correct"
                  : "wrong"
                : "default"
            }
          >
            {opt}
          </BigButton>
        ))}
      </div>
    </>
  );
}

type ListeningEx = Extract<LittleExercise, { type: "listening" }>;
function Listening({ ex, onCorrect }: { ex: ListeningEx; onCorrect: (xp: number) => void }) {
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <>
      <h2 className="mb-4 text-center text-2xl font-extrabold text-orange-900 md:text-3xl">
        👂 Listen and tap!
      </h2>
      <div className="mb-6 flex justify-center">
        <button
          onClick={() => speak(ex.audioScript || ex.question)}
          className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-7 py-4 text-xl font-extrabold text-white shadow-pop hover:scale-105"
        >
          <Volume2 className="h-6 w-6" /> Play
        </button>
      </div>
      <p className="mb-4 text-center text-xl font-extrabold text-orange-900">{ex.question}</p>
      <div className="grid gap-4">
        {ex.options.map((opt) => (
          <BigButton
            key={opt}
            onClick={() => {
              if (picked) return;
              setPicked(opt);
              if (opt === ex.correctAnswer) onCorrect(ex.xpReward);
              else setTimeout(() => setPicked(null), 800);
            }}
            variant={
              picked === opt
                ? opt === ex.correctAnswer
                  ? "correct"
                  : "wrong"
                : "default"
            }
          >
            {opt}
          </BigButton>
        ))}
      </div>
    </>
  );
}

function Speaking({
  ex,
  onDone,
}: {
  ex: Extract<LittleExercise, { type: "speaking" }>;
  onDone: () => void;
}) {
  const [recording, setRecording] = useState(false);
  return (
    <>
      <h2 className="mb-2 text-center text-2xl font-extrabold text-orange-900 md:text-3xl">
        🎤 Your turn!
      </h2>
      <p className="mb-2 text-center text-3xl font-extrabold text-pink-600">{ex.question}</p>
      <p className="mb-6 text-center text-base italic text-muted-foreground">
        Try: "{ex.exampleAnswer}"
      </p>
      <div className="mb-6 flex justify-center">
        <button
          onClick={() => speak(ex.exampleAnswer)}
          className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-5 py-3 text-base font-extrabold text-white shadow-soft hover:scale-105"
        >
          <Volume2 className="h-5 w-5" /> Hear it
        </button>
      </div>
      <div className="mb-6 grid place-items-center">
        <button
          onClick={() => setRecording((r) => !r)}
          aria-label="Microphone"
          className={`relative grid h-32 w-32 place-items-center rounded-full text-white shadow-pop transition-all hover:scale-105 ${recording ? "bg-rose-500 animate-pulse" : "bg-gradient-to-br from-pink-500 to-rose-500"}`}
        >
          {recording && (
            <span className="absolute h-40 w-40 animate-ping rounded-full bg-rose-400/40" />
          )}
          <Mic className="h-14 w-14" />
        </button>
      </div>
      <BigButton onClick={onDone} variant="correct">
        <span className="inline-flex items-center justify-center gap-2">
          <Sparkles className="h-6 w-6" /> I said it!
        </span>
      </BigButton>
    </>
  );
}

function Matching({
  ex,
  onCorrect,
}: {
  ex: Extract<LittleExercise, { type: "matching" }>;
  onCorrect: (xp: number) => void;
}) {
  // turn pairs into a one-question pick: show first pair's "key", ask to pick its "value".
  const items = useMemo(() => {
    const keys = ex.pairs.map((p) => Object.values(p)[0]);
    const vals = ex.pairs.map((p) => Object.values(p)[1]);
    return { prompt: keys[0], correct: vals[0], options: [...vals].sort(() => Math.random() - 0.5) };
  }, [ex]);
  const [picked, setPicked] = useState<string | null>(null);

  return (
    <>
      <h2 className="mb-4 text-center text-2xl font-extrabold text-orange-900 md:text-3xl">
        {ex.question}
      </h2>
      <div className="mb-6 rounded-3xl bg-amber-100 p-8 text-center text-5xl md:text-6xl">
        {items.prompt}
      </div>
      <div className="grid gap-4">
        {items.options.map((opt) => (
          <BigButton
            key={opt}
            onClick={() => {
              if (picked) return;
              setPicked(opt);
              if (opt === items.correct) onCorrect(ex.xpReward);
              else setTimeout(() => setPicked(null), 800);
            }}
            variant={
              picked === opt
                ? opt === items.correct
                  ? "correct"
                  : "wrong"
                : "default"
            }
          >
            {opt}
          </BigButton>
        ))}
      </div>
    </>
  );
}

function MemoryMini({
  ex,
  onDone,
}: {
  ex: Extract<LittleExercise, { type: "memory_game" }>;
  onDone: () => void;
}) {
  const emojis = ex.topic === "food" ? ["🍎", "🍌", "🍎", "🍌"] : ["🐶", "🐱", "🐶", "🐱"];
  const [flipped, setFlipped] = useState<Set<number>>(new Set());
  const toggle = (i: number) => {
    const next = new Set(flipped);
    next.add(i);
    setFlipped(next);
    if (next.size === emojis.length) setTimeout(onDone, 600);
  };
  return (
    <>
      <h2 className="mb-6 text-center text-2xl font-extrabold text-orange-900 md:text-3xl">
        {ex.question}
      </h2>
      <div className="grid grid-cols-2 gap-4">
        {emojis.map((e, i) => (
          <button
            key={i}
            onClick={() => toggle(i)}
            className="aspect-square rounded-3xl bg-gradient-to-br from-violet-400 to-fuchsia-500 text-6xl font-extrabold text-white shadow-pop transition-all hover:scale-105 md:text-7xl"
          >
            {flipped.has(i) ? e : "❓"}
          </button>
        ))}
      </div>
    </>
  );
}

function CelebrationCard({
  ex,
  onDone,
}: {
  ex: Extract<LittleExercise, { type: "celebration" }>;
  onDone: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto grid h-32 w-32 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-pink-500 text-7xl shadow-pop animate-bounce">
        ⭐
      </div>
      <h2 className="mt-6 text-4xl font-extrabold text-orange-900">{ex.question}</h2>
      <p className="mt-3 text-xl font-bold text-pink-600">{ex.message}</p>
      <div className="mt-8">
        <BigButton onClick={onDone} variant="correct">
          Yay! 🎉
        </BigButton>
      </div>
    </div>
  );
}