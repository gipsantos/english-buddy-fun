import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/Logo";
import { Celebration } from "@/components/Celebration";
import { Mic, Square, ArrowLeft, ArrowRight, Volume2, RotateCcw } from "lucide-react";
import { completeStep, addXP, recordLesson } from "@/lib/progress";

export const Route = createFileRoute("/student/speaking")({
  head: () => ({
    meta: [{ title: "Speaking — English Buddy" }],
  }),
  component: SpeakingLab,
});

const prompts = [
  { en: "Describe your day", hint: "Try: 'Today I went to school and played with my friends.'" },
  { en: "What is your favorite food?", hint: "Try: 'My favorite food is pizza.'" },
  { en: "Tell me about your family", hint: "Try: 'I have a mother, a father and one sister.'" },
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

function SpeakingLab() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [recorded, setRecorded] = useState<boolean[]>(() => prompts.map(() => false));
  const [celebrate, setCelebrate] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, []);

  const total = prompts.length;
  const allDone = recorded.every(Boolean);
  const progress = (recorded.filter(Boolean).length / total) * 100;

  const start = () => {
    setRecording(true);
    setElapsed(0);
    timerRef.current = window.setInterval(() => setElapsed((e) => e + 0.1), 100);
  };

  const stop = () => {
    setRecording(false);
    if (timerRef.current) window.clearInterval(timerRef.current);
    setRecorded((r) => r.map((v, i) => (i === index ? true : v)));
  };

  const next = () => {
    if (index + 1 < total) setIndex(index + 1);
    else finish();
  };

  const finish = () => {
    addXP(30);
    completeStep("speak");
    recordLesson({ title: "Speaking — Prompts", emoji: "🗣️", xp: 30 });
    setCelebrate(true);
  };

  const p = prompts[index];

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
            🎤 Speaking
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

        <section className="mt-8 rounded-[2rem] bg-card p-8 text-center shadow-soft md:p-10">
          <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Speak the prompt
          </p>
          <h2 className="mt-3 text-3xl font-extrabold md:text-4xl">{p.en}</h2>
          <button
            onClick={() => speak(p.en)}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-muted px-4 py-1.5 text-sm font-bold text-foreground hover:bg-secondary/20"
          >
            <Volume2 className="h-4 w-4" /> Hear it
          </button>
          <p className="mt-4 text-sm italic text-muted-foreground">{p.hint}</p>

          {/* Mic + waves */}
          <div className="relative mt-10 flex flex-col items-center">
            <div className="relative grid place-items-center">
              {recording && (
                <>
                  <span className="absolute h-44 w-44 animate-ping rounded-full bg-rose-400/40" />
                  <span className="absolute h-36 w-36 animate-ping rounded-full bg-rose-400/30 [animation-delay:200ms]" />
                </>
              )}
              <button
                onClick={recording ? stop : start}
                aria-label={recording ? "Stop recording" : "Start recording"}
                className={`relative grid h-32 w-32 place-items-center rounded-full text-white shadow-pop transition-all hover:scale-105 active:scale-95 ${
                  recording
                    ? "bg-gradient-to-br from-rose-500 to-pink-600"
                    : "bg-student-gradient"
                }`}
              >
                {recording ? <Square className="h-12 w-12" fill="currentColor" /> : <Mic className="h-14 w-14" />}
              </button>
            </div>

            <Waveform active={recording} />

            <p className="mt-2 font-mono text-sm font-bold text-muted-foreground">
              {elapsed.toFixed(1)}s
            </p>
            <p className="text-xs text-muted-foreground">
              {recording ? "Listening… speak clearly!" : recorded[index] ? "Nice! You can re-record or continue." : "Tap the mic to start"}
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {recorded[index] && !recording && (
              <button
                onClick={() => {
                  setRecorded((r) => r.map((v, i) => (i === index ? false : v)));
                  setElapsed(0);
                }}
                className="inline-flex items-center gap-1.5 rounded-full bg-muted px-5 py-3 font-bold text-foreground hover:bg-secondary/20"
              >
                <RotateCcw className="h-4 w-4" /> Re-record
              </button>
            )}
            <button
              onClick={next}
              disabled={!recorded[index] || recording}
              className="inline-flex items-center gap-1.5 rounded-full bg-student-gradient px-7 py-3 font-extrabold text-white shadow-pop transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {index + 1 >= total ? "Finish" : "Next"} <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </section>
      </main>

      {celebrate && (
        <Celebration
          title="Great speaking! 🗣️"
          subtitle="You completed all the prompts."
          xp={30}
          onContinue={() => navigate({ to: "/student" })}
        />
      )}
    </div>
  );
}

function Waveform({ active }: { active: boolean }) {
  const bars = 28;
  return (
    <div className="mt-6 flex h-16 items-center gap-1">
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className={`w-1.5 rounded-full ${active ? "bg-student-gradient" : "bg-muted"}`}
          style={{
            height: active ? `${20 + Math.abs(Math.sin((i + 1) * 0.7)) * 70}%` : "20%",
            animation: active ? `wave-bar 0.9s ease-in-out ${i * 0.05}s infinite alternate` : undefined,
          }}
        />
      ))}
    </div>
  );
}