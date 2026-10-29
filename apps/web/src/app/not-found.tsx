import Link from "next/link";
import { useTranslations } from "next-intl";
import { SearchX } from "lucide-react";
import { StatusScreen } from "@/components/layout/StatusScreen";
import { buttonVariants } from "@/components/base/button";
import { routes } from "@/lib/routes";

export default function NotFound() {
  const t = useTranslations();
  return (
    <StatusScreen
      icon={SearchX}
      kicker="// 404"
      title={t("errors.notFound.title")}
      message={t("errors.notFound.message")}
    >
      <Link href={routes.home()} className={buttonVariants()}>
        {t("common.goHome")}
      </Link>
    </StatusScreen>
  );
}
