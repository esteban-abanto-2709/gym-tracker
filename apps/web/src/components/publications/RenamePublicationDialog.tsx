import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ExploreListItem } from "@/lib/types";

const NAME_MAX = 100;

interface RenamePublicationDialogProps {
  publication: ExploreListItem | null;
  loading: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (name: string) => void;
}

export function RenamePublicationDialog({
  publication,
  loading,
  onOpenChange,
  onConfirm,
}: RenamePublicationDialogProps) {
  const [name, setName] = useState(publication?.name ?? "");
  const trimmed = name.trim();
  const canSave =
    trimmed.length > 0 && trimmed !== publication?.name && !loading;

  return (
    <Dialog open={publication !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display uppercase tracking-tight text-2xl">
            Renombrar
          </DialogTitle>
          <DialogDescription>
            Solo cambia el nombre visible. La dirección y lo publicado se quedan
            igual.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (canSave) onConfirm(trimmed);
          }}
          className="space-y-4"
        >
          <label htmlFor="publication-name" className="sr-only">
            Nombre
          </label>
          <input
            id="publication-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={NAME_MAX}
            autoComplete="off"
            className="w-full px-4 py-3 bg-muted border-2 border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
          <DialogFooter>
            <button
              type="submit"
              disabled={!canSave}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold disabled:opacity-50"
            >
              {loading ? "Guardando..." : "Guardar"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
