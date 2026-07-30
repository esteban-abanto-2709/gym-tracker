"use client";

import { useState, useRef, useEffect } from "react";
import type { Exercise } from "@/lib/types";
import { Search, Plus, Dumbbell, X } from "lucide-react";

interface ExerciseComboboxProps {
  exercises: Exercise[];
  loadingExercises: boolean;
  selectedExercise: Exercise | null;
  search: string;
  onSearchChange: (value: string) => void;
  onSelect: (exercise: Exercise) => void;
  onClearSelection: () => void;
  onCreateClick: () => void;
}

export function ExerciseCombobox({
  exercises,
  loadingExercises,
  selectedExercise,
  search,
  onSearchChange,
  onSelect,
  onClearSelection,
  onCreateClick,
}: ExerciseComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Click outside to close
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

  return (
    <div className="space-y-2 relative" ref={wrapperRef}>
      <label className="kicker text-muted-foreground text-[0.6rem] ml-1">
        Ejercicio <span className="text-primary">*</span>
      </label>

      {selectedExercise && !isOpen ? (
        <div
          className="flex items-center justify-between bg-card border-2 border-primary rounded-2xl p-3 cursor-pointer hover:bg-muted/50 transition-colors animate-fade-in"
          onClick={() => {
            onSearchChange("");
            setIsOpen(true);
          }}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-linear-to-br from-[hsl(var(--brand-gradient-start))] to-[hsl(var(--brand-gradient-end))] rounded-xl text-primary-foreground shadow-lg shadow-primary/20">
              <Dumbbell className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-[17px] text-foreground leading-tight">
                {selectedExercise.name}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClearSelection();
              onSearchChange("");
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
              onSearchChange(e.target.value);
              if (!isOpen) setIsOpen(true);
            }}
            onClick={() => setIsOpen(true)}
          />
          {search && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onSearchChange("");
                document.querySelector("input")?.focus();
              }}
              className="mr-3 p-1.5 rounded-full bg-muted text-muted-foreground hover:text-foreground hover:bg-border transition-colors object-contain z-10"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-[calc(100%+0.5rem)] left-0 right-0 bg-card border-2 border-border rounded-2xl shadow-xl shadow-black/40 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
          <div className="max-h-60 overflow-y-auto overscroll-contain">
            {exercises.length > 0 ? (
              <div className="p-2 space-y-1">
                {exercises.map((ex) => (
                  <button
                    key={ex.id}
                    type="button"
                    className="w-full text-left px-4 py-3 rounded-xl hover:bg-muted font-medium transition-colors flex items-center justify-between group"
                    onClick={() => {
                      onSelect(ex);
                      onSearchChange(ex.name);
                      setIsOpen(false);
                    }}
                  >
                    <span className="truncate pr-2">{ex.name}</span>
                  </button>
                ))}
              </div>
            ) : null}

            {/* Create button always at the bottom */}
            <div className="p-2 border-t border-border bg-muted/30">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onCreateClick();
                }}
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
  );
}
