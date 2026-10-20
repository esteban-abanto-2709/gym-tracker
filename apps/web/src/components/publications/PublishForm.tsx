"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { routes } from "@/lib/routes";
import { notifyError } from "@/lib/notify";
import { SLUG_MAX, isValidSlug, slugify } from "@/lib/slug";
import type {
  Program,
  Publication,
  PublicationKind,
  Routine,
} from "@/lib/types";
import { PageShell } from "@/components/layout/PageShell";
import { AppHeader, BackAction } from "@/components/layout/AppHeader";
import { RoutineSnapshotList } from "./RoutineSnapshotList";
import { Camera, Check, Globe, Loader2, X } from "lucide-react";

type SlugStatus = "invalid" | "checking" | "free" | "taken";

const DESCRIPTION_MAX = 280;

interface PublishFormProps {
  kind: PublicationKind;
  sourceId: string;
}

export function PublishForm({ kind, sourceId }: PublishFormProps) {
  const router = useRouter();
  const isRoutine = kind === "ROUTINE";
  const backHref = isRoutine
    ? routes.routineEdit(sourceId)
    : routes.programEdit(sourceId);

  const [name, setName] = useState("");
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [slug, setSlug] = useState("");
  const [checked, setChecked] = useState<{
    slug: string;
    available: boolean;
  } | null>(null);
  const [description, setDescription] = useState("");
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    const fetchSource = async () => {
      try {
        if (isRoutine) {
          const routine = await api.get<Routine>(
            routes.api.routines.get(sourceId),
          );
          setName(routine.name);
          setRoutines([routine]);
          setSlug(slugify(routine.name));
        } else {
          const program = await api.get<Program>(
            routes.api.programs.get(sourceId),
          );
          setName(program.name);
          setRoutines(program.routines);
          setSlug(slugify(program.name));
        }
      } catch (e) {
        console.error("Error fetching publish source:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchSource();
  }, [isRoutine, sourceId]);

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
      toast.success(isRoutine ? "Rutina publicada" : "Programa publicado");
      router.push(backHref);
    } catch (e) {
      console.error("Error publishing:", e);
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
      {publishing && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-md z-50 flex flex-col items-center justify-center">
          <Loader2 className="w-16 h-16 text-primary animate-spin mb-4" />
          <p className="text-lg font-bold text-foreground animate-pulse">
            Publicando...
          </p>
        </div>
      )}

      <AppHeader
        leftAction={<BackAction href={backHref} />}
        title={isRoutine ? "Publicar rutina" : "Publicar programa"}
      />

      <main className="flex-1 px-6 py-8 relative z-10 animate-fade-in-up">
        <div className="max-w-md mx-auto space-y-6">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
          ) : (
            <>
              <div>
                <p className="kicker text-primary text-[0.65rem]">
                  Vista previa
                </p>
                <h2 className="font-display font-bold uppercase text-foreground text-4xl leading-[0.9] tracking-tight mt-2 break-words">
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
                  className="kicker text-muted-foreground text-[0.65rem]"
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
                  className="kicker text-muted-foreground text-[0.65rem]"
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

              <button
                type="button"
                onClick={handlePublish}
                disabled={!canPublish}
                className="w-full py-4 bg-linear-to-r from-[hsl(var(--brand-gradient-start))] to-[hsl(var(--brand-gradient-end))] text-primary-foreground rounded-2xl font-display uppercase tracking-wide text-2xl shadow-lg hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Publicar
              </button>
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
        <Loader2 className="w-4 h-4 animate-spin" />
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
