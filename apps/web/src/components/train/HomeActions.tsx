"use client";

import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Compass, Play, Plus, Zap } from "lucide-react";
import { routes } from "@/lib/routes";
import { activeProgramQuery, routinesQuery } from "@/lib/queries";
import { readActiveSession, startSession } from "@/lib/activeSession";
import { heading } from "@/components/base/heading";
import { cn } from "@/lib/utils";
import { surfaceClass } from "@/components/base/surface";

const cardClass = cn(
  surfaceClass,
  "relative block w-full text-left overflow-hidden rounded-3xl text-card-foreground p-6 shadow-lg active:scale-[0.98] transition-all",
);

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
      className={cn(
        surfaceClass,
        "flex flex-col gap-2 min-h-[92px] p-4 hover:border-border active:scale-[0.98] transition-all",
        className,
      )}
    >
      {icon}
      <span className="font-bold text-foreground leading-tight">{title}</span>
      <span className="text-xs text-muted-foreground">{subtitle}</span>
    </Link>
  );
}

export function HomeActions() {
  const t = useTranslations("home");
  const router = useRouter();
  const { data: active } = useQuery(activeProgramQuery);
  const { data: routines } = useQuery(routinesQuery);

  const isNewUser = routines?.length === 0;
  const program = active?.program;
  const routine = program?.routines.find((r) => r.id === active?.nextRoutineId);
  const today =
    program && routine && routine.items.length > 0 && !readActiveSession()
      ? { routine, programName: program.name }
      : null;

  const handleStart = () => {
    if (!today) return;
    startSession(today.routine);
    router.push(routes.train());
  };

  if (isNewUser) {
    return (
      <>
        <Link href={routes.explore("programs")} className={cardClass}>
          <div className="absolute top-0 right-0 bottom-0 w-16 hazard-bar opacity-90" />
          <p className="kicker text-3xs text-muted-foreground relative">
            {t("startHere")}
          </p>
          <p
            className={heading({
              className: "text-5xl leading-[0.85] mt-3 relative pr-16",
            })}
          >
            {t("exploreTop")}
            <br />
            {t("exploreBottom")}
          </p>
          <p className="text-sm mt-3 text-muted-foreground relative">
            {t("exploreHint")}{" "}
            <Compass className="inline w-3.5 h-3.5 align-[-2px]" />
          </p>
        </Link>

        <div className="grid grid-cols-2 gap-3">
          <Tile
            href={routes.routineNew()}
            icon={<Plus className="w-6 h-6 text-primary" strokeWidth={2.5} />}
            title={t("buildMine")}
            subtitle={t("buildMineHint")}
          />
          <Tile
            href={routes.log()}
            icon={
              <Zap
                className="w-6 h-6 text-muted-foreground"
                strokeWidth={2.5}
              />
            }
            title={t("freeDay")}
            subtitle={t("freeDayHint")}
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
          <p className="kicker text-3xs text-muted-foreground relative pr-16 truncate">
            {t("todayIs", { program: today.programName })}
          </p>
          <p
            className={heading({
              className:
                "text-5xl leading-[0.85] mt-3 relative pr-16 break-words",
            })}
          >
            {today.routine.name}
          </p>
          <p className="text-sm mt-3 text-muted-foreground relative">
            {t("tapToStart")}{" "}
            <Play className="inline w-3.5 h-3.5 fill-current align-[-2px]" />
          </p>
        </button>
      ) : (
        <Link href={routes.routines()} className={cardClass}>
          <div className="absolute top-0 right-0 bottom-0 w-16 hazard-bar opacity-90" />
          <p className="kicker text-3xs text-muted-foreground relative">
            {t("startStrong")}
          </p>
          <p
            className={heading({
              className: "text-5xl leading-[0.85] mt-3 relative",
            })}
          >
            {t("startTop")}
            <br />
            {t("startBottom")}
          </p>
          <p className="text-sm mt-3 text-muted-foreground relative">
            {t("startHint")}{" "}
            <Play className="inline w-3.5 h-3.5 fill-current align-[-2px]" />
          </p>
        </Link>
      )}

      <Tile
        href={routes.log()}
        icon={<Zap className="w-6 h-6 text-primary" strokeWidth={2.5} />}
        title={t("freeDay")}
        subtitle={t("freeDayHint")}
      />
    </>
  );
}
