
-- =========================================================
-- Profiles (parent accounts)
-- =========================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles self select" ON public.profiles
  FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "profiles self update" ON public.profiles
  FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "profiles self insert" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================
-- Child profiles
-- =========================================================
CREATE TABLE public.child_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar TEXT NOT NULL DEFAULT '🧒',
  age_group TEXT NOT NULL CHECK (age_group IN ('little','student')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_child_profiles_parent ON public.child_profiles(parent_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.child_profiles TO authenticated;
GRANT ALL ON public.child_profiles TO service_role;

ALTER TABLE public.child_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "child select own" ON public.child_profiles
  FOR SELECT TO authenticated USING (parent_id = auth.uid());
CREATE POLICY "child insert own" ON public.child_profiles
  FOR INSERT TO authenticated WITH CHECK (parent_id = auth.uid());
CREATE POLICY "child update own" ON public.child_profiles
  FOR UPDATE TO authenticated USING (parent_id = auth.uid());
CREATE POLICY "child delete own" ON public.child_profiles
  FOR DELETE TO authenticated USING (parent_id = auth.uid());

-- Helper: does the calling user own this child?
CREATE OR REPLACE FUNCTION public.owns_child(_child_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.child_profiles
    WHERE id = _child_id AND parent_id = auth.uid()
  );
$$;

-- =========================================================
-- Progress (one row per child)
-- =========================================================
CREATE TABLE public.progress (
  child_id UUID PRIMARY KEY REFERENCES public.child_profiles(id) ON DELETE CASCADE,
  xp INT NOT NULL DEFAULT 0,
  streak_count INT NOT NULL DEFAULT 0,
  streak_last_day DATE,
  level_seen INT NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.progress TO authenticated;
GRANT ALL ON public.progress TO service_role;

ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "progress crud own" ON public.progress
  FOR ALL TO authenticated
  USING (public.owns_child(child_id))
  WITH CHECK (public.owns_child(child_id));

-- =========================================================
-- Lesson history
-- =========================================================
CREATE TABLE public.lesson_history (
  id BIGSERIAL PRIMARY KEY,
  child_id UUID NOT NULL REFERENCES public.child_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  emoji TEXT,
  xp INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_lesson_history_child ON public.lesson_history(child_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.lesson_history TO authenticated;
GRANT ALL ON public.lesson_history TO service_role;

ALTER TABLE public.lesson_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lesson_history crud own" ON public.lesson_history
  FOR ALL TO authenticated
  USING (public.owns_child(child_id))
  WITH CHECK (public.owns_child(child_id));

-- =========================================================
-- Words learned
-- =========================================================
CREATE TABLE public.words_learned (
  child_id UUID NOT NULL REFERENCES public.child_profiles(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (child_id, word)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.words_learned TO authenticated;
GRANT ALL ON public.words_learned TO service_role;

ALTER TABLE public.words_learned ENABLE ROW LEVEL SECURITY;

CREATE POLICY "words crud own" ON public.words_learned
  FOR ALL TO authenticated
  USING (public.owns_child(child_id))
  WITH CHECK (public.owns_child(child_id));

-- =========================================================
-- Daily XP buckets (for weekly chart)
-- =========================================================
CREATE TABLE public.daily_xp (
  child_id UUID NOT NULL REFERENCES public.child_profiles(id) ON DELETE CASCADE,
  day DATE NOT NULL,
  xp INT NOT NULL DEFAULT 0,
  PRIMARY KEY (child_id, day)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_xp TO authenticated;
GRANT ALL ON public.daily_xp TO service_role;

ALTER TABLE public.daily_xp ENABLE ROW LEVEL SECURITY;

CREATE POLICY "daily_xp crud own" ON public.daily_xp
  FOR ALL TO authenticated
  USING (public.owns_child(child_id))
  WITH CHECK (public.owns_child(child_id));

-- =========================================================
-- Badges unlocked
-- =========================================================
CREATE TABLE public.badges_unlocked (
  child_id UUID NOT NULL REFERENCES public.child_profiles(id) ON DELETE CASCADE,
  badge_key TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (child_id, badge_key)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.badges_unlocked TO authenticated;
GRANT ALL ON public.badges_unlocked TO service_role;

ALTER TABLE public.badges_unlocked ENABLE ROW LEVEL SECURITY;

CREATE POLICY "badges crud own" ON public.badges_unlocked
  FOR ALL TO authenticated
  USING (public.owns_child(child_id))
  WITH CHECK (public.owns_child(child_id));

-- =========================================================
-- Exercises library (read-only to users)
-- =========================================================
CREATE TABLE public.exercises (
  id TEXT PRIMARY KEY,
  age_group TEXT NOT NULL CHECK (age_group IN ('little','student')),
  skill TEXT,
  topic TEXT,
  type TEXT NOT NULL,
  difficulty TEXT,
  question TEXT NOT NULL,
  options JSONB,
  correct_answer TEXT,
  explanation TEXT,
  xp_reward INT NOT NULL DEFAULT 5,
  audio_script TEXT,
  pt_translation TEXT,
  image_prompt TEXT,
  extra JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_exercises_age_topic ON public.exercises(age_group, topic);

GRANT SELECT ON public.exercises TO authenticated;
GRANT ALL ON public.exercises TO service_role;

ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "exercises read all" ON public.exercises
  FOR SELECT TO authenticated USING (true);
