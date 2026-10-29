import { useTranslations } from "next-intl";
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
  const t = useTranslations("train.finish");
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display uppercase tracking-tight text-2xl">
            {t("title")}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              {remainingCount > 0 && (
                <div className="py-2">
                  <p className="font-display font-bold text-6xl leading-none text-destructive tabular-nums">
                    {remainingCount}
                  </p>
                  <p className="mt-1 kicker text-xs text-foreground">
                    {t("remaining", { count: remainingCount })}
                  </p>
                </div>
              )}
              <p>{t("kept")}</p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-xl">
            {t("keepTraining")}
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
            onClick={onConfirm}
          >
            {t("confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
