import { toast } from "sonner";

// Error visible al usuario cuando falla una escritura de red (POST/PATCH/DELETE),
// con acción opcional de reintento. Centraliza el copy "Reintentar".
export function notifyError(message: string, retry?: () => void) {
  toast.error(message, {
    duration: 6000,
    action: retry ? { label: "Reintentar", onClick: retry } : undefined,
  });
}
