"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Play } from "lucide-react";
import { api } from "@/lib/api";
import { routes } from "@/lib/routes";
import type { ActiveProgram, Routine } from "@/lib/types";
import { readActiveSession, startSession } from "@/lib/activeSession";

const cardClass =
  "relative block w-full text-left overflow-hidden rounded-3xl bg-foreground text-background p-6 shadow-lg active:scale-[0.98] transition-all";

export function StartRoutineCard() {
  const router = useRouter();
  const [today, setToday] = useState<{
    routine: Routine;
    programName: string;
  } | null>(null);

  useEffect(() => {
    const fetchToday = async () => {
      try {
        const { program, nextRoutineId } = await api.get<ActiveProgram>(
          routes.api.programs.active(),
        );
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

  if (!today) {
    return (
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
    );
  }

  const handleStart = () => {
    startSession(today.routine);
    router.push(routes.train());
  };

  return (
    <div className="space-y-2">
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
      <Link
        href={routes.routines()}
        className="block text-center text-sm font-bold text-muted-foreground hover:text-foreground transition-colors py-1"
      >
        Elegir otra rutina
      </Link>
    </div>
  );
}
