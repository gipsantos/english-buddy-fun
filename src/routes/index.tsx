import { createFileRoute } from "@tanstack/react-router";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listChildren, createChild, deleteChild, type Child } from "@/lib/children.functions";
import { setActiveChildId, signOut, useSession } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import studentAvatar from "@/assets/student-avatar.png";
import parentAvatar from "@/assets/parent-avatar.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "English Buddy — Fun English Learning for Kids" },
      { name: "description", content: "A gamified English learning app for kids. Pick a profile and start your adventure!" },
      { property: "og:title", content: "English Buddy" },
      { property: "og:description", content: "Gamified English learning for kids and parents." },
    ],
  }),
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const { session, loading } = useSession();

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/login", replace: true });
  }, [loading, session, navigate]);

  if (loading || !session) {
    return (
      <div className="grid min-h-screen place-items-center bg-app-gradient">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return <Home />;
}

function Home() {
  const navigate = useNavigate();
  const list = useServerFn(listChildren);
  const add = useServerFn(createChild);
  const remove = useServerFn(deleteChild);
  const [children, setChildren] = useState<Child[] | null>(null);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("🧒");
  const [ageGroup, setAgeGroup] = useState<"little" | "student">("student");
  const [busy, setBusy] = useState(false);

  async function refresh() {
    const rows = await list();
    setChildren(rows);
  }
  useEffect(() => { refresh(); }, []);

  async function onAdd(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await add({ data: { name, avatar, age_group: ageGroup } });
      setName(""); setAvatar("🧒"); setAdding(false);
      await refresh();
    } finally { setBusy(false); }
  }

  function pickChild(c: Child) {
    setActiveChildId(c.id);
    navigate({ to: c.age_group === "little" ? "/little" : "/student" });
  }

  async function onRemove(id: string) {
    if (!confirm("Remove this child profile and all progress?")) return;
    await remove({ data: { id } });
    await refresh();
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-app-gradient animate-[fade-in_0.3s_ease-out]">
      {/* decorative blobs */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-secondary/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-primary/40 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 right-1/4 h-48 w-48 rounded-full bg-accent/30 blur-3xl" />

      <header className="relative z-10 flex items-center justify-between px-6 py-6 md:px-12">
        <Logo />
        <button
          onClick={() => signOut()}
          className="rounded-full bg-white/70 px-4 py-2 text-sm font-bold text-foreground shadow-soft backdrop-blur hover:bg-white"
        >
          Sign out
        </button>
      </header>

      <main className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-6 pb-16 pt-6 md:pt-12">
        <span className="rounded-full bg-white/70 px-4 py-1.5 text-sm font-bold text-primary shadow-soft backdrop-blur">
          ✨ Let's learn together!
        </span>
        <h1 className="mt-6 text-center text-5xl font-extrabold leading-tight tracking-tight md:text-7xl">
          <span className="text-header-gradient">Who is learning</span>
          <br />
          <span className="text-foreground">today? 🎉</span>
        </h1>
        <p className="mt-5 max-w-xl text-center text-lg text-muted-foreground">
          Pick a child profile to start, or add a new one.
        </p>

        {children === null ? (
          <p className="mt-10 text-muted-foreground">Loading children…</p>
        ) : (
          <div className="mt-12 grid w-full gap-6 md:grid-cols-3">
            {children.map((c) => (
              <div key={c.id} className="group relative">
                <button
                  onClick={() => pickChild(c)}
                  className={`flex w-full flex-col items-center overflow-hidden rounded-[2rem] p-8 text-white shadow-soft transition hover:-translate-y-1 hover:shadow-pop ${
                    c.age_group === "little"
                      ? "bg-gradient-to-br from-amber-400 via-orange-400 to-pink-500"
                      : "bg-student-gradient"
                  }`}
                >
                  <div className="grid h-40 w-40 place-items-center rounded-full bg-white/25 text-7xl backdrop-blur">
                    {c.avatar}
                  </div>
                  <h2 className="mt-4 text-2xl font-extrabold">{c.name}</h2>
                  <p className="mt-1 text-sm font-medium text-white/85">
                    {c.age_group === "little" ? "Little One · ages 3–5" : "Student · ages 10–12"}
                  </p>
                  <span className="mt-4 rounded-full bg-white px-5 py-2 text-sm font-bold text-foreground shadow-pop">
                    Let's go →
                  </span>
                </button>
                <button
                  onClick={() => onRemove(c.id)}
                  className="absolute right-3 top-3 rounded-full bg-white/80 px-2 py-1 text-xs font-bold text-destructive opacity-0 transition group-hover:opacity-100"
                >
                  Remove
                </button>
              </div>
            ))}

            {adding ? (
              <form
                onSubmit={onAdd}
                className="flex flex-col gap-3 rounded-[2rem] bg-white/90 p-6 shadow-soft backdrop-blur"
              >
                <h3 className="text-xl font-extrabold text-foreground">New child</h3>
                <input
                  required
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-xl border border-input px-3 py-2 text-sm"
                />
                <div className="flex flex-wrap gap-2">
                  {["🧒","👧","👦","🧸","🦄","🐯","🐼","🦊"].map((e) => (
                    <button
                      type="button"
                      key={e}
                      onClick={() => setAvatar(e)}
                      className={`grid h-10 w-10 place-items-center rounded-full text-2xl ${avatar === e ? "bg-primary text-white" : "bg-muted"}`}
                    >{e}</button>
                  ))}
                </div>
                <div className="flex gap-2">
                  {(["little","student"] as const).map((g) => (
                    <button
                      type="button"
                      key={g}
                      onClick={() => setAgeGroup(g)}
                      className={`flex-1 rounded-xl px-3 py-2 text-sm font-bold ${ageGroup === g ? "bg-primary text-white" : "bg-muted text-foreground"}`}
                    >
                      {g === "little" ? "Little (3–5)" : "Student (10–12)"}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    disabled={busy}
                    type="submit"
                    className="flex-1 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-50"
                  >
                    {busy ? "Saving…" : "Add child"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdding(false)}
                    className="rounded-xl bg-muted px-4 py-2 text-sm font-bold text-foreground"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setAdding(true)}
                className="flex min-h-[16rem] flex-col items-center justify-center gap-2 rounded-[2rem] border-2 border-dashed border-primary/40 bg-white/40 p-8 text-primary transition hover:bg-white/70"
              >
                <span className="text-5xl">＋</span>
                <span className="text-lg font-bold">Add a child</span>
              </button>
            )}
          </div>
        )}

        <div className="mt-12">
          <Link
            to="/parent"
            className="inline-flex items-center gap-2 rounded-full bg-parent-gradient px-6 py-3 text-sm font-bold text-white shadow-soft hover:shadow-pop"
          >
            <img src={parentAvatar} alt="" width={32} height={32} className="h-8 w-8 rounded-full object-contain" />
            Parent dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}

function ProfileCard({
  to,
  label,
  tag,
  image,
  emoji,
  gradient,
  float,
}: {
  to: "/student" | "/parent" | "/little";
  label: string;
  tag: string;
  image?: string;
  emoji?: string;
  gradient: string;
  float: string;
}) {
  return (
    <Link
      to={to}
      className={`group relative flex flex-col items-center overflow-hidden rounded-[2.5rem] ${gradient} p-8 text-white shadow-soft transition-all duration-300 hover:-translate-y-2 hover:shadow-pop`}
    >
      <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
      <div className="relative grid h-56 w-56 place-items-center rounded-full bg-white/25 backdrop-blur md:h-64 md:w-64">
        {image ? (
          <img
            src={image}
            alt={`${label} avatar`}
            width={768}
            height={768}
            className={`h-48 w-48 object-contain drop-shadow-xl md:h-56 md:w-56 ${float}`}
          />
        ) : (
          <span className={`text-[9rem] drop-shadow-xl md:text-[10rem] ${float}`}>{emoji}</span>
        )}
      </div>
      <h2 className="mt-6 text-4xl font-extrabold tracking-tight md:text-5xl">{label}</h2>
      <p className="mt-2 text-base font-medium text-white/85">{tag}</p>
      <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-base font-bold text-foreground shadow-pop transition-transform group-hover:scale-105">
        Let's go →
      </span>
    </Link>
  );
}
