"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { routes } from "@/lib/routes";
import type { AuthUser } from "@/lib/types";

const PUBLIC_PATHS = new Set<string>([routes.login(), routes.register()]);

interface AuthContextValue {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    username: string,
    password: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Bare fetch for the auth endpoints: a 401 here means "logged out / bad
// credentials", not "redirect", so it must bypass the ApiClient 401 handler.
async function authFetch<T>(endpoint: string, body?: unknown): Promise<T> {
  const res = await fetch(`/api${endpoint}`, {
    method: body ? "POST" : "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Error" }));
    throw new Error(err.message || "Request failed");
  }
  return res.json();
}

function FullScreenLoader() {
  return (
    <div className="min-h-dvh flex items-center justify-center text-muted-foreground">
      Cargando…
    </div>
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    authFetch<AuthUser>(routes.api.auth.me())
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setUser(await authFetch<AuthUser>(routes.api.auth.login(), { email, password }));
  }, []);

  const register = useCallback(
    async (email: string, username: string, password: string) => {
      setUser(
        await authFetch<AuthUser>(routes.api.auth.register(), {
          email,
          username,
          password,
        }),
      );
    },
    [],
  );

  const logout = useCallback(async () => {
    await authFetch(routes.api.auth.logout(), {});
    setUser(null);
    router.replace(routes.login());
  }, [router]);

  const isPublic = PUBLIC_PATHS.has(pathname);

  useEffect(() => {
    if (loading) return;
    if (!user && !isPublic) {
      router.replace(routes.login());
    } else if (user && isPublic) {
      router.replace(routes.home());
    }
  }, [loading, user, isPublic, router]);

  if (loading || (!user && !isPublic) || (user && isPublic)) {
    return <FullScreenLoader />;
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
