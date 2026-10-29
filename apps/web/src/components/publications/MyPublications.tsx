"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api";
import { routes } from "@/lib/routes";
import { notifyError } from "@/lib/notify";
import type { ExploreListItem } from "@/lib/types";
import { ExploreCard } from "./ExploreCard";
import { RenamePublicationDialog } from "./RenamePublicationDialog";
import { DeletePublicationDialog } from "./DeletePublicationDialog";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/base/button";

interface MyPublicationsProps {
  items: ExploreListItem[];
  onChange: (items: ExploreListItem[]) => void;
}

export function MyPublications({ items, onChange }: MyPublicationsProps) {
  const t = useTranslations("explore.mine");
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
        items.map((p) =>
          p.id === updated.id ? { ...p, name: updated.name } : p,
        ),
      );
      setRenaming(null);
    } catch {
      notifyError(t("renameError"));
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
      toast.success(t("deleted"));
    } catch {
      notifyError(t("deleteError"));
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
              <Button
                variant="muted"
                size="icon"
                type="button"
                onClick={() => setRenaming(item)}
                aria-label={t("rename", { name: item.name })}
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                variant="danger"
                size="icon"
                type="button"
                onClick={() => setDeleting(item)}
                aria-label={t("delete", { name: item.name })}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
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
