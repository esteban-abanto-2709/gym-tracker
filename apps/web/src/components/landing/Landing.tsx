import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowUp, Flame, History, TrendingUp, Zap } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { routes } from "@/lib/routes";
import { buttonVariants } from "@/components/base/button";
import { cn } from "@/lib/utils";
import { heading } from "@/components/base/heading";
import { surfaceClass } from "@/components/base/surface";

const primaryCta = cn(
  buttonVariants(),
  "shadow-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
);

const secondaryCta =
  "flex items-center justify-center w-full font-display uppercase tracking-wide text-xl text-foreground rounded-2xl py-3.5 border-2 border-input hover:border-primary/50 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

const features = [
  { key: "lastTime", icon: History },
  { key: "goUp", icon: TrendingUp },
  { key: "noSetup", icon: Zap },
] as const;

const NOT_HERE = ["nutrition", "feed", "paywall"] as const;

function SetPreview() {
  const t = useTranslations();
  return (
    <figure
      aria-label={t("landing.preview.label")}
      className={cn(surfaceClass, "overflow-hidden shadow-2xl shadow-black/40")}
    >
      <div className="flex items-start justify-between gap-4 px-5 pt-4">
        <div>
          <p className="font-bold text-foreground text-lg leading-tight">
            {t("landing.preview.exercise")}
          </p>
          <p className="text-sm text-muted-foreground">
            {t("equipment.names.barra")} · 3 × 8-10
          </p>
        </div>
        <span className="flex items-center gap-1 rounded-lg bg-primary/15 px-2 py-1 text-primary font-bold text-sm">
          <Flame className="w-4 h-4 fill-current" aria-hidden />3
        </span>
      </div>

      <div className="px-5 pt-3 pb-4">
        <p className="text-sm text-muted-foreground">
          {t("train.set.last", { value: "60 kg × 10" })}
        </p>
        <div className="mt-2 flex items-end gap-3">
          <p className="font-display font-bold text-foreground text-7xl leading-[0.8] tracking-tight">
            60
          </p>
          <p className="font-display uppercase text-muted-foreground text-2xl leading-none pb-1">
            kg
          </p>
          <div
            className="ml-auto flex gap-1.5 pb-1"
            aria-label={t("landing.preview.sets")}
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="grid place-items-center w-10 h-10 rounded-lg border-2 border-primary/60 font-mono font-bold text-foreground"
              >
                10
              </span>
            ))}
          </div>
        </div>
      </div>

      <figcaption className="motion-safe:animate-pop flex items-center gap-2 border-t-2 border-primary/30 bg-primary/10 px-5 py-3 font-bold text-primary">
        <ArrowUp className="w-5 h-5 shrink-0" strokeWidth={2.75} aria-hidden />
        {t("train.progress.upStreak")}
      </figcaption>
      <div className="h-1.5 hazard-bar" />
    </figure>
  );
}

export function Landing() {
  const t = useTranslations("landing");
  const tCommon = useTranslations("common");
  return (
    <PageShell>
      <main className="flex-1 px-6 pt-[calc(2rem+env(safe-area-inset-top))] pb-[calc(2.5rem+env(safe-area-inset-bottom))] relative z-10">
        <div className="max-w-md md:max-w-5xl mx-auto">
          <div className="h-2 rounded-sm hazard-bar mb-5 md:max-w-xs" />

          <section className="md:grid md:grid-cols-[1.1fr_1fr] md:gap-14 md:items-center">
            <div>
              <p className="kicker text-primary text-2xs">{t("kicker")}</p>
              <h1
                className={heading({
                  className:
                    "text-foreground text-[3.4rem] md:text-7xl leading-[0.86] tracking-tight mt-3",
                })}
              >
                {t("titleLine1")}
                <br />
                {t("titleLine2")}
                <br />
                {t("titleLine3")}
              </h1>
              <p className="text-base text-muted-foreground leading-relaxed mt-4 max-w-[34ch]">
                {t("subtitle")}
              </p>
            </div>

            <div className="mt-6 md:mt-0">
              <SetPreview />
            </div>
          </section>

          <div className="mt-6 grid gap-3 md:max-w-sm">
            <Link href={routes.register()} className={primaryCta}>
              {t("signUp")}
            </Link>
            <Link href={routes.login()} className={secondaryCta}>
              {t("haveAccount")}
            </Link>
          </div>

          <section className="mt-16 md:grid md:grid-cols-3 md:gap-8">
            {features.map(({ key, icon: Icon }) => (
              <div
                key={key}
                className="flex gap-4 border-t-2 border-input py-5 md:flex-col md:gap-3"
              >
                <Icon
                  className="w-6 h-6 shrink-0 text-primary mt-0.5"
                  strokeWidth={2.5}
                  aria-hidden
                />
                <div>
                  <h2 className="font-display uppercase text-foreground text-xl leading-tight tracking-wide">
                    {t(`features.${key}.title`)}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-1.5">
                    {t(`features.${key}.text`)}
                  </p>
                </div>
              </div>
            ))}
          </section>

          <section className="mt-12 md:grid md:grid-cols-2 md:gap-14">
            <p className="font-display uppercase text-[2rem] leading-[1.1] tracking-tight text-muted-foreground">
              {NOT_HERE.map((item) => (
                <span key={item} className="block">
                  <s className="decoration-primary decoration-[3px]">
                    {t(`notHere.${item}`)}
                  </s>
                </span>
              ))}
              <span className="block text-foreground mt-1">
                {t("onlyTraining")}
              </span>
            </p>

            <div className="mt-10 md:mt-0">
              <h2 className="font-display uppercase text-foreground text-xl tracking-wide">
                {t("yourData")}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mt-1.5 max-w-[46ch]">
                {t("yourDataText")}
              </p>
              <Link
                href={routes.privacy()}
                className="inline-block mt-3 text-sm font-semibold text-foreground underline underline-offset-4"
              >
                {t("privacyLink")}
              </Link>
            </div>
          </section>

          <footer className="mt-16 border-t-2 border-input pt-8 grid gap-4 md:max-w-sm">
            <Link href={routes.register()} className={primaryCta}>
              {t("signUp")}
            </Link>
            <p className="text-sm text-center text-muted-foreground">
              {t("hasAccount")}{" "}
              <Link
                href={routes.login()}
                className="text-foreground font-semibold underline underline-offset-4"
              >
                {t("login")}
              </Link>
              {" · "}
              <Link
                href={routes.privacy()}
                className="underline underline-offset-4"
              >
                {tCommon("privacy")}
              </Link>
            </p>
          </footer>
        </div>
      </main>
    </PageShell>
  );
}
