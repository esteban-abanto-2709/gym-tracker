"use client";

import { LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function AccountMenu() {
  const { user, logout } = useAuth();

  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className="text-sm font-medium truncate max-w-[7rem]">
        {user?.username}
      </span>
      <button
        type="button"
        onClick={() => logout()}
        title="Cerrar sesión"
        aria-label="Cerrar sesión"
        className="text-muted-foreground hover:text-foreground transition-all hover:scale-110 active:scale-90"
      >
        <LogOut className="w-5 h-5" />
      </button>
    </div>
  );
}
