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
  const likes = publication?.likeCount ?? 0;
  const copies = publication?.copyCount ?? 0;

  return (
    <AlertDialog open={publication !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display uppercase tracking-tight text-2xl">
            ¿Eliminar la publicación?
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2 text-left">
              <p>
                {publication ? `"${publication.name}"` : "Esta publicación"} deja
                de verse en Explorar y no se puede deshacer.
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  {likes === 0
                    ? "No tiene me gusta."
                    : `Pierdes ${likes} me gusta.`}
                </li>
                <li>
                  {copies === 0
                    ? "Nadie la ha copiado."
                    : `${copies} ${copies === 1 ? "persona la copió" : "personas la copiaron"}: sus copias se quedan.`}
                </li>
                <li>Tu rutina o programa original no se toca.</li>
              </ul>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={loading}
          >
            {loading ? "Eliminando..." : "Eliminar publicación"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
