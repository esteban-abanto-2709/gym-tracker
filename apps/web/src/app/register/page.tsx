"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { routes } from "@/lib/routes";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { Label } from "@/components/ui/label";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { Button } from "@/components/base/button";

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
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo registrar");
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-dvh flex flex-col px-6 pt-[calc(4rem+env(safe-area-inset-top))] pb-[calc(2rem+env(safe-area-inset-bottom))] max-w-md mx-auto w-full">
      <div className="h-2 rounded-sm hazard-bar mb-6" />
      <div>
        <p className="kicker text-primary text-2xs">{"// tu primera serie"}</p>
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
          <Label
            htmlFor="username"
            className="kicker font-bold text-muted-foreground text-2xs"
          >
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
          <Label
            htmlFor="email"
            className="kicker font-bold text-muted-foreground text-2xs"
          >
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
          <Label
            htmlFor="password"
            className="kicker font-bold text-muted-foreground text-2xs"
          >
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

        <Button
          type="submit"
          disabled={submitting}
          className="shadow-primary/30"
        >
          {submitting ? "Creando…" : "Crear cuenta"}
        </Button>

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

        <Link
          href={routes.privacy()}
          className="block text-xs text-center text-muted-foreground underline underline-offset-4"
        >
          Privacidad
        </Link>
      </form>
    </main>
  );
}
