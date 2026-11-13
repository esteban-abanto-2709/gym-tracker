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
import type { RejectedSet } from "@/lib/pendingSets";

interface RejectedSetsDialogProps {
  sets: RejectedSet[] | null;
  onDiscard: () => void;
  onClose: () => void;
}

export function RejectedSetsDialog({
  sets,
  onDiscard,
  onClose,
}: RejectedSetsDialogProps) {
  const t = useTranslations();
  const count = sets?.length ?? 0;
  return (
    <AlertDialog open={sets != null} onOpenChange={(o) => !o && onClose()}>
      <AlertDialogContent className="rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display uppercase tracking-tight text-2xl">
            {t("train.rejected.title", { count })}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <ul className="space-y-1 font-mono text-xs text-foreground">
                {sets?.map((s) => (
                  <li key={s.clientId}>
                    <p className="truncate">{s.label}</p>
                    <p className="text-muted-foreground">{s.reason}</p>
                  </li>
                ))}
              </ul>
              <p>{t("train.rejected.body", { count })}</p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <button
            type="button"
            onClick={onDiscard}
            className="w-full py-3 rounded-xl text-destructive font-bold active:scale-95 transition-all"
          >
            {t("train.rejected.discard")}
          </button>
          <AlertDialogCancel className="rounded-xl">
            {t("train.finish.keepTraining")}
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
