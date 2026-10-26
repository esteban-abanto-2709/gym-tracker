"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useEffectEvent,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { routes } from "@/lib/routes";
import { api } from "@/lib/api";
import type { AuthUser } from "@/lib/types";

const PUBLIC_PATHS = new Set<string>([routes.login(), routes.register()]);
const OPEN_PATHS = new Set<string>([routes.home(), routes.privacy()]);
const OPEN_SECTIONS = [routes.explore()];

const isOpenPath = (pathname: string) =>
  OPEN_PATHS.has(pathname) ||
  OPEN_SECTIONS.some(
    (section) => pathname === section || pathname.startsWith(`${section}/`),
  );

function nextPath() {
  const next = new URLSearchParams(window.location.search).get("next");
  return next && /^\/(?![/\\])/.test(next) ? next : routes.home();
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    username: string,
    password: string,
  ) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  logout: () => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<void>;
  deleteAccount: (confirmation: {
    password?: string;
    email?: string;
  }) => Promise<void>;
  updateMe: (
    changes: Partial<
      Pick<
        AuthUser,
        "birthDate" | "exerciseLocale" | "theme" | "newsOpened" | "newsSeen"
      >
    >,
  ) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Bare fetch for the auth endpoints: a 401 here means "logged out / bad
// credentials", not "redirect", so it must bypass the ApiClient 401 handler.
async function authFetch<T>(
  endpoint: string,
  body?: unknown,
  copy?: ErrorCopy,
): Promise<T> {
  const res = await fetch(`/api${endpoint}`, {
    method: body ? "POST" : "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw authError(res.status, copy);
  return res.json();
}

type ErrorCopy = { fallback: string } & Partial<Record<number, string>>;

const TOO_MANY_ATTEMPTS =
  "Demasiados intentos. Espera un minuto y vuelve a probar.";

function authError(status: number, copy?: ErrorCopy) {
  return new Error(copy?.[status] ?? copy?.fallback ?? "Request failed");
}

export function FullScreenLoader() {
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
  const { setTheme } = useTheme();

  useEffect(() => {
    authFetch<AuthUser>(routes.api.auth.me())
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setUser(
      await authFetch<AuthUser>(
        routes.api.auth.login(),
        { email, password },
        {
          401: "Correo o contraseña incorrectos.",
          429: TOO_MANY_ATTEMPTS,
          fallback: "No se pudo ingresar.",
        },
      ),
    );
  }, []);

  const register = useCallback(
    async (email: string, username: string, password: string) => {
      setUser(
        await authFetch<AuthUser>(
          routes.api.auth.register(),
          { email, username, password },
          {
            400: "Revisa los datos e inténtalo de nuevo.",
            409: "Ese correo ya tiene una cuenta.",
            429: TOO_MANY_ATTEMPTS,
            fallback: "No se pudo registrar.",
          },
        ),
      );
    },
    [],
  );

  const loginWithGoogle = useCallback(async (credential: string) => {
    setUser(
      await authFetch<AuthUser>(
        routes.api.auth.google(),
        { credential },
        {
          401: "Tu cuenta de Google no tiene el correo verificado.",
          fallback: "No se pudo ingresar con Google.",
        },
      ),
    );
  }, []);

  const logout = useCallback(async () => {
    await authFetch(routes.api.auth.logout(), {});
    setUser(null);
    router.replace(routes.login());
  }, [router]);

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      const res = await fetch(`/api${routes.api.auth.password()}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) {
        throw authError(res.status, {
          403: "La contraseña actual no es correcta.",
          429: TOO_MANY_ATTEMPTS,
          fallback: "No se pudo cambiar la contraseña.",
        });
      }
      setUser(await res.json());
    },
    [],
  );

  const deleteAccount = useCallback(
    async (confirmation: { password?: string; email?: string }) => {
      const res = await fetch(`/api${routes.api.auth.me()}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(confirmation),
      });
      if (!res.ok) {
        throw authError(res.status, {
          403: "No coincide. Revisa lo que escribiste.",
          429: TOO_MANY_ATTEMPTS,
          fallback: "No se pudo borrar la cuenta.",
        });
      }
      setUser(null);
      router.replace(routes.login());
    },
    [router],
  );

  const updateMe = useCallback(
    async (
      changes: Partial<
        Pick<
          AuthUser,
          "birthDate" | "exerciseLocale" | "theme" | "newsOpened" | "newsSeen"
        >
      >,
    ) => {
      setUser(await api.patch<AuthUser>(routes.api.auth.me(), changes));
    },
    [],
  );

  const accountTheme = user?.theme ?? "system";
  const applyAccountTheme = useEffectEvent(() => setTheme(accountTheme));
  useEffect(() => {
    if (!loading) applyAccountTheme();
  }, [loading, accountTheme]);

  const isPublic = PUBLIC_PATHS.has(pathname);
  const isOpen = isOpenPath(pathname);

  useEffect(() => {
    if (loading || isOpen) return;
    if (!user && !isPublic) {
      router.replace(routes.login());
    } else if (user && isPublic) {
      router.replace(nextPath());
    }
  }, [loading, user, isPublic, isOpen, router]);

  if (!isOpen && (loading || (!user && !isPublic) || (user && isPublic))) {
    return <FullScreenLoader />;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        loginWithGoogle,
        logout,
        changePassword,
        deleteAccount,
        updateMe,
      }}
    >
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
