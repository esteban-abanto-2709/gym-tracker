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

interface DeleteRoutineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading: boolean;
  routineName?: string;
  onConfirm: () => void;
}

export function DeleteRoutineDialog({
  open,
  onOpenChange,
  loading,
  routineName,
  onConfirm,
}: DeleteRoutineDialogProps) {
  const t = useTranslations();
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display uppercase tracking-tight text-2xl">
            {routineName
              ? t("routines.deleteDialog.titleNamed", { name: routineName })
              : t("routines.deleteDialog.title")}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("routines.deleteDialog.message")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-xl">
            {t("common.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={loading}
          >
            {loading
              ? t("routines.deleteDialog.deleting")
              : t("routines.delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
