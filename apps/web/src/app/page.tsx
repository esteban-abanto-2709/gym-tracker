"use client";

import { useState, Suspense, useRef, useEffect } from "react";
import Link from "next/link";
import type { Equipment } from "@/lib/types";
import { useExercises } from "@/hooks/useExercises";
import { useWorkoutForm } from "@/hooks/useWorkoutForm";
import { History, Loader2, Search, Plus, Dumbbell, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

function HomeContent() {
  // --- Hooks de negocio ---
  const {
    exercises,
    loadingExercises,
    search,
    setSearch,
    filteredExercises,
    createExercise,
    creatingExercise,
  } = useExercises();

  const {
    weight,
    setWeight,
    reps,
    setReps,
    opinion,
    setOpinion,
    selectedExercise,
    setSelectedExercise,
    loading,
    handleSubmit,
  } = useWorkoutForm(exercises, loadingExercises);

  // --- Combobox local UI state ---
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // --- Modal local UI state ---
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEquipment, setNewEquipment] = useState<Equipment>("Sin asignar");

  // Click outside to close combobox
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Open creation modal
  const openCreationModal = () => {
    setNewName(search);
    setNewEquipment("Sin asignar");
    setIsOpen(false);
    setIsDialogOpen(true);
  };

  // Create exercise via hook + select it
  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      const created = await createExercise(newName, newEquipment);
      setSelectedExercise(created);
      setSearch(created.name);
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error creating exercise:", error);
    }
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

      {/* Gradient Orb */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{
          background: `radial-gradient(circle, hsl(var(--brand-gradient-start)), hsl(var(--brand-gradient-end)))`,
        }}
      />

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-md z-50 flex flex-col items-center justify-center">
          <Loader2 className="w-16 h-16 text-primary animate-spin mb-4" />
          <p className="text-lg font-bold text-foreground animate-pulse">
            Guardando...
          </p>
        </div>
      )}

      {/* Header - Fixed */}
      <header className="shrink-0 px-6 py-4 border-b border-border relative z-10 bg-background/50 backdrop-blur-md">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="w-6" />
          <h1 className="text-xl font-bold tracking-tight">
            <span className="bg-linear-to-r from-[hsl(var(--brand-gradient-start))] to-[hsl(var(--brand-gradient-end))] bg-clip-text text-transparent">
              GYM
            </span>
            <span className="text-foreground">TRACK</span>
          </h1>
          <Link
            href="/history"
            className="text-muted-foreground hover:text-foreground transition-all hover:scale-110 active:scale-90"
            title="Ver Historial"
          >
            <History className="w-6 h-6" />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 py-8 overflow-y-visible relative z-10 animate-fade-in-up">
        <form
          onSubmit={handleSubmit}
          className="max-w-md mx-auto space-y-6"
          autoComplete="off"
        >
          <div className="text-center mb-8">
            <h2 className="text-lg font-semibold text-foreground">
              Registrar Entrenamiento
            </h2>
            <p className="text-sm text-muted-foreground">
              Completa los detalles de tu set
            </p>
          </div>

          {/* EL SELECTOR UX (COMBOBOX CUSTOM) */}
          <div className="space-y-2 relative" ref={wrapperRef}>
            <label className="text-sm font-bold text-foreground ml-1">
              Ejercicio <span className="text-primary">*</span>
            </label>

            {selectedExercise && !isOpen ? (
              <div
                className="flex items-center justify-between bg-card border-2 border-primary rounded-2xl p-3 cursor-pointer hover:bg-muted/50 transition-colors animate-fade-in"
                onClick={() => {
                  setSearch("");
                  setIsOpen(true);
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-linear-to-br from-[hsl(var(--brand-gradient-start))] to-[hsl(var(--brand-gradient-end))] rounded-xl text-primary-foreground shadow-lg shadow-primary/20">
                    <Dumbbell className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-[17px] text-foreground leading-tight mb-0.5">
                      {selectedExercise.name}
                    </span>
                    <span className="text-[11px] font-black text-muted-foreground bg-muted w-fit px-2 py-0.5 rounded-md uppercase tracking-wide">
                      {selectedExercise.equipment}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedExercise(null);
                    setSearch("");
                    setIsOpen(true);
                  }}
                  className="p-2 mr-1 rounded-full text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div
                className={`relative flex items-center bg-card border-2 transition-all rounded-2xl ${isOpen ? "border-primary ring-2 ring-primary/20" : "border-input hover:border-primary/50"} animate-slide-in-right [animation-delay:0.1s]`}
              >
                <Search
                  className={`w-5 h-5 ml-4 shrink-0 transition-colors ${isOpen ? "text-primary" : "text-muted-foreground"}`}
                />
                <input
                  type="text"
                  autoFocus={isOpen}
                  placeholder={
                    loadingExercises
                      ? "Cargando ejercicios..."
                      : selectedExercise
                        ? "Buscar otro ejercicio..."
                        : "Busca o escribe para crear..."
                  }
                  disabled={loadingExercises}
                  className="w-full bg-transparent px-3 py-4 focus:outline-none text-foreground text-lg disabled:opacity-50 placeholder:text-muted-foreground/70"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    if (!isOpen) setIsOpen(true);
                  }}
                  onClick={() => setIsOpen(true)}
                />
                {search && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setSearch("");
                      document.querySelector("input")?.focus();
                    }}
                    className="mr-3 p-1.5 rounded-full bg-muted text-muted-foreground hover:text-foreground hover:bg-border transition-colors object-contain z-10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            {/* EL DESPLEGABLE */}
            {isOpen && (
              <div className="absolute top-[calc(100%+0.5rem)] left-0 right-0 bg-card border-2 border-border rounded-2xl shadow-xl shadow-black/40 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                <div className="max-h-60 overflow-y-auto overscroll-contain">
                  {filteredExercises.length > 0 ? (
                    <div className="p-2 space-y-1">
                      {filteredExercises.map((ex) => (
                        <button
                          key={ex.id}
                          type="button"
                          className="w-full text-left px-4 py-3 rounded-xl hover:bg-muted font-medium transition-colors flex items-center justify-between group"
                          onClick={() => {
                            setSelectedExercise(ex);
                            setSearch(ex.name);
                            setIsOpen(false);
                          }}
                        >
                          <span className="truncate pr-2">{ex.name}</span>
                          <span className="text-[10px] font-bold px-2 py-1 bg-background rounded-md text-muted-foreground border-border border shrink-0">
                            {ex.equipment}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : null}

                  {/* BOTÓN CREAR SIEMPRE AL FINAL */}
                  <div className="p-2 border-t border-border bg-muted/30">
                    <button
                      type="button"
                      onClick={openCreationModal}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-primary/10 text-primary transition-colors font-bold text-left"
                    >
                      <Plus className="w-4 h-4 shrink-0" strokeWidth={3} />
                      <span className="truncate">
                        Crear &quot;{search || "Nuevo"}&quot;...
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Peso y Reps en una fila */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="weight"
                className="block text-sm font-medium text-muted-foreground"
              >
                Peso (kg) <span className="text-primary">*</span>
              </label>
              <input
                id="weight"
                name="weight"
                type="number"
                step="0.5"
                inputMode="decimal"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="60"
                className="w-full px-4 py-4 text-lg bg-card border-2 border-input rounded-2xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all placeholder:text-muted-foreground text-center font-mono animate-slide-in-right [animation-delay:0.2s]"
                required
                autoComplete="off"
                data-1p-ignore
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="reps"
                className="block text-sm font-medium text-muted-foreground"
              >
                Repeticiones <span className="text-primary">*</span>
              </label>
              <input
                id="reps"
                name="reps"
                type="number"
                inputMode="numeric"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                placeholder="12"
                className="w-full px-4 py-4 text-lg bg-card border-2 border-input rounded-2xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all placeholder:text-muted-foreground text-center font-mono animate-slide-in-right [animation-delay:0.3s]"
                required
                autoComplete="off"
                data-1p-ignore
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="opinion"
              className="block text-sm font-medium text-muted-foreground"
            >
              ¿Cómo te sentiste?
            </label>
            <textarea
              id="opinion"
              name="opinion"
              value={opinion}
              onChange={(e) => setOpinion(e.target.value)}
              placeholder="Ej: Me sentí con buena energía hoy"
              rows={3}
              className="w-full px-4 py-3 text-base bg-card border-2 border-input rounded-2xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all placeholder:text-muted-foreground resize-none animate-slide-in-right [animation-delay:0.5s]"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !selectedExercise}
            className="group relative w-full py-4 bg-linear-to-r from-[hsl(var(--brand-gradient-start))] to-[hsl(var(--brand-gradient-end))] text-primary-foreground rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden animate-scale-in [animation-delay:0.6s]"
          >
            ✓ Registrar Set
            <div className="absolute inset-0 bg-linear-to-r from-[hsl(var(--brand-gradient-end))] to-[hsl(var(--brand-gradient-start))] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>

          {/* Hint */}
          <p className="text-xs text-muted-foreground text-center px-4 opacity-70">
            Se guardará automáticamente con fecha y hora
          </p>
        </form>
      </main>

      {/* DIALOG CREACIÓN RAPIDA */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl border-2 border-border overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-[hsl(var(--brand-gradient-start))] to-[hsl(var(--brand-gradient-end))]" />
          <DialogHeader className="pt-4">
            <DialogTitle className="flex items-center gap-2 text-xl font-black">
              <Dumbbell className="w-5 h-5 text-primary" />
              Nuevo Ejercicio
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <label className="text-sm font-bold ml-1 text-muted-foreground">
                ¿Cómo se llama?
              </label>
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ej. Prensa a una pierna"
                className="w-full px-4 py-4 bg-muted border-2 border-transparent focus:border-primary focus:bg-background outline-none rounded-2xl transition-all font-bold text-lg"
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold ml-1 text-muted-foreground">
                Tipo / Equipo
              </label>
              <div className="relative">
                <select
                  value={newEquipment}
                  onChange={(e) => setNewEquipment(e.target.value as Equipment)}
                  className="w-full px-4 py-4 bg-muted border-2 border-transparent focus:border-primary focus:bg-background outline-none rounded-2xl transition-all font-bold text-lg appearance-none cursor-pointer"
                >
                  {(
                    [
                      "Sin asignar",
                      "Barra",
                      "Mancuerna",
                      "Máquina",
                      "Polea",
                      "Peso Corporal",
                      "Otro",
                    ] as Equipment[]
                  ).map((equip) => (
                    <option key={equip} value={equip}>
                      {equip}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-muted-foreground">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="sm:justify-stretch">
            <button
              onClick={handleCreate}
              disabled={creatingExercise}
              className="w-full bg-primary text-primary-foreground font-black py-4 rounded-xl text-lg shadow-xl shadow-primary/30 active:scale-95 transition-all disabled:opacity-50"
            >
              {creatingExercise ? "Creando..." : "Crear y Seleccionar"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}
