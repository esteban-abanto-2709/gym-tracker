"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { routes } from "@/lib/routes";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { Label } from "@/components/ui/label";
import { GoogleButton } from "@/components/auth/GoogleButton";

export default function RegisterPage() {
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register(
        email.trim().toLowerCase(),
        username.trim(),
        password.trim(),
      );
      // El guard de AuthProvider redirige al home al haber sesión.
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo registrar");
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-dvh flex flex-col px-6 pt-16 pb-8 max-w-md mx-auto w-full">
      {/* Cinta hazard + hero */}
      <div className="h-2 rounded-sm hazard-bar mb-6" />
      <div>
        <p className="kicker text-primary text-[0.7rem]">// tu primera serie</p>
        <h1 className="font-display font-bold uppercase text-foreground text-5xl leading-[0.88] tracking-tight mt-3">
          Crea tu
          <br />
          <span className="text-primary">cuenta.</span>
        </h1>
        <p className="text-muted-foreground text-sm mt-4 max-w-[88%]">
          Sin configurar nada. Entra y empieza a mover peso.
        </p>
      </div>

      <div className="flex-1 min-h-4" />

      <form onSubmit={onSubmit} className="space-y-3">
        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="username" className="kicker text-muted-foreground text-[0.7rem]">
            Nombre de usuario
          </Label>
          <Input
            id="username"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength={2}
            maxLength={30}
            className="h-auto rounded-2xl border-2 border-input bg-card px-4 py-4 text-base dark:bg-card"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email" className="kicker text-muted-foreground text-[0.7rem]">
            Correo
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-auto rounded-2xl border-2 border-input bg-card px-4 py-4 text-base dark:bg-card"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="kicker text-muted-foreground text-[0.7rem]">
            Contraseña
          </Label>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="h-auto rounded-2xl border-2 border-input bg-card px-4 py-4 text-base dark:bg-card"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full font-display uppercase tracking-wide text-2xl text-primary-foreground rounded-2xl py-4 bg-linear-to-r from-[hsl(var(--brand-gradient-start))] to-[hsl(var(--brand-gradient-end))] shadow-lg shadow-primary/30 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
        >
          {submitting ? "Creando…" : "Crear cuenta"}
        </button>

        <GoogleButton />

        <p className="text-sm text-center text-muted-foreground pt-1">
          ¿Ya tienes cuenta?{" "}
          <Link
            href={routes.login()}
            className="text-foreground font-semibold underline underline-offset-4"
          >
            Ingresa
          </Link>
        </p>
      </form>
    </main>
  );
}
