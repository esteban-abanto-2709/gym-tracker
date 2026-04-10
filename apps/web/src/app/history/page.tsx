"use client";

import Link from "next/link";
import { routes } from "@/lib/routes";
import { PageShell } from "@/components/layout/PageShell";
import { AppHeader, BackAction } from "@/components/layout/AppHeader";
import { useWorkoutHistory } from "@/hooks/useWorkoutHistory";
import { WorkoutCard } from "@/components/history/WorkoutCard";
import { EditWorkoutDialog } from "@/components/history/EditWorkoutDialog";
import { DeleteWorkoutDialog } from "@/components/history/DeleteWorkoutDialog";
import { Calendar, Plus } from "lucide-react";

export default function HistoryPage() {
  const {
    dates,
    selectedDate,
    setSelectedDate,
    currentWorkouts,
    loadingDates,
    loadingWorkouts,
    cachedWorkouts,
    getDisplayDate,
    handleRepeat,
    editingWorkout,
    setEditingWorkout,
    editReps,
    setEditReps,
    editWeight,
    setEditWeight,
    handleEditClick,
    saveEdit,
    deletingWorkout,
    setDeletingWorkout,
    confirmDelete,
    actionLoading,
  } = useWorkoutHistory();

  return (
    <PageShell variant="history">
      <AppHeader
        leftAction={<BackAction href={routes.home()} />}
        title="Historial"
        sticky
      >
        {/* Date Selector Pills */}
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
      </AppHeader>

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
                  currentWorkouts.map((workout, idx) => (
                    <WorkoutCard
                      key={workout.id}
                      workout={workout}
                      index={idx}
                      onRepeat={handleRepeat}
                      onEdit={handleEditClick}
                      onDelete={setDeletingWorkout}
                    />
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
      <EditWorkoutDialog
        open={!!editingWorkout}
        onOpenChange={(open) => !open && setEditingWorkout(null)}
        weight={editWeight}
        onWeightChange={setEditWeight}
        reps={editReps}
        onRepsChange={setEditReps}
        loading={actionLoading}
        onSave={saveEdit}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteWorkoutDialog
        open={!!deletingWorkout}
        onOpenChange={(open) => !open && setDeletingWorkout(null)}
        loading={actionLoading}
        onConfirm={confirmDelete}
      />
    </PageShell>
  );
}
