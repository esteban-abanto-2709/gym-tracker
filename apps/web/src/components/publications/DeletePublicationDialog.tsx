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
import type { ExploreListItem } from "@/lib/types";

interface DeletePublicationDialogProps {
  publication: ExploreListItem | null;
  loading: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeletePublicationDialog({
  publication,
  loading,
  onOpenChange,
  onConfirm,
}: DeletePublicationDialogProps) {
  const t = useTranslations();
  const likes = publication?.likeCount ?? 0;
  const copies = publication?.copyCount ?? 0;

  return (
    <AlertDialog open={publication !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display uppercase tracking-tight text-2xl">
            {t("explore.deleteDialog.title")}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2 text-left">
              <p>
                {publication
                  ? t("explore.deleteDialog.message", {
                      name: publication.name,
                    })
                  : t("explore.deleteDialog.messageUnnamed")}
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  {likes === 0
                    ? t("explore.deleteDialog.noLikes")
                    : t("explore.deleteDialog.losesLikes", { count: likes })}
                </li>
                <li>
                  {copies === 0
                    ? t("explore.deleteDialog.noCopies")
                    : t("explore.deleteDialog.copies", { count: copies })}
                </li>
                <li>{t("explore.deleteDialog.original")}</li>
              </ul>
            </div>
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
            {t(
              loading
                ? "explore.deleteDialog.deleting"
                : "explore.deleteDialog.delete",
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
