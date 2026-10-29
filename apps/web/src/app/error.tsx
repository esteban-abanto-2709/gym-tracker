"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { TriangleAlert } from "lucide-react";
import { StatusScreen } from "@/components/layout/StatusScreen";
import { Button } from "@/components/base/button";
import { routes } from "@/lib/routes";

export default function ErrorPage({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  const t = useTranslations();
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusScreen
      icon={TriangleAlert}
      kicker="// error"
      title={t("errors.page.title")}
      message={t("errors.page.message")}
    >
      <div className="space-y-4">
        <Button onClick={retry}>{t("errors.retry")}</Button>
        <Link
          href={routes.home()}
          className="block text-muted-foreground font-bold hover:text-foreground"
        >
          {t("common.goHome")}
        </Link>
      </div>
    </StatusScreen>
  );
}
