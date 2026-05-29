import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type Child = {
  id: string;
  name: string;
  avatar: string;
  age_group: "little" | "student";
};

export const listChildren = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Child[]> => {
    const { data, error } = await context.supabase
      .from("child_profiles")
      .select("id, name, avatar, age_group")
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as Child[];
  });

export const createChild = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        name: z.string().min(1).max(40),
        avatar: z.string().min(1).max(8),
        age_group: z.enum(["little", "student"]),
      })
      .parse(d),
  )
  .handler(async ({ data, context }): Promise<Child> => {
    const { data: row, error } = await context.supabase
      .from("child_profiles")
      .insert({ ...data, parent_id: context.userId })
      .select("id, name, avatar, age_group")
      .single();
    if (error) throw new Error(error.message);
    // create empty progress row
    await context.supabase.from("progress").insert({ child_id: row.id }).then();
    return row as Child;
  });

export const updateChild = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        id: z.string().uuid(),
        name: z.string().min(1).max(40),
        avatar: z.string().min(1).max(8),
        age_group: z.enum(["little", "student"]),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("child_profiles")
      .update({ name: data.name, avatar: data.avatar, age_group: data.age_group })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteChild = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("child_profiles")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });