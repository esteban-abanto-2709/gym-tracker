"use client";

import { toast } from "sonner";
import { Share2 } from "lucide-react";

export function ShareButton({ title, path }: { title: string; path: string }) {
  const share = async () => {
    const url = `${window.location.origin}${path}`;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch (e) {
        if (!(e instanceof DOMException && e.name === "AbortError")) {
          console.error("Error sharing:", e);
        }
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado");
    } catch (e) {
      console.error("Error copying link:", e);
      toast("Copia este link", { description: url, duration: 10000 });
    }
  };

  return (
    <button
      type="button"
      onClick={share}
      className="text-muted-foreground hover:text-foreground transition-colors"
      title="Compartir"
      aria-label="Compartir"
    >
      <Share2 className="w-5 h-5" />
    </button>
  );
}
