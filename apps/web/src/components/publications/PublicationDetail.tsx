"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { routes } from "@/lib/routes";
import { notifyError } from "@/lib/notify";
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
import { Copy, Loader2, UserPlus } from "lucide-react";

const copyButtonClass =
  "w-full flex items-center justify-center gap-2 py-4 bg-linear-to-r from-[hsl(var(--brand-gradient-start))] to-[hsl(var(--brand-gradient-end))] text-primary-foreground rounded-2xl font-display uppercase tracking-wide text-2xl shadow-lg hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95 disabled:opacity-50";

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
  const router = useRouter();
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
        toast.success(
          activated ? "Programa copiado y activado" : "Programa copiado",
        );
        router.push(activated ? routes.home() : routes.programs());
      } else {
        await api.post<CopiedRoutine>(endpoint, {});
        toast.success("Rutina copiada");
        router.push(routes.routines());
      }
    } catch (e) {
      console.error("Error copying publication:", e);
      setCopying(false);
      notifyError("No se pudo copiar", copyAll);
    }
  };

  const copyOne = async (routinePosition: number) => {
    setCopying(true);
    try {
      await api.post<CopiedRoutine>(routes.api.explore.copy(kind, slug), {
        routinePosition,
      });
      toast.success("Rutina copiada");
      router.push(routes.routines());
    } catch (e) {
      console.error("Error copying routine:", e);
      setCopying(false);
      notifyError("No se pudo copiar la rutina", () =>
        copyOne(routinePosition),
      );
    }
  };

  return (
    <PageShell variant="history">
      {copying && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-md z-50 flex flex-col items-center justify-center">
          <Loader2 className="w-16 h-16 text-primary animate-spin mb-4" />
          <p className="text-lg font-bold text-foreground animate-pulse">
            Copiando...
          </p>
        </div>
      )}

      <AppHeader
        leftAction={
          <BackAction
            href={routes.explore(isProgram ? "programs" : "routines")}
          />
        }
        title={isProgram ? "Programa" : "Rutina"}
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
              Esta publicación ya no está disponible.
            </p>
          ) : (
            <>
              <div>
                <p className="kicker text-primary text-[0.65rem]">
                  de <AuthorName author={publication.author} />
                </p>
                <h1 className="font-display font-bold uppercase text-foreground text-4xl leading-[0.9] tracking-tight mt-2 break-words">
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
                    {publication.copyCount}{" "}
                    {publication.copyCount === 1 ? "copia" : "copias"}
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
                          aria-label={`Copiar solo ${routine.name}`}
                        >
                          <Copy className="w-3.5 h-3.5" />
                          Solo esta
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
                    Crea tu cuenta
                  </Link>
                  <p className="text-xs text-center text-muted-foreground">
                    {isProgram
                      ? "Con tu cuenta copias este programa y lo cambias a tu gusto."
                      : "Con tu cuenta copias esta rutina y la cambias a tu gusto."}{" "}
                    <Link
                      href={routes.login(routes.explorePublication(kind, slug))}
                      className="font-semibold text-foreground underline underline-offset-4"
                    >
                      Ya tengo cuenta
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
                    {isProgram ? "Copiar programa" : "Copiar rutina"}
                  </button>
                  <p className="text-xs text-center text-muted-foreground">
                    Es tu copia: puedes cambiarla sin tocar la original.
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
