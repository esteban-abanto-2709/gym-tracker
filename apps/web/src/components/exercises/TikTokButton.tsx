"use client";

import { Play } from "lucide-react";
import { useTranslations } from "next-intl";
import { openTikTok } from "@/lib/tiktok";
import { cn } from "@/lib/utils";

interface TikTokButtonProps {
  query: string;
  className?: string;
}

export function TikTokButton({ query, className }: TikTokButtonProps) {
  const t = useTranslations("exercises");
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        openTikTok(query);
      }}
      className={cn(
        "flex w-9 h-9 shrink-0 items-center justify-center rounded-full border-2 border-input bg-card text-muted-foreground shadow-lg transition-all hover:text-foreground active:scale-95",
        className,
      )}
      aria-label={t("tiktok", { name: query })}
      title={t("tiktokTitle")}
    >
      <Play className="w-4 h-4 fill-current translate-x-px" />
    </button>
  );
}
