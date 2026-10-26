import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Privacidad",
  description:
    "Qué datos guarda Gym Tracker, para qué los usa, quién los ve y cómo borrar tu cuenta.",
};

const CONTACT_EMAIL = "esteban.abanto.2709@gmail.com";

const sections: { title: string; items: React.ReactNode[] }[] = [
  {
    title: "Qué guardamos",
    items: [
      "Tu cuenta: correo, nombre de usuario y tu contraseña cifrada (nunca se guarda tal cual). Si entras con Google, recibimos de Google tu nombre, tu correo y un identificador de tu cuenta.",
      "Tu entrenamiento: series, rutinas, programas y los ejercicios que crees.",
      "Si tú los agregas: fecha de nacimiento y medidas (altura, peso y % de grasa). Son datos de salud, por eso son opcionales.",
      "En tu teléfono: una cookie para mantener tu sesión y, en el almacenamiento del navegador, la sesión guiada en curso, el último equipo que usaste y las series que aún no se enviaron. No usamos cookies de publicidad ni de analítica.",
    ],
  },
  {
    title: "Para qué",
    items: [
      "Solo para que la app funcione: mostrarte tu historial, calcular tu racha y preparar el archivo para tu IA cuando tú lo pides. No vendemos tus datos ni los usamos para publicidad.",
    ],
  },
  {
    title: "Quién los ve",
    items: [
      "Solo tú. La excepción es lo que tú decides publicar: esa rutina o ese programa aparece en Explorar con tu nombre de usuario, tal como estaba al publicarlo, y otros usuarios pueden verlo, darle me gusta y copiarlo. Lo que no publicas no lo ve nadie.",
      "Cuando exportas tus datos para una IA, ese archivo lo compartes tú con quien elijas.",
      "Para funcionar, la app usa un servidor donde vive la base de datos, Cloudflare (por donde pasa el tráfico de la página) y Google (solo si entras con Google).",
    ],
  },
  {
    title: "Cuánto tiempo",
    items: [
      "Mientras tengas tu cuenta. Además se hace una copia de seguridad diaria y cifrada de la base, y cada copia se borra sola a los 90 días.",
    ],
  },
  {
    title: "Borrar tu cuenta",
    items: [
      "Desde Perfil → Ajustes → Borrar mi cuenta. Se borra al instante con todo lo tuyo; de las copias de seguridad desaparece en 90 días como máximo.",
      "Los ejercicios que creaste se borran también, salvo los que otra persona usa: esos quedan en el catálogo sin tu nombre.",
      "Tus publicaciones se borran con tu cuenta. Las copias que otras personas ya hicieron son suyas y se quedan.",
    ],
  },
  {
    title: "Contacto",
    items: [
      <>
        Para pedir una copia de tus datos, corregirlos o borrarlos, escribe a{" "}
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="text-foreground font-semibold underline underline-offset-4 break-all"
        >
          {CONTACT_EMAIL}
        </a>
        .
      </>,
    ],
  },
];

export default function PrivacidadPage() {
  return (
    <PageShell>
      <main className="flex-1 px-6 pt-[calc(2.5rem+env(safe-area-inset-top))] pb-[calc(2.5rem+env(safe-area-inset-bottom))] relative z-10">
        <div className="max-w-md mx-auto">
          <Link
            href={routes.home()}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
            Volver
          </Link>

          <p className="kicker text-primary text-[0.7rem] mt-6">
            {"// tus datos"}
          </p>
          <h1 className="font-display font-bold uppercase text-foreground text-5xl leading-[0.9] tracking-tight mt-2">
            Privacidad
          </h1>
          <p className="text-sm text-muted-foreground mt-3">
            Actualizado el 18 de octubre de 2026.
          </p>

          <div className="mt-8 space-y-7">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="kicker text-primary text-[0.7rem]">
                  {section.title}
                </h2>
                <div className="mt-2 space-y-2 text-sm text-muted-foreground leading-relaxed">
                  {section.items.map((item, i) => (
                    <p key={i}>{item}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>
    </PageShell>
  );
}
