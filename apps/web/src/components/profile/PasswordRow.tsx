"use client";

import { useState } from "react";
import { toast } from "sonner";
import { KeyRound, Loader2, Pencil } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/base/button";

const MIN_LENGTH = 8;

export function PasswordRow() {
  const { changePassword } = useAuth();
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function handleOpenChange(value: boolean) {
    if (saving) return;
    if (!value) {
      setCurrent("");
      setNext("");
      setError(null);
    }
    setOpen(value);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (next.length < MIN_LENGTH) {
      setError(
        `La nueva contraseña necesita al menos ${MIN_LENGTH} caracteres.`,
      );
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await changePassword(current, next);
      setSaving(false);
      handleOpenChange(false);
      toast.success(
        "Contraseña cambiada. Cerramos tu sesión en los demás dispositivos.",
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo cambiar la contraseña",
      );
      setSaving(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full text-left flex items-center gap-4 border-t-2 border-input px-5 py-3 transition-colors active:bg-muted"
      >
        <div className="shrink-0 w-14 grid place-items-center text-primary">
          <KeyRound className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="kicker text-4xs text-muted-foreground">Contraseña</p>
          <p className="font-bold text-foreground truncate">Cambiar</p>
        </div>
        <Pencil className="w-4 h-4 text-muted-foreground shrink-0" />
      </button>

      <AlertDialog open={open} onOpenChange={handleOpenChange}>
        <AlertDialogContent className="rounded-2xl">
          <form onSubmit={onSubmit} className="grid gap-4">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-display uppercase tracking-tight text-2xl">
                Cambiar contraseña
              </AlertDialogTitle>
              <AlertDialogDescription>
                Sigues dentro en este dispositivo; en los demás tendrás que
                volver a entrar.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="space-y-1.5">
              <Label htmlFor="current-password">Contraseña actual</Label>
              <PasswordInput
                id="current-password"
                autoComplete="current-password"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-password">Nueva contraseña</Label>
              <PasswordInput
                id="new-password"
                autoComplete="new-password"
                maxLength={72}
                value={next}
                onChange={(e) => setNext(e.target.value)}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl" disabled={saving}>
                Cancelar
              </AlertDialogCancel>
              <Button
                size="md"
                type="submit"
                disabled={saving || !current || !next}
                className="py-2 flex disabled:opacity-60"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Guardar
              </Button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
