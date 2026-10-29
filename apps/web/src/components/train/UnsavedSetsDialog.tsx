import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTranslations } from "next-intl";
import type { PendingSet } from "@/lib/pendingSets";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/base/button";
import { Spinner } from "@/components/base/spinner";

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
  const t = useTranslations();
  const count = sets?.length ?? 0;
  return (
    <AlertDialog open={sets != null} onOpenChange={(o) => !o && onClose()}>
      <AlertDialogContent className="rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display uppercase tracking-tight text-2xl">
            {retrying
              ? t("train.unsaved.saving")
              : t("train.unsaved.title", { count })}
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
                {t(retrying ? "train.unsaved.sending" : "train.unsaved.failed")}
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
              <Spinner className="size-5" />
            ) : (
              <RotateCcw className="w-5 h-5" strokeWidth={2.5} />
            )}
            {t("errors.retry")}
          </Button>
          <button
            type="button"
            onClick={onDiscard}
            disabled={retrying}
            className="w-full py-3 rounded-xl text-destructive font-bold active:scale-95 transition-all disabled:opacity-60"
          >
            {t("train.unsaved.discard")}
          </button>
          <AlertDialogCancel className="rounded-xl" disabled={retrying}>
            {t("train.finish.keepTraining")}
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
