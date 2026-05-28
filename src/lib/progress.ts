const STEP_KEY = "eb_steps_v1";
const XP_KEY = "eb_xp_v1";

export type StepKey = "listen" | "vocab" | "speak" | "write";

export function getCompletedSteps(): Record<StepKey, boolean> {
  if (typeof window === "undefined") return { listen: false, vocab: false, speak: false, write: false };
  try {
    const raw = localStorage.getItem(STEP_KEY);
    if (!raw) return { listen: false, vocab: false, speak: false, write: false };
    return { listen: false, vocab: false, speak: false, write: false, ...JSON.parse(raw) };
  } catch {
    return { listen: false, vocab: false, speak: false, write: false };
  }
}

export function completeStep(step: StepKey) {
  if (typeof window === "undefined") return;
  const cur = getCompletedSteps();
  cur[step] = true;
  localStorage.setItem(STEP_KEY, JSON.stringify(cur));
  window.dispatchEvent(new Event("eb-progress"));
}

export function getXP(): number {
  if (typeof window === "undefined") return 320;
  const raw = localStorage.getItem(XP_KEY);
  return raw ? Number(raw) : 320;
}

export function addXP(amount: number) {
  if (typeof window === "undefined") return;
  const cur = getXP();
  localStorage.setItem(XP_KEY, String(cur + amount));
  window.dispatchEvent(new Event("eb-progress"));
}