import type { Locale } from "@/lib/types";

export const LOCALES: readonly Locale[] = ["es", "en"];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "locale";

export const isLocale = (value: unknown): value is Locale =>
  LOCALES.includes(value as Locale);

export function phoneLocale(acceptLanguage: string | null): Locale {
  const ranked = (acceptLanguage ?? "")
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.find((p) => p.trim().startsWith("q="));
      return {
        lang: tag.split("-")[0].toLowerCase(),
        q: q ? Number(q.trim().slice(2)) : 1,
      };
    })
    .filter(({ q }) => q > 0)
    .sort((a, b) => b.q - a.q);
  return (
    (ranked.find(({ lang }) => isLocale(lang))?.lang as Locale) ??
    DEFAULT_LOCALE
  );
}
