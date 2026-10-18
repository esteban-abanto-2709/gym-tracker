"use client";

import { useAuth } from "@/lib/auth-context";
import { Landing } from "./Landing";

export function LandingGate({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return user ? children : <Landing />;
}
