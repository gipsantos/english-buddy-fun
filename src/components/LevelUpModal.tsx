import { useEffect, useMemo } from "react";
import { Star, Trophy } from "lucide-react";

export function LevelUpModal({
  level,
  onClose,
}: {
  level: number;
  onClose: () => void;
}) {
  const rays = useMemo(() => Array.from({ length: 12 }), []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/50 backdrop-blur-sm animate-[fade-in_0.25s_ease-out]">
      <div className="relative mx-6 w-full max-w-md overflow-hidden rounded-[2rem] bg-card p-8 text-center shadow-soft animate-[scale-in_0.35s_ease-out]">
        {/* rays */}
        <div className="pointer-events-none absolute left-1/2 top-24 -translate-x-1/2">
          {rays.map((_, i) => (
            <span
              key={i}
              className="absolute left-0 top-0 block h-40 w-1.5 origin-bottom rounded-full bg-gradient-to-t from-transparent via-yellow-300/80 to-yellow-200"
              style={{ transform: `translate(-50%, -100%) rotate(${i * 30}deg)`, animation: "rays-spin 6s linear infinite" }}
            />
          ))}
        </div>

        <div className="relative mx-auto grid h-24 w-24 place-items-center rounded-full bg-student-gradient text-white shadow-pop animate-[float-soft_2.5s_ease-in-out_infinite]">
          <Trophy className="h-12 w-12 drop-shadow" fill="currentColor" />
        </div>

        <p className="mt-5 text-sm font-bold uppercase tracking-[0.3em] text-primary">Level Up!</p>
        <h2 className="mt-2 text-4xl font-extrabold">You're now Level {level}</h2>
        <p className="mt-3 text-base text-muted-foreground">
          A brand new star just lit up on your map. Keep going, superstar!
        </p>

        <div className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-accent px-5 py-2 font-extrabold text-accent-foreground shadow-pop">
          <Star className="h-5 w-5" fill="currentColor" /> +1 Star unlocked
        </div>

        <button
          onClick={onClose}
          className="mt-7 w-full rounded-full bg-student-gradient py-3.5 text-lg font-extrabold text-white shadow-pop transition-transform hover:scale-[1.02]"
        >
          Awesome!
        </button>
      </div>
    </div>
  );
}