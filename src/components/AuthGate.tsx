import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useSession } from "@/lib/auth";

export function AuthGate({ children }: { children: ReactNode }) {
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
  return <>{children}</>;
}