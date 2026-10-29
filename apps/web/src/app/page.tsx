import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/layout/PageShell";
import { BottomNav } from "@/components/layout/BottomNav";
import { ContinueRoutineBanner } from "@/components/train/ContinueRoutineBanner";
import { HomeActions } from "@/components/train/HomeActions";
import { NewsButton } from "@/components/news/NewsButton";
import { LandingGate } from "@/components/landing/LandingGate";
import { Landing } from "@/components/landing/Landing";
import { heading } from "@/components/base/heading";

export default async function Home() {
  if (!(await cookies()).has("token")) return <Landing />;
  const t = await getTranslations("home");

  return (
    <LandingGate>
      <PageShell>
        <main className="flex-1 px-6 pt-[calc(3.5rem+env(safe-area-inset-top))] pb-nav relative z-10 animate-fade-in-up">
          <div className="max-w-md w-full mx-auto space-y-5">
            {/* Hero */}
            <div>
              <div className="flex items-center justify-between">
                <p className="kicker text-primary text-2xs">{t("kicker")}</p>
                <NewsButton />
              </div>
              <h1
                className={heading({
                  className:
                    "text-foreground text-[2.75rem] leading-[0.9] tracking-tight mt-2",
                })}
              >
                {t("titleTop")}
                <br />
                <span className="text-primary">{t("titleAccent")}</span>
              </h1>
            </div>

            <ContinueRoutineBanner />

            <HomeActions />
          </div>
        </main>

        <BottomNav />
      </PageShell>
    </LandingGate>
  );
}
