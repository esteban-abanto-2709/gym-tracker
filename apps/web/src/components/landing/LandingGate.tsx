"use client";

import { FullScreenLoader, useAuth } from "@/lib/auth-context";
import { Landing } from "./Landing";

export function LandingGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  return user ? children : <Landing />;
}
