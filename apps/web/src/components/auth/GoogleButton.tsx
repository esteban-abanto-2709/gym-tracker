"use client";

import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/lib/auth-context";

export function GoogleButton() {
  const { loginWithGoogle } = useAuth();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        o
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
              // El guard de AuthProvider redirige al home al haber sesión.
            } catch (err) {
              setError(
                err instanceof Error
                  ? err.message
                  : "No se pudo ingresar con Google",
              );
            }
          }}
          onError={() => setError("No se pudo ingresar con Google")}
        />
      </div>

      {error && <p className="text-sm text-destructive text-center">{error}</p>}
    </div>
  );
}
