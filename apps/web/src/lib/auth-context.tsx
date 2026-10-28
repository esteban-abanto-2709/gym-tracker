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
import { isPrivatePath, isPublicPath, routes } from "@/lib/routes";
import { api, ApiError } from "@/lib/api";
import { discardPendingSets, setPendingOwner } from "@/lib/pendingSets";
import { getQueryClient } from "@/lib/query";
import type { AuthUser } from "@/lib/types";

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

const noRedirect = { redirectOn401: false };

// A 401 on the auth endpoints means "logged out / bad credentials", not
// "redirect", so these calls skip the ApiClient 401 handler.
async function authCall<T>(call: Promise<T>, copy?: ErrorCopy): Promise<T> {
  try {
    return await call;
  } catch (e) {
    throw authError(e instanceof ApiError ? e.status : 0, copy);
  }
}

type ErrorCopy = { fallback: string } & Partial<Record<number, string>>;

const TOO_MANY_ATTEMPTS =
  "Demasiados intentos. Espera un minuto y vuelve a probar.";

function authError(status: number, copy?: ErrorCopy) {
  return new Error(copy?.[status] ?? copy?.fallback ?? "Request failed");
}

let cachedFor: string | null = null;

function owning(user: AuthUser | null) {
  const id = user?.id ?? null;
  setPendingOwner(id);
  if (id !== cachedFor) getQueryClient().clear();
  cachedFor = id;
  return user;
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
    api
      .get<AuthUser>(routes.api.auth.me(), noRedirect)
      .then((me) => setUser(owning(me)))
      .catch(() => setUser(owning(null)))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setUser(
      owning(
        await authCall(
          api.post<AuthUser>(
            routes.api.auth.login(),
            { email, password },
            noRedirect,
          ),
          {
            401: "Correo o contraseña incorrectos.",
            429: TOO_MANY_ATTEMPTS,
            fallback: "No se pudo ingresar.",
          },
        ),
      ),
    );
  }, []);

  const register = useCallback(
    async (email: string, username: string, password: string) => {
      setUser(
        owning(
          await authCall(
            api.post<AuthUser>(
              routes.api.auth.register(),
              { email, username, password },
              noRedirect,
            ),
            {
              400: "Revisa los datos e inténtalo de nuevo.",
              409: "Ese correo ya tiene una cuenta.",
              429: TOO_MANY_ATTEMPTS,
              fallback: "No se pudo registrar.",
            },
          ),
        ),
      );
    },
    [],
  );

  const loginWithGoogle = useCallback(async (credential: string) => {
    setUser(
      owning(
        await authCall(
          api.post<AuthUser>(
            routes.api.auth.google(),
            { credential },
            noRedirect,
          ),
          {
            401: "Tu cuenta de Google no tiene el correo verificado.",
            fallback: "No se pudo ingresar con Google.",
          },
        ),
      ),
    );
  }, []);

  const logout = useCallback(async () => {
    await authCall(api.post(routes.api.auth.logout(), {}, noRedirect));
    setUser(owning(null));
    router.replace(routes.login());
  }, [router]);

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      setUser(
        await authCall(
          api.patch<AuthUser>(
            routes.api.auth.password(),
            { currentPassword, newPassword },
            noRedirect,
          ),
          {
            403: "La contraseña actual no es correcta.",
            429: TOO_MANY_ATTEMPTS,
            fallback: "No se pudo cambiar la contraseña.",
          },
        ),
      );
    },
    [],
  );

  const deleteAccount = useCallback(
    async (confirmation: { password?: string; email?: string }) => {
      await authCall(
        api.delete(routes.api.auth.me(), confirmation, noRedirect),
        {
          403: "No coincide. Revisa lo que escribiste.",
          429: TOO_MANY_ATTEMPTS,
          fallback: "No se pudo borrar la cuenta.",
        },
      );
      discardPendingSets();
      setUser(owning(null));
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
      if (changes.exerciseLocale) getQueryClient().invalidateQueries();
    },
    [],
  );

  const accountTheme = user?.theme ?? "system";
  const applyAccountTheme = useEffectEvent(() => setTheme(accountTheme));
  useEffect(() => {
    if (!loading) applyAccountTheme();
  }, [loading, accountTheme]);

  const isPublic = isPublicPath(pathname);
  const isPrivate = isPrivatePath(pathname);

  useEffect(() => {
    if (loading) return;
    if (!user && isPrivate) {
      router.replace(routes.login());
    } else if (user && isPublic) {
      router.replace(nextPath());
    }
  }, [loading, user, isPublic, isPrivate, router]);

  if (
    (isPrivate || isPublic) &&
    (loading || (!user && isPrivate) || (user && isPublic))
  ) {
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
