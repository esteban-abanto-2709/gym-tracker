"use client";

import { useEffect } from "react";
import Link from "next/link";
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
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusScreen
      icon={TriangleAlert}
      kicker="// error"
      title="Algo falló"
      message="Algo se rompió en esta pantalla. Vuelve a intentarlo."
    >
      <div className="space-y-4">
        <Button onClick={retry}>Reintentar</Button>
        <Link
          href={routes.home()}
          className="block text-muted-foreground font-bold hover:text-foreground"
        >
          Ir a Hoy
        </Link>
      </div>
    </StatusScreen>
  );
}
