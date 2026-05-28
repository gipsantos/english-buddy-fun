import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
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
  return (
    <div className="relative min-h-screen overflow-hidden bg-app-gradient">
      {/* decorative blobs */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-secondary/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-primary/40 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 right-1/4 h-48 w-48 rounded-full bg-accent/30 blur-3xl" />

      <header className="relative z-10 px-6 py-6 md:px-12">
        <Logo />
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
          Pick your profile and jump into a world of words, games, and gold stars.
        </p>

        <div className="mt-14 grid w-full gap-8 md:grid-cols-2">
          <ProfileCard
            to="/student"
            label="Student"
            tag="I want to play & learn"
            image={studentAvatar}
            gradient="bg-student-gradient"
            float="animate-float"
          />
          <ProfileCard
            to="/parent"
            label="Parent"
            tag="Track my child's progress"
            image={parentAvatar}
            gradient="bg-parent-gradient"
            float="animate-float-delay"
          />
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
  gradient,
  float,
}: {
  to: "/student" | "/parent";
  label: string;
  tag: string;
  image: string;
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
        <img
          src={image}
          alt={`${label} avatar`}
          width={768}
          height={768}
          className={`h-48 w-48 object-contain drop-shadow-xl md:h-56 md:w-56 ${float}`}
        />
      </div>
      <h2 className="mt-6 text-4xl font-extrabold tracking-tight md:text-5xl">{label}</h2>
      <p className="mt-2 text-base font-medium text-white/85">{tag}</p>
      <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-base font-bold text-foreground shadow-pop transition-transform group-hover:scale-105">
        Let's go →
      </span>
    </Link>
  );
}
