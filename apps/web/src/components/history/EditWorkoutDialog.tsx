import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useVisualViewport } from "@/hooks/useVisualViewport";
import { ApproximationToggle } from "@/components/ApproximationToggle";
import type { SetMeasure } from "@/lib/setDisplay";

interface EditWorkoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  measure: SetMeasure;
  weight: string;
  onWeightChange: (value: string) => void;
  reps: string;
  onRepsChange: (value: string) => void;
  durationSec: string;
  onDurationChange: (value: string) => void;
  opinion: string;
  onOpinionChange: (value: string) => void;
  isApproximation: boolean;
  onApproximationChange: (value: boolean) => void;
  loading: boolean;
  onSave: () => void;
}

export function EditWorkoutDialog({
  open,
  onOpenChange,
  measure,
  weight,
  onWeightChange,
  reps,
  onRepsChange,
  durationSec,
  onDurationChange,
  opinion,
  onOpinionChange,
  isApproximation,
  onApproximationChange,
  loading,
  onSave,
}: EditWorkoutDialogProps) {
  const viewport = useVisualViewport(open);

  const viewportStyle = viewport
    ? {
        top: `${viewport.offsetTop + viewport.height / 2}px`,
        maxHeight: `${viewport.height - 32}px`,
      }
    : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[425px] rounded-2xl overflow-y-auto"
        style={viewportStyle}
      >
        <DialogHeader>
          <DialogTitle className="font-display uppercase tracking-tight text-2xl">
            Editar Entrenamiento
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {measure === "time" ? (
            <div className="space-y-2">
              <label
                htmlFor="edit-duration"
                className="kicker text-muted-foreground text-[0.65rem]"
              >
                Segundos
              </label>
              <input
                id="edit-duration"
                type="number"
                value={durationSec}
                onChange={(e) => onDurationChange(e.target.value)}
                className="w-full px-4 py-3 bg-muted border-2 border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
          ) : (
            <div
              className={`grid gap-4 ${
                measure === "weight_reps" ? "grid-cols-2" : "grid-cols-1"
              }`}
            >
              {measure === "weight_reps" && (
                <div className="space-y-2">
                  <label
                    htmlFor="edit-weight"
                    className="kicker text-muted-foreground text-[0.65rem]"
                  >
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
              )}
              <div className="space-y-2">
                <label
                  htmlFor="edit-reps"
                  className="kicker text-muted-foreground text-[0.65rem]"
                >
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
          )}
          <div className="space-y-2">
            <label
              htmlFor="edit-opinion"
              className="kicker text-muted-foreground text-[0.65rem]"
            >
              Comentario
            </label>
            <textarea
              id="edit-opinion"
              rows={3}
              value={opinion}
              onChange={(e) => onOpinionChange(e.target.value)}
              className="w-full px-4 py-3 bg-muted border-2 border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
            />
          </div>
          {measure === "weight_reps" && (
            <ApproximationToggle
              checked={isApproximation}
              onChange={onApproximationChange}
            />
          )}
        </div>
        <DialogFooter>
          <button
            onClick={onSave}
            disabled={loading}
            className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-display uppercase tracking-wide text-xl shadow-lg hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? "Guardando..." : "Guardar Cambios"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
