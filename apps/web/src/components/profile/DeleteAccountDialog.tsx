"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { useAuth } from "@/lib/auth-context";

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteAccountDialog({
  open,
  onOpenChange,
}: DeleteAccountDialogProps) {
  const { user, deleteAccount } = useAuth();
  const hasPassword = user?.hasPassword ?? false;
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  function handleOpenChange(next: boolean) {
    if (deleting) return;
    if (!next) {
      setValue("");
      setError(null);
    }
    onOpenChange(next);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setDeleting(true);
    try {
      await deleteAccount(hasPassword ? { password: value } : { email: value });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo borrar la cuenta",
      );
      setDeleting(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="rounded-2xl">
        <form onSubmit={onSubmit} className="grid gap-4">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display uppercase tracking-tight text-2xl">
              ¿Borrar tu cuenta?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Se borran para siempre tus series, rutinas, programas, medidas y
              fecha de nacimiento. No se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-1.5">
            <Label htmlFor="delete-confirmation">
              {hasPassword
                ? "Escribe tu contraseña para confirmar"
                : "Escribe tu correo para confirmar"}
            </Label>
            {hasPassword ? (
              <PasswordInput
                id="delete-confirmation"
                autoComplete="current-password"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            ) : (
              <Input
                id="delete-confirmation"
                type="email"
                autoCapitalize="none"
                autoComplete="off"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl" disabled={deleting}>
              Cancelar
            </AlertDialogCancel>
            <button
              type="submit"
              disabled={deleting || !value.trim()}
              className="py-2 px-4 rounded-xl bg-destructive text-destructive-foreground font-bold flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-60"
            >
              {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
              Borrar mi cuenta
            </button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
