import type { ReactNode } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { routes } from "@/lib/routes";
import type { ExploreListItem } from "@/lib/types";
import { AuthorName } from "./AuthorName";
import { ChevronRight, Compass, Copy, Heart } from "lucide-react";
import { heading } from "@/components/base/heading";
import { Spinner } from "@/components/base/spinner";
import { cn } from "@/lib/utils";
import { surfaceClass } from "@/components/base/surface";

export function ExploreLoading() {
  return (
    <div className="flex justify-center py-16">
      <Spinner className="size-10 text-primary" />
    </div>
  );
}

export function ExploreEmpty({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="flex flex-col items-center text-center py-16 px-6 text-muted-foreground">
      <Compass className="w-12 h-12 mb-3 opacity-40" />
      <p className={heading({ size: "sm", className: "text-foreground" })}>
        {title}
      </p>
      <p className="text-sm opacity-70">{hint}</p>
    </div>
  );
}

export function ExploreCard({
  item,
  showKind = false,
  actions,
}: {
  item: ExploreListItem;
  showKind?: boolean;
  actions?: ReactNode;
}) {
  const t = useTranslations("explore");
  const isProgram = item.kind === "PROGRAM";
  const exercises = item.routines[0]?.exerciseCount ?? 0;

  return (
    <div
      className={cn(
        surfaceClass,
        "flex items-center gap-2 pr-3 hover:border-primary/50 transition-all",
      )}
    >
      <Link
        href={routes.explorePublication(item.kind, item.slug)}
        className="min-w-0 flex-1 p-4 active:scale-[0.98] transition-transform"
      >
        <span className="flex items-center gap-2">
          <span className="min-w-0 truncate font-bold text-foreground text-lg leading-tight">
            {item.name}
          </span>
          {item.isMine && !showKind && (
            <span className="shrink-0 rounded-md bg-secondary px-1.5 py-0.5 kicker text-5xs text-muted-foreground">
              {t("yours")}
            </span>
          )}
        </span>
        <span className="block kicker text-4xs text-muted-foreground mt-1.5">
          {showKind ? (
            t(isProgram ? "program" : "routine")
          ) : (
            <>
              {t("by")} <AuthorName author={item.author} />
            </>
          )}{" "}
          ·{" "}
          {isProgram
            ? t("routines", { count: item.routines.length })
            : t("exercises", { count: exercises })}
        </span>
        {isProgram && (
          <span className="block text-xs text-muted-foreground truncate mt-1">
            {item.routines.map((r) => r.name).join(" → ")}
          </span>
        )}
        <span className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Heart
              className={cn(
                "w-3.5 h-3.5",
                item.likedByMe ? "fill-primary text-primary" : "",
              )}
              aria-hidden
            />
            <span aria-label={t("likesLabel")}>{item.likeCount}</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <Copy className="w-3.5 h-3.5" aria-hidden />
            <span aria-label={t("copiesLabel")}>{item.copyCount}</span>
          </span>
        </span>
      </Link>
      {actions ?? (
        <ChevronRight className="shrink-0 w-5 h-5 text-muted-foreground" />
      )}
    </div>
  );
}
