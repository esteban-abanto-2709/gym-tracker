import { toast } from "sonner";
import { errorText } from "@/i18n/errors";

export function notifyError(message: string, retry?: () => void) {
  toast.error(message, {
    duration: 6000,
    action: retry ? { label: errorText("retry"), onClick: retry } : undefined,
  });
}
