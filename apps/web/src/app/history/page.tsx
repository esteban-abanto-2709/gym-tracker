"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { routes } from "@/lib/routes";
import {
  ArrowLeft,
  Calendar,
  RotateCcw,
  MessageSquare,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Workout {
  id: string;
  exercise: string;
  description: string;
  weight: number;
  reps: number;
  opinion: string;
  createdAt: string;
}

export default function HistoryPage() {
  const router = useRouter();

  // State for lazy-loading and caching
  const [dates, setDates] = useState<string[]>([]);
  const [cachedWorkouts, setCachedWorkouts] = useState<
    Record<string, Workout[]>
  >({});
  const [selectedDate, setSelectedDate] = useState<string>("");

  const [loadingDates, setLoadingDates] = useState(true);
  const [loadingWorkouts, setLoadingWorkouts] = useState(false);

  // Edit and Delete state
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [deletingWorkout, setDeletingWorkout] = useState<Workout | null>(null);
  const [editReps, setEditReps] = useState("");
  const [editWeight, setEditWeight] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const fetchedDates = await api.get<string[]>(
          routes.api.workouts.dates(),
        );
        setDates(fetchedDates);

        if (fetchedDates.length > 0) {
          const initialDate = fetchedDates[0];
          setSelectedDate(initialDate);

          // Preload up to 4 dates
          const datesToPreload = fetchedDates.slice(0, 4);
          const preloadedData = await Promise.all(
            datesToPreload.map((d) =>
              api.get<Workout[]>(routes.api.workouts.list(d)),
            ),
          );

          setCachedWorkouts((prev) => {
            const newCache = { ...prev };
            datesToPreload.forEach((d, idx) => {
              newCache[d] = preloadedData[idx];
            });
            return newCache;
          });
        }
      } catch (error) {
        console.error("Error fetching dates:", error);
      } finally {
        setLoadingDates(false);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!selectedDate) return;
    if (cachedWorkouts[selectedDate] !== undefined) return; // Already cached

    const fetchDayWorkouts = async () => {
      setLoadingWorkouts(true);
      try {
        const data = await api.get<Workout[]>(
          routes.api.workouts.list(selectedDate),
        );
        setCachedWorkouts((prev) => ({ ...prev, [selectedDate]: data }));
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingWorkouts(false);
      }
    };

    fetchDayWorkouts();
  }, [selectedDate, cachedWorkouts]);

  const getDisplayDate = (dateStr: string) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const [y, m, d] = dateStr.split("-");
    if (!y || !m || !d) return dateStr;
    const dateObj = new Date(Number(y), Number(m) - 1, Number(d));

    if (dateObj.toDateString() === today.toDateString()) return "Hoy";
    if (dateObj.toDateString() === yesterday.toDateString()) return "Ayer";

    return new Intl.DateTimeFormat("es-ES", {
      weekday: "long",
      day: "2-digit",
      month: "short",
    })
      .format(dateObj)
      .replace(/^\w/, (c) => c.toUpperCase());
  };

  const handleRepeat = (exercise: Workout) => {
    sessionStorage.setItem(
      "gymtrack-last-set",
      JSON.stringify({
        exercise: exercise.exercise,
        description: exercise.description || "",
        weight: exercise.weight.toString(),
        reps: exercise.reps.toString(),
      }),
    );
    router.push("/?repeat=true");
  };

  const handleEditClick = (workout: Workout) => {
    setEditingWorkout(workout);
    setEditReps(workout.reps.toString());
    setEditWeight(workout.weight.toString());
  };

  const saveEdit = async () => {
    if (!editingWorkout) return;
    setActionLoading(true);
    try {
      await api.patch(routes.api.workouts.update(editingWorkout.id), {
        reps: Number(editReps),
        weight: Number(editWeight),
      });

      // Update Cache Locally
      setCachedWorkouts((prev) => {
        const dayWorkouts = prev[selectedDate] || [];
        return {
          ...prev,
          [selectedDate]: dayWorkouts.map((ex) =>
            ex.id === editingWorkout.id
              ? { ...ex, reps: Number(editReps), weight: Number(editWeight) }
              : ex,
          ),
        };
      });
      setEditingWorkout(null);
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingWorkout) return;
    setActionLoading(true);
    try {
      await api.delete(routes.api.workouts.delete(deletingWorkout.id));

      // Update Cache Locally
      setCachedWorkouts((prev) => {
        const dayWorkouts = prev[selectedDate] || [];
        return {
          ...prev,
          [selectedDate]: dayWorkouts.filter(
            (ex) => ex.id !== deletingWorkout.id,
          ),
        };
      });

      setDeletingWorkout(null);
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const currentWorkouts = cachedWorkouts[selectedDate] || [];

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden font-sans">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 35px,
              var(--foreground) 35px,
              var(--foreground) 36px
            )`,
          }}
        />
      </div>

      {/* Gradient Orbs */}
      <div
        className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{
          background: `radial-gradient(circle, hsl(var(--brand-gradient-start)), transparent)`,
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-5 blur-3xl pointer-events-none"
        style={{
          background: `radial-gradient(circle, hsl(var(--brand-gradient-end)), transparent)`,
        }}
      />

      {/* Header - Fixed */}
      <header className="shrink-0 px-6 py-4 border-b border-border z-10 bg-background/50 backdrop-blur-md sticky top-0">
        <div className="max-w-md mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <Link
              href={routes.home()}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-6 h-6" strokeWidth={2.5} />
            </Link>
            <h1 className="text-xl font-bold tracking-tight">Historial</h1>
            <div className="w-6" /> {/* Spacer */}
          </div>

          {/* Date Selector Dropdown/Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar items-center">
            <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
            {!loadingDates && dates.length === 0 && (
              <span className="text-sm text-muted-foreground">
                Sin registros
              </span>
            )}
            {dates.map((date) => (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all border-2 ${
                  selectedDate === date
                    ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "bg-card/50 border-input text-muted-foreground hover:border-border"
                }`}
              >
                {getDisplayDate(date)}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 py-6 pb-24 overflow-y-auto relative z-10 max-w-md mx-auto w-full">
        {loadingDates ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground font-medium animate-pulse">
              Cargando historial...
            </p>
          </div>
        ) : dates.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-6 text-center animate-fade-in-up">
            <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center">
              <Calendar className="w-10 h-10 text-muted-foreground/50" />
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-xl">Sin entrenamientos aún</h3>
              <p className="text-sm text-muted-foreground max-w-[250px]">
                Tus rutinas aparecerán aquí cuando guardes tu primer set.
              </p>
            </div>
            <Link
              href="/"
              className="px-8 py-3 bg-primary text-primary-foreground rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all"
            >
              Comenzar a entrenar
            </Link>
          </div>
        ) : loadingWorkouts && !cachedWorkouts[selectedDate] ? (
          <div className="flex flex-col items-center justify-center h-48 space-y-4">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground font-medium animate-pulse">
              Cargando rutinas del día...
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            <section className="animate-fade-in-up">
              <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4 px-1">
                {getDisplayDate(selectedDate)}
              </h2>

              <div className="space-y-3">
                {currentWorkouts.length === 0 ? (
                  <p className="text-sm text-muted-foreground opacity-70">
                    No hay entrenamientos este día.
                  </p>
                ) : (
                  currentWorkouts.map((exercise, idx) => (
                    <div
                      key={exercise.id}
                      className="group relative bg-card/40 backdrop-blur-sm border-2 border-input rounded-2xl p-4 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 animate-slide-in-right"
                      style={{ animationDelay: `${idx * 0.05}s` }}
                    >
                      {/* Brand Accent Line */}
                      <div className="absolute left-0 top-4 bottom-4 w-1 bg-linear-to-b from-[hsl(var(--brand-gradient-start))] to-[hsl(var(--brand-gradient-end))] rounded-r-full" />

                      <div className="pl-3">
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex-1">
                            <h3 className="font-bold text-foreground text-lg leading-tight mb-1">
                              {exercise.exercise}
                            </h3>
                            <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                              {new Date(exercise.createdAt).toLocaleTimeString(
                                "es-ES",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </span>
                          </div>

                          <button
                            onClick={() => handleRepeat(exercise)}
                            className="flex items-center gap-1.5 px-3 py-2 bg-linear-to-r from-[hsl(var(--brand-gradient-start))] to-[hsl(var(--brand-gradient-end))] text-primary-foreground rounded-xl text-[10px] font-black shadow-md hover:scale-105 active:scale-95 transition-all uppercase tracking-wider"
                          >
                            <RotateCcw
                              className="w-3.5 h-3.5"
                              strokeWidth={3}
                            />
                            Repetir
                          </button>
                        </div>

                        <div className="flex items-baseline gap-4 mt-3">
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-foreground">
                              {exercise.weight}
                            </span>
                            <span className="text-xs font-bold text-muted-foreground">
                              kg
                            </span>
                          </div>
                          <div className="h-4 w-px bg-border" />
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-foreground">
                              {exercise.reps}
                            </span>
                            <span className="text-xs font-bold text-muted-foreground">
                              reps
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-between items-end mt-4">
                          <div className="flex-1">
                            {exercise.opinion && (
                              <div className="flex gap-2 items-start text-sm text-muted-foreground bg-muted/30 p-3 rounded-xl border border-border/50">
                                <MessageSquare className="w-4 h-4 shrink-0 mt-0.5 text-primary/70" />
                                <p className="italic leading-snug">
                                  &ldquo;{exercise.opinion}&rdquo;
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={() => handleEditClick(exercise)}
                              className="p-2.5 text-muted-foreground hover:text-primary transition-colors rounded-xl bg-muted/30 hover:bg-muted"
                              title="Editar Set"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeletingWorkout(exercise)}
                              className="p-2.5 text-muted-foreground hover:text-destructive transition-colors rounded-xl bg-muted/30 hover:bg-destructive/10"
                              title="Eliminar Set"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <Link
        href="/"
        className="fixed bottom-6 right-6 w-14 h-14 bg-linear-to-r from-[hsl(var(--brand-gradient-start))] to-[hsl(var(--brand-gradient-end))] text-primary-foreground rounded-full flex items-center justify-center shadow-xl shadow-primary/40 hover:scale-110 active:scale-90 transition-all z-20"
      >
        <Plus className="w-7 h-7" strokeWidth={3} />
      </Link>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingWorkout}
        onOpenChange={(open) => !open && setEditingWorkout(null)}
      >
        <DialogContent className="sm:max-w-[425px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Editar Entrenamiento</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="edit-weight" className="text-sm font-medium">
                  Peso (kg)
                </label>
                <input
                  id="edit-weight"
                  type="number"
                  step="0.5"
                  value={editWeight}
                  onChange={(e) => setEditWeight(e.target.value)}
                  className="w-full px-4 py-3 bg-muted border-2 border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-reps" className="text-sm font-medium">
                  Repeticiones
                </label>
                <input
                  id="edit-reps"
                  type="number"
                  value={editReps}
                  onChange={(e) => setEditReps(e.target.value)}
                  className="w-full px-4 py-3 bg-muted border-2 border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={saveEdit}
              disabled={actionLoading}
              className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95 disabled:opacity-50"
            >
              {actionLoading ? "Guardando..." : "Guardar Cambios"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog
        open={!!deletingWorkout}
        onOpenChange={(open) => !open && setDeletingWorkout(null)}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este registro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminarán los datos de esta
              serie permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              disabled={actionLoading}
            >
              {actionLoading ? "Eliminando..." : "Eliminar Set"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
