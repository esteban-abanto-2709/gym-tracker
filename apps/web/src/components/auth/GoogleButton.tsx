"use client";

import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth-context";

export function GoogleButton() {
  const t = useTranslations("auth");
  const { loginWithGoogle } = useAuth();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        {t("or")}
        <span className="h-px flex-1 bg-border" />
      </div>

      <div className="flex justify-center">
        <GoogleLogin
          text="continue_with"
          shape="rectangular"
          onSuccess={async (res) => {
            setError(null);
            try {
              if (res.credential) await loginWithGoogle(res.credential);
            } catch (err) {
              setError(
                err instanceof Error ? err.message : t("errors.googleFailed"),
              );
            }
          }}
          onError={() => setError(t("errors.googleFailed"))}
        />
      </div>

      {error && <p className="text-sm text-destructive text-center">{error}</p>}
    </div>
  );
}
