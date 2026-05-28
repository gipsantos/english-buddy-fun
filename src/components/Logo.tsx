import { Link } from "@tanstack/react-router";

export function Logo() {
  return (
    <Link to="/" className="inline-flex items-center gap-2 group">
      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-header-gradient text-white text-xl shadow-soft transition-transform group-hover:rotate-[-6deg]">
        🦉
      </span>
      <span className="text-xl font-extrabold tracking-tight text-header-gradient">
        English Buddy
      </span>
    </Link>
  );
}