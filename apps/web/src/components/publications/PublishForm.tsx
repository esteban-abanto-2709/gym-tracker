"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { routes } from "@/lib/routes";
import { notifyError } from "@/lib/notify";
import { getQueryClient } from "@/lib/query";
import { exploreKey, programQuery, routineQuery } from "@/lib/queries";
import { SLUG_MAX, isValidSlug, slugify } from "@/lib/slug";
import type { Publication, PublicationKind, Routine } from "@/lib/types";
import { PageShell } from "@/components/layout/PageShell";
import { AppHeader, BackAction } from "@/components/layout/AppHeader";
import { RoutineSnapshotList } from "./RoutineSnapshotList";
import { Camera, Check, Globe, X } from "lucide-react";
import { Button } from "@/components/base/button";
import { heading } from "@/components/base/heading";
import { LoadingOverlay, Spinner } from "@/components/base/spinner";

type SlugStatus = "invalid" | "checking" | "free" | "taken";

const DESCRIPTION_MAX = 280;

interface PublishFormProps {
  kind: PublicationKind;
  sourceId: string;
}

const NO_ROUTINES: Routine[] = [];

export function PublishForm({ kind, sourceId }: PublishFormProps) {
  const router = useRouter();
  const isRoutine = kind === "ROUTINE";
  const backHref = isRoutine
    ? routes.routineEdit(sourceId)
    : routes.programEdit(sourceId);

  const routineSource = useQuery({
    ...routineQuery(sourceId),
    enabled: isRoutine,
  });
  const programSource = useQuery({
    ...programQuery(sourceId),
    enabled: !isRoutine,
  });
  const source = isRoutine ? routineSource : programSource;
  const name = source.data?.name ?? "";
  const routines = isRoutine
    ? routineSource.data
      ? [routineSource.data]
      : NO_ROUTINES
    : (programSource.data?.routines ?? NO_ROUTINES);
  const loading = source.isPending;
  const [slug, setSlug] = useState("");
  const [seeded, setSeeded] = useState(false);
  if (!seeded && source.data) {
    setSlug(slugify(source.data.name));
    setSeeded(true);
  }
  const [checked, setChecked] = useState<{
    slug: string;
    available: boolean;
  } | null>(null);
  const [description, setDescription] = useState("");
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    if (!isValidSlug(slug)) return;
    let current = true;
    const timer = setTimeout(async () => {
      try {
        const { available } = await api.get<{ available: boolean }>(
          routes.api.publications.slugAvailable(kind, slug),
        );
        if (current) setChecked({ slug, available });
      } catch (e) {
        console.error("Error checking slug:", e);
      }
    }, 350);
    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [kind, slug]);

  const status: SlugStatus = !isValidSlug(slug)
    ? "invalid"
    : checked?.slug !== slug
      ? "checking"
      : checked.available
        ? "free"
        : "taken";
  const empty = routines.length === 0;
  const canPublish = status === "free" && !empty && !publishing;

  const handlePublish = async () => {
    if (!canPublish) return;
    setPublishing(true);
    try {
      const endpoint = isRoutine
        ? routes.api.publications.publishRoutine(sourceId)
        : routes.api.publications.publishProgram(sourceId);
      await api.post<Publication>(endpoint, {
        slug,
        description: description.trim() || undefined,
      });
      getQueryClient().invalidateQueries({ queryKey: exploreKey });
      toast.success(isRoutine ? "Rutina publicada" : "Programa publicado");
      router.push(backHref);
    } catch (e) {
      setPublishing(false);
      if (e instanceof Error && e.message === "Slug already taken") {
        setChecked({ slug, available: false });
      } else {
        notifyError("No se pudo publicar", handlePublish);
      }
    }
  };

  const path = `/explore/${isRoutine ? "routines" : "programs"}/${slug}`;

  return (
    <PageShell variant="history">
      {publishing && <LoadingOverlay label="Publicando..." />}

      <AppHeader
        leftAction={<BackAction href={backHref} />}
        title={isRoutine ? "Publicar rutina" : "Publicar programa"}
      />

      <main className="flex-1 px-6 py-8 relative z-10 animate-fade-in-up">
        <div className="max-w-md mx-auto space-y-6">
          {loading ? (
            <div className="flex justify-center py-16">
              <Spinner className="size-10 text-primary" />
            </div>
          ) : (
            <>
              <div>
                <p className="kicker text-primary text-3xs">Vista previa</p>
                <h2
                  className={heading({
                    size: "md",
                    className: "text-foreground leading-[0.9] mt-2 break-words",
                  })}
                >
                  {name}
                </h2>
              </div>

              {empty ? (
                <p className="text-sm text-muted-foreground">
                  Agrega rutinas al programa antes de publicarlo.
                </p>
              ) : (
                <RoutineSnapshotList routines={routines} />
              )}

              <div className="flex gap-3 rounded-2xl bg-secondary/60 p-4 text-sm text-muted-foreground">
                <Camera className="w-5 h-5 shrink-0 text-primary" />
                <p>
                  Se publica tal como está hoy. Si después la cambias, la
                  publicación no cambia.
                </p>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="publish-slug"
                  className="kicker text-muted-foreground text-3xs"
                >
                  Dirección (URL)
                </label>
                <input
                  id="publish-slug"
                  value={slug}
                  onChange={(e) =>
                    setSlug(
                      e.target.value
                        .toLowerCase()
                        .replace(/\s+/g, "-")
                        .slice(0, SLUG_MAX),
                    )
                  }
                  className="w-full rounded-xl border-2 border-input bg-card px-3 py-3 font-mono text-base text-foreground outline-none focus:border-primary transition-colors"
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck={false}
                />
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground break-all">
                  <Globe className="w-3.5 h-3.5 shrink-0" />
                  {path}
                </p>
                <SlugHint status={status} />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="publish-description"
                  className="kicker text-muted-foreground text-3xs"
                >
                  Descripción (opcional)
                </label>
                <textarea
                  id="publish-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={DESCRIPTION_MAX}
                  rows={3}
                  placeholder="Para quién es, cuántos días, qué busca"
                  className="w-full rounded-xl border-2 border-input bg-card px-3 py-3 text-base text-foreground outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/60 resize-none"
                />
                <p className="text-right text-xs text-muted-foreground">
                  {description.length}/{DESCRIPTION_MAX}
                </p>
              </div>

              <Button
                type="button"
                onClick={handlePublish}
                disabled={!canPublish}
                className="hover:shadow-xl hover:shadow-primary/30"
              >
                Publicar
              </Button>
            </>
          )}
        </div>
      </main>
    </PageShell>
  );
}

function SlugHint({ status }: { status: SlugStatus }) {
  if (status === "checking") {
    return (
      <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Spinner className="size-4" />
        Revisando...
      </p>
    );
  }
  if (status === "free") {
    return (
      <p className="flex items-center gap-1.5 text-sm text-success">
        <Check className="w-4 h-4" />
        Disponible
      </p>
    );
  }
  return (
    <p className="flex items-center gap-1.5 text-sm text-destructive">
      <X className="w-4 h-4" />
      {status === "taken"
        ? "Ya está en uso. Prueba otra."
        : "De 3 a 60 caracteres: minúsculas, números y guiones."}
    </p>
  );
}
