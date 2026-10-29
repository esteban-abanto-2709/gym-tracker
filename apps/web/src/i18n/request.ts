import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { isLocale, LOCALE_COOKIE, phoneLocale } from "./locale";

export default getRequestConfig(async () => {
  const saved = (await cookies()).get(LOCALE_COOKIE)?.value;
  const locale = isLocale(saved)
    ? saved
    : phoneLocale((await headers()).get("accept-language"));
  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
