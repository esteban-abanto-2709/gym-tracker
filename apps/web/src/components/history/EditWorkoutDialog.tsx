import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface EditWorkoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  weight: string;
  onWeightChange: (value: string) => void;
  reps: string;
  onRepsChange: (value: string) => void;
  loading: boolean;
  onSave: () => void;
}

export function EditWorkoutDialog({
  open,
  onOpenChange,
  weight,
  onWeightChange,
  reps,
  onRepsChange,
  loading,
  onSave,
}: EditWorkoutDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                value={weight}
                onChange={(e) => onWeightChange(e.target.value)}
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
                value={reps}
                onChange={(e) => onRepsChange(e.target.value)}
                className="w-full px-4 py-3 bg-muted border-2 border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <button
            onClick={onSave}
            disabled={loading}
            className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? "Guardando..." : "Guardar Cambios"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
