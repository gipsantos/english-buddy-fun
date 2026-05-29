import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type ProgressSnapshot = {
  xp: number;
  streak: number;
  levelSeen: number;
  history: { title: string; emoji: string | null; xp: number; at: number }[];
  words: string[];
  weekly: { day: string; date: string; xp: number }[];
  badges: string[];
};

const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function todayKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export const getSnapshot = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ childId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }): Promise<ProgressSnapshot> => {
    const { supabase } = context;
    const childId = data.childId;

    const [progressRes, historyRes, wordsRes, dailyRes, badgesRes] = await Promise.all([
      supabase.from("progress").select("*").eq("child_id", childId).maybeSingle(),
      supabase
        .from("lesson_history")
        .select("title, emoji, xp, created_at")
        .eq("child_id", childId)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase.from("words_learned").select("word").eq("child_id", childId),
      supabase.from("daily_xp").select("day, xp").eq("child_id", childId),
      supabase.from("badges_unlocked").select("badge_key").eq("child_id", childId),
    ]);

    const dailyMap = new Map<string, number>(
      (dailyRes.data ?? []).map((r: any) => [r.day, r.xp]),
    );
    const weekly: ProgressSnapshot["weekly"] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const k = todayKey(d);
      weekly.push({ day: dayLabels[d.getDay()], date: k, xp: dailyMap.get(k) ?? 0 });
    }

    // Streak: rebuild from streak_last_day vs today/yesterday rule.
    let streak = 0;
    if (progressRes.data?.streak_last_day) {
      const last = String(progressRes.data.streak_last_day);
      const today = todayKey();
      const y = new Date();
      y.setDate(y.getDate() - 1);
      if (last === today || last === todayKey(y)) streak = progressRes.data.streak_count ?? 0;
    }

    return {
      xp: progressRes.data?.xp ?? 0,
      streak,
      levelSeen: progressRes.data?.level_seen ?? 1,
      history: (historyRes.data ?? []).map((r: any) => ({
        title: r.title,
        emoji: r.emoji,
        xp: r.xp,
        at: new Date(r.created_at).getTime(),
      })),
      words: (wordsRes.data ?? []).map((r: any) => r.word),
      weekly,
      badges: (badgesRes.data ?? []).map((r: any) => r.badge_key),
    };
  });

export const addXP = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ childId: z.string().uuid(), amount: z.number().int().min(1).max(1000) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const today = todayKey();
    const y = new Date();
    y.setDate(y.getDate() - 1);
    const yesterday = todayKey(y);

    const { data: cur } = await supabase
      .from("progress")
      .select("xp, streak_count, streak_last_day, level_seen")
      .eq("child_id", data.childId)
      .maybeSingle();

    const newXp = (cur?.xp ?? 0) + data.amount;
    let streakCount = cur?.streak_count ?? 0;
    const lastDay = cur?.streak_last_day ? String(cur.streak_last_day) : null;
    if (!lastDay) streakCount = 1;
    else if (lastDay === today) {
      /* keep */
    } else if (lastDay === yesterday) streakCount += 1;
    else streakCount = 1;

    await supabase.from("progress").upsert({
      child_id: data.childId,
      xp: newXp,
      streak_count: streakCount,
      streak_last_day: today,
      level_seen: cur?.level_seen ?? 1,
      updated_at: new Date().toISOString(),
    });

    // Increment daily_xp atomically via upsert+select
    const { data: dRow } = await supabase
      .from("daily_xp")
      .select("xp")
      .eq("child_id", data.childId)
      .eq("day", today)
      .maybeSingle();
    await supabase.from("daily_xp").upsert({
      child_id: data.childId,
      day: today,
      xp: (dRow?.xp ?? 0) + data.amount,
    });

    return { xp: newXp, streak: streakCount };
  });

export const recordLesson = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        childId: z.string().uuid(),
        title: z.string().min(1).max(120),
        emoji: z.string().max(8).optional(),
        xp: z.number().int().min(0).max(1000),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("lesson_history").insert({
      child_id: data.childId,
      title: data.title,
      emoji: data.emoji ?? null,
      xp: data.xp,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const recordWords = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        childId: z.string().uuid(),
        words: z.array(z.string().min(1).max(60)).min(1).max(50),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const rows = data.words.map((word) => ({ child_id: data.childId, word }));
    const { error } = await context.supabase
      .from("words_learned")
      .upsert(rows, { onConflict: "child_id,word" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setLevelSeen = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ childId: z.string().uuid(), level: z.number().int().min(1).max(999) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await context.supabase
      .from("progress")
      .upsert({ child_id: data.childId, level_seen: data.level });
    return { ok: true };
  });

export const unlockBadge = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ childId: z.string().uuid(), badgeKey: z.string().min(1).max(60) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await context.supabase
      .from("badges_unlocked")
      .upsert(
        { child_id: data.childId, badge_key: data.badgeKey },
        { onConflict: "child_id,badge_key" },
      );
    return { ok: true };
  });