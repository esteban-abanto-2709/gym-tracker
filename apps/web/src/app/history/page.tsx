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
} from "lucide-react";

interface Workout {
  id: string;
  exercise: string;
  description: string;
  weight: number;
  reps: number;
  opinion: string;
  createdAt: string;
}

interface GroupedWorkout {
  date: string;
  exercises: Workout[];
}

export default function HistoryPage() {
  const router = useRouter();
  const [groupedWorkouts, setGroupedWorkouts] = useState<GroupedWorkout[]>([]);
  const [selectedDate, setSelectedDate] = useState("Hoy");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const data = await api.get<Workout[]>(routes.api.workouts.list());

        // Grouping logic
        const groups: { [key: string]: Workout[] } = {};
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        const formatDate = (date: Date) => {
          const d = new Date(date);
          const now = new Date();
          const yesterday = new Date();
          yesterday.setDate(now.getDate() - 1);

          if (d.toDateString() === now.toDateString()) return "Hoy";
          if (d.toDateString() === yesterday.toDateString()) return "Ayer";

          return new Intl.DateTimeFormat("es-ES", {
            weekday: "long",
            day: "2-digit",
            month: "short",
          })
            .format(d)
            .replace(/^\w/, (c) => c.toUpperCase());
        };

        data.forEach((workout) => {
          const dateLabel = formatDate(new Date(workout.createdAt));
          if (!groups[dateLabel]) {
            groups[dateLabel] = [];
          }
          groups[dateLabel].push(workout);
        });

        const formattedGroups = Object.keys(groups).map((date) => ({
          date,
          exercises: groups[date],
        }));

        setGroupedWorkouts(formattedGroups);

        // Default select first date if exists
        if (formattedGroups.length > 0) {
          setSelectedDate(formattedGroups[0].date);
        }
      } catch (error) {
        console.error("Error fetching workouts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkouts();
  }, []);

  const dates = groupedWorkouts.map((g) => g.date);

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
                {date}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 py-6 pb-24 overflow-y-auto relative z-10 max-w-md mx-auto w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground font-medium animate-pulse">
              Cargando historial...
            </p>
          </div>
        ) : groupedWorkouts.length === 0 ? (
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
        ) : (
          <div className="space-y-10">
            {groupedWorkouts
              .filter((g) => g.date === selectedDate)
              .map((group) => (
                <section key={group.date} className="animate-fade-in-up">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4 px-1">
                    {group.date}
                  </h2>

                  <div className="space-y-3">
                    {group.exercises.map((exercise, idx) => (
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
                                {new Date(
                                  exercise.createdAt,
                                ).toLocaleTimeString("es-ES", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
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

                          {exercise.opinion && (
                            <div className="mt-4 flex gap-2 items-start text-sm text-muted-foreground bg-muted/30 p-3 rounded-xl border border-border/50">
                              <MessageSquare className="w-4 h-4 shrink-0 mt-0.5 text-primary/70" />
                              <p className="italic leading-snug">
                                &ldquo;{exercise.opinion}&rdquo;
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
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
    </div>
  );
}
