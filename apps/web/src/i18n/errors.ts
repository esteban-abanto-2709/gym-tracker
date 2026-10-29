import { useEffect } from "react";
import { useTranslations } from "next-intl";

type ErrorsT = ReturnType<typeof useTranslations<"errors">>;
export type ErrorKey = Parameters<ErrorsT>[0];

let translate: ErrorsT | undefined;

export function errorText(key: ErrorKey) {
  return translate ? translate(key) : key;
}

export function useErrorText() {
  const t = useTranslations("errors");
  useEffect(() => {
    translate = t;
  }, [t]);
}
