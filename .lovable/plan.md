
# Evoluir English Buddy com Login + Backend

Objetivo: substituir o localStorage por uma conta de pai (email/password + Google), múltiplos perfis de filhos por conta, e uma pool de exercícios em base de dados filtrada por faixa etária. Manter toda a UI atual; só muda a camada de dados.

## 1. Ativar Lovable Cloud

Cria base de dados Postgres, auth e server functions sem contas externas. Tudo o resto deste plano depende deste passo.

## 2. Modelo de dados

Tabelas em `public` (todas com RLS + GRANTs):

- `profiles` — 1 linha por pai. `id` = `auth.users.id`, `display_name`, `created_at`.
- `child_profiles` — filhos de um pai. `id`, `parent_id` → `profiles.id`, `name`, `avatar` (emoji), `age_group` ('little' | 'student'), `created_at`.
- `progress` — estado vivo por filho. `child_id` (PK), `xp`, `streak_count`, `streak_last_day`, `level_seen`, `updated_at`.
- `lesson_history` — entradas de aulas. `id`, `child_id`, `title`, `emoji`, `xp`, `created_at`.
- `words_learned` — vocabulário acumulado. `child_id`, `word` (unique compound).
- `daily_xp` — XP por dia para o gráfico semanal. `child_id`, `day` (date), `xp`.
- `badges_unlocked` — `child_id`, `badge_key`, `unlocked_at`.
- `exercises` — pool central. `id`, `age_group`, `skill` (listening/vocab/speak/write/grammar/etc), `topic`, `type`, `difficulty`, `question`, `options` (jsonb), `correct_answer`, `explanation`, `xp_reward`, `audio_script`, `pt_translation`, `image_prompt`, `extra` (jsonb para campos raros).

RLS:
- `profiles`, `child_profiles`, `progress`, `lesson_history`, `words_learned`, `daily_xp`, `badges_unlocked`: apenas o pai dono (`parent_id = auth.uid()` ou via join) faz CRUD.
- `exercises`: leitura para qualquer `authenticated`; escrita só `service_role`.

## 3. Autenticação (Lovable Cloud Auth)

- Página `/login` pública com email/password + botão Google (broker Lovable + `configure_social_auth`).
- Página `/signup` cria conta do pai e linha em `profiles` (trigger `on_auth_user_created`).
- Página `/reset-password` obrigatória.
- Layout `_authenticated` protege `/parent`, `/student`, `/little` com `beforeLoad` que faz `supabase.auth.getUser()` e redireciona para `/login`.
- A landing `/` continua pública mas, se houver sessão, mostra os perfis de filhos do pai (em vez dos 3 cards estáticos).

## 4. Perfis de filhos

- Novo ecrã `/parent/children` para criar/editar/apagar filhos (nome, emoji, faixa etária).
- Selector de filho ativo guardado em contexto (e cookie) — todas as rotas Student/Little leem deste contexto para saber a quem pertence o progresso.
- O `/parent` (dashboard analytics) ganha um seletor de filho no topo.

## 5. Migrar progresso do localStorage para a DB

- Reescrever `src/lib/progress.ts` para chamar server functions em vez de `localStorage`:
  - `getXP`, `addXP`, `getStreak`, `recordLesson`, `recordWords`, `getWeeklyXP`, `getHistory`, `getWords`, badges.
- Todas as funções aceitam o `child_id` do filho ativo.
- Server functions com `requireSupabaseAuth` que verificam que o `child_id` pertence ao `auth.uid()` antes de ler/escrever.
- Mantemos os mesmos nomes de função para minimizar mudanças nos componentes; o hook fica `useProgress(childId)` com TanStack Query (`invalidate` após cada `addXP`).

## 6. Pool de exercícios filtrada por idade

- Server function `getExercises({ ageGroup, skill?, topic?, limit? })` que faz `select` em `exercises` filtrando por `age_group` do perfil ativo.
- `student.*` e `little.tsx` deixam de importar `littleExercises.ts` / arrays estáticas — passam a usar `useQuery(['exercises', ageGroup, topic])`.
- Mantemos os arrays atuais como fallback enquanto a DB está vazia.

## 7. Seed automático

Migration final que faz `INSERT` na tabela `exercises` com:
- 50 exercícios Little (de `src/lib/littleExercises.ts`, incluindo `pt_translation` do `littlePt`).
- 82 exercícios Student (vocabulário, listening, reading, speaking, writing, grammar).

Idempotente via `ON CONFLICT (id) DO NOTHING`.

## 8. Limpeza e polish

- Botão "Sair" no header das áreas autenticadas.
- Loading skeletons enquanto o progresso carrega.
- Empty state já existente do parent continua a funcionar (agora baseado na query).
- Manter animações e Celebration intactas.

## Detalhes técnicos

- Stack: TanStack Start + Supabase via Lovable Cloud (já documentado no projecto).
- Server functions em `src/lib/*.functions.ts` com `requireSupabaseAuth`; admin client só em migrations/seed.
- `src/start.ts` precisa de `attachSupabaseAuth` registado em `functionMiddleware` (verifico e adiciono se faltar).
- Root layout adiciona `onAuthStateChange` para invalidar queries em sign-in/out.
- Nada de Edge Functions; tudo via `createServerFn`.

## Fora do âmbito (podemos fazer depois)

- Dificuldade adaptativa (respondeste "por faixa etária" apenas).
- Painel de admin para o pai editar exercícios.
- Sincronização offline / PWA.
- Notificações por email de progresso semanal.
