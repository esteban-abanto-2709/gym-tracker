"use client";

import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { routes } from "@/lib/routes";
import { notifyError } from "@/lib/notify";
import type { ExploreListItem } from "@/lib/types";
import { ExploreCard } from "./ExploreCard";
import { RenamePublicationDialog } from "./RenamePublicationDialog";
import { DeletePublicationDialog } from "./DeletePublicationDialog";
import { Pencil, Trash2 } from "lucide-react";

interface MyPublicationsProps {
  items: ExploreListItem[];
  onChange: (items: ExploreListItem[]) => void;
}

export function MyPublications({ items, onChange }: MyPublicationsProps) {
  const [renaming, setRenaming] = useState<ExploreListItem | null>(null);
  const [deleting, setDeleting] = useState<ExploreListItem | null>(null);
  const [busy, setBusy] = useState(false);

  const rename = async (name: string) => {
    if (!renaming) return;
    setBusy(true);
    try {
      const updated = await api.patch<{ id: string; name: string }>(
        routes.api.publications.update(renaming.id),
        { name },
      );
      onChange(
        items.map((p) => (p.id === updated.id ? { ...p, name: updated.name } : p)),
      );
      setRenaming(null);
    } catch (e) {
      console.error("Error renaming publication:", e);
      notifyError("No se pudo cambiar el nombre");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await api.delete(routes.api.publications.delete(deleting.id));
      setDeleting(null);
      onChange(items.filter((p) => p.id !== deleting.id));
      toast.success("Publicación eliminada");
    } catch (e) {
      console.error("Error deleting publication:", e);
      notifyError("No se pudo eliminar la publicación");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {items.map((item) => (
        <ExploreCard
          key={item.id}
          item={item}
          showKind
          actions={
            <div className="flex shrink-0 flex-col gap-2">
              <button
                type="button"
                onClick={() => setRenaming(item)}
                className="p-2.5 text-muted-foreground hover:text-primary transition-colors rounded-xl bg-muted/30 hover:bg-muted"
                aria-label={`Renombrar ${item.name}`}
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setDeleting(item)}
                className="p-2.5 text-muted-foreground hover:text-destructive transition-colors rounded-xl bg-muted/30 hover:bg-destructive/10"
                aria-label={`Eliminar ${item.name}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          }
        />
      ))}

      <RenamePublicationDialog
        key={renaming?.id}
        publication={renaming}
        loading={busy}
        onOpenChange={(open) => !open && setRenaming(null)}
        onConfirm={rename}
      />
      <DeletePublicationDialog
        publication={deleting}
        loading={busy}
        onOpenChange={(open) => !open && setDeleting(null)}
        onConfirm={remove}
      />
    </>
  );
}
