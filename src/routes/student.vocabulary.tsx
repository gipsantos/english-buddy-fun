import { createFileRoute, Link, Outlet, useMatches } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { ArrowLeft, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/student/vocabulary")({
  head: () => ({
    meta: [
      { title: "Vocabulary Hub — English Buddy" },
      { name: "description", content: "Learn new words with flashcards and games." },
    ],
  }),
  component: VocabularyLayout,
});

export const categories = [
  {
    slug: "school",
    title: "School",
    emoji: "🏫",
    gradient: "from-sky-400 to-blue-600",
    blurb: "Pencils, books and friends",
  },
  {
    slug: "food",
    title: "Food",
    emoji: "🍎",
    gradient: "from-rose-400 to-orange-500",
    blurb: "Tasty words to munch on",
  },
  {
    slug: "family",
    title: "Family",
    emoji: "👨‍👩‍👧",
    gradient: "from-violet-400 to-fuchsia-600",
    blurb: "The people you love",
  },
];

function VocabularyLayout() {
  const matches = useMatches();
  const isChild = matches.some((m) => m.routeId === "/student/vocabulary/$category");

  return (
    <div className="min-h-screen bg-app-gradient">
      <header className="flex items-center justify-between px-6 py-6 md:px-12">
        <Logo />
        <Link
          to="/student"
          className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-4 py-2 text-sm font-bold text-primary shadow-soft backdrop-blur hover:bg-white"
        >
          <ArrowLeft className="h-4 w-4" /> Dashboard
        </Link>
      </header>

      {isChild ? (
        <Outlet />
      ) : (
        <main className="mx-auto max-w-5xl px-6 pb-20">
          <div className="text-center">
            <span className="rounded-full bg-white/70 px-4 py-1.5 text-sm font-bold text-primary shadow-soft backdrop-blur">
              📚 Vocabulary Hub
            </span>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight md:text-5xl">
              Pick a <span className="text-header-gradient">word world</span>
            </h1>
            <p className="mt-3 text-muted-foreground">
              Flip flashcards, hear the words, then play the match game.
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c) => (
              <Link
                key={c.slug}
                to="/student/vocabulary/$category"
                params={{ category: c.slug }}
                className={`group relative overflow-hidden rounded-[2rem] bg-gradient-to-br ${c.gradient} p-7 text-white shadow-soft transition-all hover:-translate-y-2 hover:shadow-pop`}
              >
                <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/20 blur-2xl" />
                <div className="relative">
                  <div className="grid h-20 w-20 place-items-center rounded-3xl bg-white/25 text-5xl backdrop-blur">
                    {c.emoji}
                  </div>
                  <h2 className="mt-5 text-3xl font-extrabold">{c.title}</h2>
                  <p className="mt-1 text-sm font-semibold text-white/85">{c.blurb}</p>
                  <span className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-extrabold text-foreground shadow-pop transition-transform group-hover:scale-105">
                    Start <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </main>
      )}
    </div>
  );
}