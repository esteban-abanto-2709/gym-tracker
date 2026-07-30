"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { routes } from "@/lib/routes";
import { Home, History, User } from "lucide-react";

const tabs = [
  { href: routes.home(), label: "Hoy", Icon: Home },
  { href: routes.history(), label: "Historial", Icon: History },
  { href: routes.profile(), label: "Perfil", Icon: User },
];

// Barra de pestañas top-level. Solo se monta en pantallas raíz (Hoy /
// Historial / Perfil); las pantallas profundas conservan su header con "atrás".
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed left-0 right-0 bottom-0 z-40 h-20 bg-background/80 backdrop-blur-md border-t border-border">
      <div className="max-w-md mx-auto h-full flex items-center px-8 pb-3">
        {tabs.map(({ href, label, Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center gap-1 transition-colors ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
              <span className="text-[10px] font-semibold tracking-wide">
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
