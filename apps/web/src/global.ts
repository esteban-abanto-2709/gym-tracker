import type messages from "@/i18n/messages/es.json";
import type { Locale } from "@/lib/types";

declare module "next-intl" {
  interface AppConfig {
    Locale: Locale;
    Messages: typeof messages;
  }
}
