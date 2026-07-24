"use client";

import { useState } from "react";
import { Dumbbell } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface CreateExerciseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialName: string;
  loading: boolean;
  onCreate: (name: string) => void;
}

export function CreateExerciseModal({
  open,
  onOpenChange,
  initialName,
  loading,
  onCreate,
}: CreateExerciseModalProps) {
  const [name, setName] = useState(initialName);
  const [prevOpen, setPrevOpen] = useState(false);

  if (open && !prevOpen) {
    setName(initialName);
  }
  if (open !== prevOpen) {
    setPrevOpen(open);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Prensa a una pierna"
              className="w-full px-4 py-4 bg-muted border-2 border-transparent focus:border-primary focus:bg-background outline-none rounded-2xl transition-all font-bold text-lg"
            />
          </div>
        </div>

        <DialogFooter className="sm:justify-stretch">
          <button
            onClick={() => onCreate(name)}
            disabled={loading || !name.trim()}
            className="w-full bg-primary text-primary-foreground font-black py-4 rounded-xl text-lg shadow-xl shadow-primary/30 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? "Creando..." : "Crear y Seleccionar"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
