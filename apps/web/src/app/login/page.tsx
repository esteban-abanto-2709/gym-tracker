"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { routes } from "@/lib/routes";
import { Input } from "@/components/ui/input";
import { fieldInputClass } from "@/components/base/field";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { Label } from "@/components/ui/label";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { Button } from "@/components/base/button";
import { heading } from "@/components/base/heading";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email.trim().toLowerCase(), password.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo ingresar");
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-dvh flex flex-col px-6 pt-[calc(4rem+env(safe-area-inset-top))] pb-[calc(2rem+env(safe-area-inset-bottom))] max-w-md mx-auto w-full">
      <div className="h-2 rounded-sm hazard-bar mb-6" />
      <div>
        <p className="kicker text-primary text-2xs">
          {"// directo a entrenar"}
        </p>
        <h1
          className={heading({
            size: "lg",
            className: "text-foreground leading-[0.88] mt-3",
          })}
        >
          Sin vueltas.
          <br />
          <span className="text-primary">A entrenar.</span>
        </h1>
        <p className="text-muted-foreground text-sm mt-4 max-w-[88%]">
          Abre, registra la serie, cierra. Nada entre tú y el peso.
        </p>
      </div>

      <div className="flex-1 min-h-4" />

      <form onSubmit={onSubmit} className="space-y-3">
        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}

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
            className={fieldInputClass}
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
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={fieldInputClass}
          />
        </div>

        <Button
          type="submit"
          disabled={submitting}
          className="shadow-primary/30"
        >
          {submitting ? "Ingresando…" : "Ingresar"}
        </Button>

        <GoogleButton />

        <p className="text-sm text-center text-muted-foreground pt-1">
          ¿No tienes cuenta?{" "}
          <Link
            href={routes.register()}
            className="text-foreground font-semibold underline underline-offset-4"
          >
            Regístrate
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
