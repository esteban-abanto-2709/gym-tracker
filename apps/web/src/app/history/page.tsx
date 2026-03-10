"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  RotateCcw,
  MessageSquare,
  Plus,
} from "lucide-react";

// Mock data for visual proposal
const MOCK_WORKOUTS = [
  {
    date: "Hoy",
    exercises: [
      {
        id: 1,
        name: "Press de Banca",
        weight: "80",
        reps: "10",
        time: "14:20",
        notes: "Serie pesada, buena técnica",
      },
      { id: 2, name: "Press de Banca", weight: "80", reps: "8", time: "14:25" },
      {
        id: 3,
        name: "Aperturas con Mancuernas",
        weight: "18",
        reps: "12",
        time: "14:35",
        notes: "Súper lento el descenso",
      },
    ],
  },
  {
    date: "Ayer",
    exercises: [
      {
        id: 4,
        name: "Sentadillas",
        weight: "100",
        reps: "5",
        time: "10:15",
        notes: "RPE 9",
      },
      { id: 5, name: "Sentadillas", weight: "100", reps: "5", time: "10:22" },
      {
        id: 6,
        name: "Extensiones de Cuádriceps",
        weight: "45",
        reps: "15",
        time: "10:40",
      },
    ],
  },
  {
    date: "Lunes 08 Mar",
    exercises: [
      { id: 7, name: "Dominadas", weight: "0", reps: "12", time: "18:05" },
      {
        id: 8,
        name: "Remo con Barra",
        weight: "60",
        reps: "10",
        time: "18:15",
      },
    ],
  },
];

export default function HistoryPage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState("Hoy");

  const dates = ["Hoy", "Ayer", "Lunes 08 Mar"];

  const handleRepeat = (exercise: {
    name: string;
    notes?: string;
    weight: string;
    reps: string;
  }) => {
    sessionStorage.setItem(
      "gymtrack-last-set",
      JSON.stringify({
        exercise: exercise.name,
        description: exercise.notes || "",
        weight: exercise.weight,
        reps: exercise.reps,
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
              href="/"
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
        <div className="space-y-10">
          {MOCK_WORKOUTS.filter((g) => g.date === selectedDate).map((group) => (
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
                            {exercise.name}
                          </h3>
                          <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                            {exercise.time}
                          </span>
                        </div>

                        <button
                          onClick={() => handleRepeat(exercise)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-linear-to-r from-[hsl(var(--brand-gradient-start))] to-[hsl(var(--brand-gradient-end))] text-primary-foreground rounded-xl text-[10px] font-black shadow-md hover:scale-105 active:scale-95 transition-all uppercase tracking-wider"
                        >
                          <RotateCcw className="w-3.5 h-3.5" strokeWidth={3} />
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

                      {exercise.notes && (
                        <div className="mt-4 flex gap-2 items-start text-sm text-muted-foreground bg-muted/30 p-3 rounded-xl border border-border/50">
                          <MessageSquare className="w-4 h-4 shrink-0 mt-0.5 text-primary/70" />
                          <p className="italic leading-snug">
                            &ldquo;{exercise.notes}&rdquo;
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
