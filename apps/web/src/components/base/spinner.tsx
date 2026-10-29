import * as React from "react";
import { useTranslations } from "next-intl";

import { Spinner as UiSpinner } from "@/components/ui/spinner";

export function Spinner(props: React.ComponentProps<typeof UiSpinner>) {
  const t = useTranslations("common");
  return <UiSpinner aria-label={t("loading")} {...props} />;
}

export function LoadingOverlay({ label }: { label: string }) {
  return (
    <div className="absolute inset-0 bg-background/80 backdrop-blur-md z-50 flex flex-col items-center justify-center">
      <Spinner className="size-16 text-primary mb-4" />
      <p className="text-lg font-bold text-foreground animate-pulse">{label}</p>
    </div>
  );
}
