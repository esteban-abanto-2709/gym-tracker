import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface FinishSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  remainingCount: number;
  onConfirm: () => void;
}

export function FinishSessionDialog({
  open,
  onOpenChange,
  remainingCount,
  onConfirm,
}: FinishSessionDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display uppercase tracking-tight text-2xl">
            ¿Terminar la sesión?
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              {remainingCount > 0 && (
                <div className="py-2">
                  <p className="font-display font-bold text-6xl leading-none text-destructive tabular-nums">
                    {remainingCount}
                  </p>
                  <p className="mt-1 kicker text-xs text-foreground">
                    {remainingCount === 1
                      ? "ejercicio sin hacer"
                      : "ejercicios sin hacer"}
                  </p>
                </div>
              )}
              <p>Lo que ya registraste queda guardado en tu historial.</p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-xl">
            Seguir entrenando
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
            onClick={onConfirm}
          >
            Terminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
