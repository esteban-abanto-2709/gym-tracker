"use client";

import { useState, useEffect, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Compass, Play, Plus, Zap } from "lucide-react";
import { api } from "@/lib/api";
import { routes } from "@/lib/routes";
import type { ActiveProgram, Routine } from "@/lib/types";
import { readActiveSession, startSession } from "@/lib/activeSession";

const cardClass =
  "relative block w-full text-left overflow-hidden rounded-3xl bg-foreground text-background p-6 shadow-lg active:scale-[0.98] transition-all";

function Tile({
  href,
  icon,
  title,
  subtitle,
  className = "",
}: {
  href: string;
  icon: ReactNode;
  title: string;
  subtitle: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col gap-2 min-h-[92px] p-4 bg-card border-2 border-input rounded-2xl hover:border-border active:scale-[0.98] transition-all ${className}`}
    >
      {icon}
      <span className="font-bold text-foreground leading-tight">{title}</span>
      <span className="text-xs text-muted-foreground">{subtitle}</span>
    </Link>
  );
}

export function HomeActions() {
  const router = useRouter();
  const [today, setToday] = useState<{
    routine: Routine;
    programName: string;
  } | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    const fetchToday = async () => {
      try {
        const [{ program, nextRoutineId }, routines] = await Promise.all([
          api.get<ActiveProgram>(routes.api.programs.active()),
          api.get<Routine[]>(routes.api.routines.list()),
        ]);
        if (routines.length === 0) {
          setIsNewUser(true);
          return;
        }
        const routine = program?.routines.find((r) => r.id === nextRoutineId);
        if (
          program &&
          routine &&
          routine.items.length > 0 &&
          !readActiveSession()
        ) {
          setToday({ routine, programName: program.name });
        }
      } catch (e) {
        console.error("Error fetching today's routine:", e);
      }
    };
    fetchToday();
  }, []);

  const handleStart = () => {
    if (!today) return;
    startSession(today.routine);
    router.push(routes.train());
  };

  if (isNewUser) {
    return (
      <>
        <Link href={routes.explore()} className={cardClass}>
          <div className="absolute top-0 right-0 bottom-0 w-16 hazard-bar opacity-90" />
          <p className="kicker text-[0.65rem] opacity-55 relative">
            Empieza aquí
          </p>
          <p className="font-display font-bold uppercase text-5xl leading-[0.85] mt-3 relative pr-16">
            Explorar
            <br />
            programas
          </p>
          <p className="text-sm mt-3 opacity-60 relative">
            Copia uno y entrena hoy ·{" "}
            <Compass className="inline w-3.5 h-3.5 align-[-2px]" />
          </p>
        </Link>

        <div className="grid grid-cols-2 gap-3">
          <Tile
            href={routes.routineNew()}
            icon={<Plus className="w-6 h-6 text-primary" strokeWidth={2.5} />}
            title="Armar el mío"
            subtitle="Crea tu primera rutina"
          />
          <Tile
            href={routes.log()}
            icon={
              <Zap
                className="w-6 h-6 text-muted-foreground"
                strokeWidth={2.5}
              />
            }
            title="Día libre"
            subtitle="Un set suelto"
          />
        </div>
      </>
    );
  }

  return (
    <>
      {today ? (
        <button type="button" onClick={handleStart} className={cardClass}>
          <div className="absolute top-0 right-0 bottom-0 w-16 hazard-bar opacity-90" />
          <p className="kicker text-[0.65rem] opacity-55 relative pr-16 truncate">
            Hoy toca · {today.programName}
          </p>
          <p className="font-display font-bold uppercase text-5xl leading-[0.85] mt-3 relative pr-16 break-words">
            {today.routine.name}
          </p>
          <p className="text-sm mt-3 opacity-60 relative">
            Toca para empezar ·{" "}
            <Play className="inline w-3.5 h-3.5 fill-current align-[-2px]" />
          </p>
        </button>
      ) : (
        <Link href={routes.routines()} className={cardClass}>
          <div className="absolute top-0 right-0 bottom-0 w-16 hazard-bar opacity-90" />
          <p className="kicker text-[0.65rem] opacity-55 relative">
            Empieza fuerte
          </p>
          <p className="font-display font-bold uppercase text-5xl leading-[0.85] mt-3 relative">
            Iniciar
            <br />
            rutina
          </p>
          <p className="text-sm mt-3 opacity-60 relative">
            Elige tu rutina y ve paso a paso ·{" "}
            <Play className="inline w-3.5 h-3.5 fill-current align-[-2px]" />
          </p>
        </Link>
      )}

      <Tile
        href={routes.log()}
        icon={<Zap className="w-6 h-6 text-primary" strokeWidth={2.5} />}
        title="Día libre"
        subtitle="Un set suelto"
      />
    </>
  );
}
