import { useEffect, useMemo } from "react";
import { Sparkles, Star } from "lucide-react";

export function Celebration({
  title,
  subtitle,
  xp,
  onContinue,
  ctaLabel = "Back to dashboard",
}: {
  title: string;
  subtitle?: string;
  xp: number;
  onContinue: () => void;
  ctaLabel?: string;
}) {
  const pieces = useMemo(
    () =>
      Array.from({ length: 60 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.8,
        duration: 1.4 + Math.random() * 1.2,
        rotate: Math.random() * 360,
        color: ["#60a5fa", "#a78bfa", "#f472b6", "#fbbf24", "#34d399", "#fb7185"][i % 6],
        size: 8 + Math.random() * 8,
      })),
    [],
  );

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 backdrop-blur-sm animate-[fade-in_0.18s_ease-out]">
      {/* Confetti */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {pieces.map((p) => (
          <span
            key={p.id}
            className="absolute -top-6 block rounded-sm"
            style={{
              left: `${p.left}%`,
              width: p.size,
              height: p.size,
              background: p.color,
              transform: `rotate(${p.rotate}deg)`,
              animation: `confetti-fall ${p.duration}s linear ${p.delay}s forwards`,
            }}
          />
        ))}
        {/* Burst stars */}
        {Array.from({ length: 8 }).map((_, i) => (
          <Star
            key={`s-${i}`}
            className="absolute text-yellow-300 drop-shadow"
            fill="currentColor"
            style={{
              top: "50%",
              left: "50%",
              width: 28,
              height: 28,
              animation: `star-burst 0.9s ease-out ${i * 0.04}s forwards`,
              transform: `rotate(${i * 45}deg) translateY(-10px)`,
            }}
          />
        ))}
      </div>

      <div className="relative mx-6 w-full max-w-md rounded-[2rem] bg-card p-8 text-center shadow-soft animate-[scale-in_0.22s_cubic-bezier(0.34,1.56,0.64,1)]">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-student-gradient text-white shadow-pop">
          <Sparkles className="h-10 w-10" />
        </div>
        <h2 className="mt-5 text-3xl font-extrabold">{title}</h2>
        {subtitle && <p className="mt-2 text-base text-muted-foreground">{subtitle}</p>}
        <p className="mt-5 inline-block rounded-full bg-accent px-5 py-2 text-lg font-extrabold text-accent-foreground shadow-pop">
          +{xp} XP
        </p>
        <button
          onClick={onContinue}
          className="mt-7 w-full rounded-full bg-student-gradient py-3.5 text-lg font-extrabold text-white shadow-pop transition-transform hover:scale-[1.02]"
        >
          {ctaLabel}
        </button>
      </div>
    </div>
  );
}