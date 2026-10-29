"use client";

import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Share2 } from "lucide-react";

export function ShareButton({ title, path }: { title: string; path: string }) {
  const t = useTranslations("explore");
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
      toast.success(t("linkCopied"));
    } catch (e) {
      console.error("Error copying link:", e);
      toast(t("copyThisLink"), { description: url, duration: 10000 });
    }
  };

  return (
    <button
      type="button"
      onClick={share}
      className="text-muted-foreground hover:text-foreground transition-colors"
      title={t("share")}
      aria-label={t("share")}
    >
      <Share2 className="w-5 h-5" />
    </button>
  );
}
