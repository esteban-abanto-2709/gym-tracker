import Link from "next/link";
import { SearchX } from "lucide-react";
import { StatusScreen } from "@/components/layout/StatusScreen";
import { buttonVariants } from "@/components/base/button";
import { routes } from "@/lib/routes";

export default function NotFound() {
  return (
    <StatusScreen
      icon={SearchX}
      kicker="// 404"
      title="No existe"
      message="Esta página no está o se movió."
    >
      <Link href={routes.home()} className={buttonVariants()}>
        Ir a Hoy
      </Link>
    </StatusScreen>
  );
}
