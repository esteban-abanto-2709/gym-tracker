"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { routes } from "@/lib/routes";
import { notifyError } from "@/lib/notify";
import {
  exploreKey,
  programsQuery,
  refetchAll,
  routinesQuery,
} from "@/lib/queries";
import { useAuth } from "@/lib/auth-context";
import type {
  CopiedProgram,
  CopiedRoutine,
  ExploreDetail,
  PublicationKind,
} from "@/lib/types";
import { PageShell } from "@/components/layout/PageShell";
import { AppHeader, BackAction } from "@/components/layout/AppHeader";
import { AuthorName } from "./AuthorName";
import { RoutineSnapshotList } from "./RoutineSnapshotList";
import { LikeButton } from "./LikeButton";
import { ShareButton } from "./ShareButton";
import { Copy, UserPlus } from "lucide-react";
import { buttonVariants } from "@/components/base/button";
import { cn } from "@/lib/utils";
import { heading } from "@/components/base/heading";
import { LoadingOverlay } from "@/components/base/spinner";

const copyButtonClass = cn(
  buttonVariants(),
  "hover:shadow-xl hover:shadow-primary/30",
);

interface PublicationDetailProps {
  kind: PublicationKind;
  slug: string;
  publication: ExploreDetail | null;
}

export function PublicationDetail({
  kind,
  slug,
  publication,
}: PublicationDetailProps) {
  const t = useTranslations("explore");
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, loading } = useAuth();
  const guest = !loading && !user;
  const isProgram = kind === "PROGRAM";
  const [copying, setCopying] = useState(false);

  const copyAll = async () => {
    setCopying(true);
    try {
      const endpoint = routes.api.explore.copy(kind, slug);
      if (isProgram) {
        const { activated } = await api.post<CopiedProgram>(endpoint, {});
        await refetchAll(queryClient, routinesQuery, programsQuery);
        queryClient.invalidateQueries({ queryKey: exploreKey });
        toast.success(t(activated ? "programCopiedActive" : "programCopied"));
        router.push(activated ? routes.home() : routes.programs());
      } else {
        await api.post<CopiedRoutine>(endpoint, {});
        await refetchAll(queryClient, routinesQuery);
        queryClient.invalidateQueries({ queryKey: exploreKey });
        toast.success(t("routineCopied"));
        router.push(routes.routines());
      }
    } catch {
      setCopying(false);
      notifyError(t("copyError"), copyAll);
    }
  };

  const copyOne = async (routinePosition: number) => {
    setCopying(true);
    try {
      await api.post<CopiedRoutine>(routes.api.explore.copy(kind, slug), {
        routinePosition,
      });
      await refetchAll(queryClient, routinesQuery);
      queryClient.invalidateQueries({ queryKey: exploreKey });
      toast.success(t("routineCopied"));
      router.push(routes.routines());
    } catch {
      setCopying(false);
      notifyError(t("copyRoutineError"), () => copyOne(routinePosition));
    }
  };

  return (
    <PageShell variant="history">
      {copying && <LoadingOverlay label={t("copying")} />}

      <AppHeader
        leftAction={
          <BackAction
            href={routes.explore(isProgram ? "programs" : "routines")}
          />
        }
        title={t(isProgram ? "program" : "routine")}
        rightAction={
          publication ? (
            <ShareButton
              title={publication.name}
              path={routes.explorePublication(kind, slug)}
            />
          ) : undefined
        }
      />

      <main className="flex-1 px-6 py-8 relative z-10 animate-fade-in-up">
        <div className="max-w-md mx-auto space-y-6">
          {!publication ? (
            <p className="text-center text-muted-foreground py-16">
              {t("unavailable")}
            </p>
          ) : (
            <>
              <div>
                <p className="kicker text-primary text-3xs">
                  {t("by")} <AuthorName author={publication.author} />
                </p>
                <h1
                  className={heading({
                    size: "md",
                    className: "text-foreground leading-[0.9] mt-2 break-words",
                  })}
                >
                  {publication.name}
                </h1>
                {publication.description && (
                  <p className="mt-3 text-sm text-muted-foreground whitespace-pre-line">
                    {publication.description}
                  </p>
                )}
                <p className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                  <LikeButton
                    kind={kind}
                    slug={slug}
                    likeCount={publication.likeCount}
                    likedByMe={publication.likedByMe}
                    readOnly={publication.isMine || guest}
                  />
                  <span className="inline-flex items-center gap-1.5">
                    <Copy className="w-4 h-4" aria-hidden />
                    {t("copies", { count: publication.copyCount })}
                  </span>
                </p>
              </div>

              <RoutineSnapshotList
                routines={publication.routines}
                renderAction={
                  isProgram && !guest && publication.routines.length > 1
                    ? (routine) => (
                        <button
                          type="button"
                          onClick={() => copyOne(routine.position)}
                          disabled={copying}
                          className="shrink-0 inline-flex items-center gap-1 rounded-lg border-2 border-input px-2 py-1 text-xs font-bold text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors disabled:opacity-50"
                          aria-label={t("copyOnly", { name: routine.name })}
                        >
                          <Copy className="w-3.5 h-3.5" />
                          {t("onlyThis")}
                        </button>
                      )
                    : undefined
                }
              />

              {guest ? (
                <div className="space-y-2">
                  <Link
                    href={routes.register(
                      routes.explorePublication(kind, slug),
                    )}
                    className={copyButtonClass}
                  >
                    <UserPlus className="w-5 h-5" strokeWidth={2.5} />
                    {t("signUp")}
                  </Link>
                  <p className="text-xs text-center text-muted-foreground">
                    {t(isProgram ? "signUpHintProgram" : "signUpHintRoutine")}{" "}
                    <Link
                      href={routes.login(routes.explorePublication(kind, slug))}
                      className="font-semibold text-foreground underline underline-offset-4"
                    >
                      {t("haveAccount")}
                    </Link>
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={copyAll}
                    disabled={copying}
                    className={copyButtonClass}
                  >
                    <Copy className="w-5 h-5" strokeWidth={2.5} />
                    {t(isProgram ? "copyProgram" : "copyRoutine")}
                  </button>
                  <p className="text-xs text-center text-muted-foreground">
                    {t("yourCopy")}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </PageShell>
  );
}
