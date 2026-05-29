const STEP_KEY = "eb_steps_v1";
const XP_KEY = "eb_xp_v1";
const LEVEL_SEEN_KEY = "eb_level_seen_v1";
const STREAK_KEY = "eb_streak_v1";
const HISTORY_KEY = "eb_history_v1";
const WORDS_KEY = "eb_words_v1";
const DAILY_XP_KEY = "eb_daily_xp_v1";

export const XP_PER_LEVEL = 100;
export const STREAK_DAYS = 5; // legacy default for first-time visitors

export type StepKey = "listen" | "vocab" | "speak" | "write";

export type LessonEntry = {
  title: string;
  emoji: string;
  xp: number;
  at: number; // timestamp
};

function isBrowser() {
  return typeof window !== "undefined";
}

function read<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (!isBrowser()) return;
  localStorage.setItem(key, JSON.stringify(value));
}

function emit() {
  if (isBrowser()) window.dispatchEvent(new Event("eb-progress"));
}

function todayKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function getCompletedSteps(): Record<StepKey, boolean> {
  const base = { listen: false, vocab: false, speak: false, write: false };
  return { ...base, ...read<Partial<Record<StepKey, boolean>>>(STEP_KEY, {}) };
}

export function completeStep(step: StepKey) {
  if (!isBrowser()) return;
  const cur = getCompletedSteps();
  cur[step] = true;
  write(STEP_KEY, cur);
  emit();
}

export function resetSteps() {
  if (!isBrowser()) return;
  localStorage.removeItem(STEP_KEY);
  emit();
}

export function getXP(): number {
  if (!isBrowser()) return 0;
  const raw = localStorage.getItem(XP_KEY);
  return raw ? Number(raw) : 0;
}

export function addXP(amount: number) {
  if (!isBrowser()) return;
  const cur = getXP();
  localStorage.setItem(XP_KEY, String(cur + amount));
  // also bucket per day for weekly chart
  const daily = read<Record<string, number>>(DAILY_XP_KEY, {});
  const k = todayKey();
  daily[k] = (daily[k] || 0) + amount;
  write(DAILY_XP_KEY, daily);
  bumpStreak();
  emit();
}

export function getLevel(xp = getXP()): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

export function getSeenLevel(): number {
  if (!isBrowser()) return getLevel();
  const raw = localStorage.getItem(LEVEL_SEEN_KEY);
  return raw ? Number(raw) : getLevel();
}

export function setSeenLevel(level: number) {
  if (!isBrowser()) return;
  localStorage.setItem(LEVEL_SEEN_KEY, String(level));
}

// ---------- Streak ----------

type StreakState = { count: number; lastDay: string };

function bumpStreak() {
  if (!isBrowser()) return;
  const cur = read<StreakState | null>(STREAK_KEY, null);
  const today = todayKey();
  if (!cur) {
    write(STREAK_KEY, { count: 1, lastDay: today });
    return;
  }
  if (cur.lastDay === today) return;
  const y = new Date();
  y.setDate(y.getDate() - 1);
  const yesterday = todayKey(y);
  const next = cur.lastDay === yesterday ? cur.count + 1 : 1;
  write(STREAK_KEY, { count: next, lastDay: today });
}

export function getStreak(): number {
  const s = read<StreakState | null>(STREAK_KEY, null);
  if (!s) return 0;
  // streak resets if last activity older than yesterday
  const today = todayKey();
  const y = new Date();
  y.setDate(y.getDate() - 1);
  if (s.lastDay === today || s.lastDay === todayKey(y)) return s.count;
  return 0;
}

// ---------- Lesson history ----------

export function recordLesson(entry: Omit<LessonEntry, "at">) {
  const list = read<LessonEntry[]>(HISTORY_KEY, []);
  list.unshift({ ...entry, at: Date.now() });
  write(HISTORY_KEY, list.slice(0, 50));
  emit();
}

export function getHistory(): LessonEntry[] {
  return read<LessonEntry[]>(HISTORY_KEY, []);
}

// ---------- Vocabulary words learned ----------

export function recordWords(words: string[]) {
  const set = new Set(read<string[]>(WORDS_KEY, []));
  words.forEach((w) => set.add(w));
  write(WORDS_KEY, Array.from(set));
  emit();
}

export function getWords(): string[] {
  return read<string[]>(WORDS_KEY, []);
}

// ---------- Weekly XP (last 7 days) ----------

export function getWeeklyXP(): { day: string; date: string; xp: number }[] {
  const daily = read<Record<string, number>>(DAILY_XP_KEY, {});
  const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const out: { day: string; date: string; xp: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const k = todayKey(d);
    out.push({ day: labels[d.getDay()], date: k, xp: daily[k] || 0 });
  }
  return out;
}

// ---------- Reset (debug) ----------
export function resetProgress() {
  if (!isBrowser()) return;
  [STEP_KEY, XP_KEY, LEVEL_SEEN_KEY, STREAK_KEY, HISTORY_KEY, WORDS_KEY, DAILY_XP_KEY].forEach((k) =>
    localStorage.removeItem(k),
  );
  emit();
}