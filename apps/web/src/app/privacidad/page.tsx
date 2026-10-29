import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { routes } from "@/lib/routes";
import { heading } from "@/components/base/heading";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("privacy");
  return { title: t("title"), description: t("description") };
}

const CONTACT_EMAIL = "esteban.abanto.2709@gmail.com";

const sectionTitle = "kicker text-primary text-2xs";
const sectionBody =
  "mt-2 space-y-2 text-sm text-muted-foreground leading-relaxed";

export default async function PrivacidadPage() {
  const t = await getTranslations("privacy");
  const tCommon = await getTranslations("common");
  const sections: { title: string; items: string[] }[] = t.raw("sections");

  return (
    <PageShell>
      <main className="flex-1 px-6 pt-[calc(2.5rem+env(safe-area-inset-top))] pb-[calc(2.5rem+env(safe-area-inset-bottom))] relative z-10">
        <div className="max-w-md mx-auto">
          <Link
            href={routes.home()}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
            {tCommon("back")}
          </Link>

          <p className="kicker text-primary text-2xs mt-6">{t("kicker")}</p>
          <h1
            className={heading({
              size: "lg",
              className: "text-foreground leading-[0.9] mt-2",
            })}
          >
            {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-3">{t("updated")}</p>

          <div className="mt-8 space-y-7">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className={sectionTitle}>{section.title}</h2>
                <div className={sectionBody}>
                  {section.items.map((item) => (
                    <p key={item}>{item}</p>
                  ))}
                </div>
              </section>
            ))}
            <section>
              <h2 className={sectionTitle}>{t("contactTitle")}</h2>
              <div className={sectionBody}>
                <p>
                  {t.rich("contact", {
                    address: CONTACT_EMAIL,
                    email: (chunks) => (
                      <a
                        href={`mailto:${CONTACT_EMAIL}`}
                        className="text-foreground font-semibold underline underline-offset-4 break-all"
                      >
                        {chunks}
                      </a>
                    ),
                  })}
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </PageShell>
  );
}
