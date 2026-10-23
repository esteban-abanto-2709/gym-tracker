import { toast } from "sonner";

export function notifyError(message: string, retry?: () => void) {
  toast.error(message, {
    duration: 6000,
    action: retry ? { label: "Reintentar", onClick: retry } : undefined,
  });
}
