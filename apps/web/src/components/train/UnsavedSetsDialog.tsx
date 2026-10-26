import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { PendingSet } from "@/lib/pendingSets";
import { Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/base/button";

interface UnsavedSetsDialogProps {
  sets: PendingSet[] | null;
  retrying: boolean;
  onRetry: () => void;
  onDiscard: () => void;
  onClose: () => void;
}

export function UnsavedSetsDialog({
  sets,
  retrying,
  onRetry,
  onDiscard,
  onClose,
}: UnsavedSetsDialogProps) {
  const count = sets?.length ?? 0;
  return (
    <AlertDialog open={sets != null} onOpenChange={(o) => !o && onClose()}>
      <AlertDialogContent className="rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display uppercase tracking-tight text-2xl">
            {retrying
              ? "Guardando series"
              : count === 1
                ? "1 serie sin guardar"
                : `${count} series sin guardar`}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <ul className="space-y-1 font-mono text-xs text-foreground">
                {sets?.map((s) => (
                  <li key={s.clientId} className="truncate">
                    {s.label}
                  </li>
                ))}
              </ul>
              <p>
                {retrying
                  ? "Enviando lo que quedó pendiente."
                  : "No se pudieron enviar. Revisa tu conexión y reintenta."}
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button
            size="md"
            type="button"
            onClick={onRetry}
            disabled={retrying}
            className="w-full disabled:opacity-60"
          >
            {retrying ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <RotateCcw className="w-5 h-5" strokeWidth={2.5} />
            )}
            Reintentar
          </Button>
          <button
            type="button"
            onClick={onDiscard}
            disabled={retrying}
            className="w-full py-3 rounded-xl text-destructive font-bold active:scale-95 transition-all disabled:opacity-60"
          >
            Descartar y salir
          </button>
          <AlertDialogCancel className="rounded-xl" disabled={retrying}>
            Seguir entrenando
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
