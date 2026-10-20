import type { LucideIcon } from "lucide-react";
import {
  CalendarRange,
  Compass,
  Flame,
  Languages,
  Ruler,
  Share,
  Video,
} from "lucide-react";

export interface NewsItem {
  id: string;
  Icon: LucideIcon;
  title: string;
  body: string;
  href?: string;
}

export const NEWS: NewsItem[] = [
  {
    id: "explore-programs-2",
    Icon: Compass,
    title: "Publica y copia rutinas y programas",
    body: "Lo tuyo ahora es privado: publica lo que quieras con el globo del editor. En Explorar copia un programa entero o una sola rutina, dale me gusta y comparte el link.",
    href: "/explore",
  },
  {
    id: "programs",
    Icon: CalendarRange,
    title: "Arma tu programa y la app te dice qué toca hoy",
    body: "Agrupa tus rutinas en el orden en que las haces. Al abrir la app, Hoy te muestra la que sigue y empiezas de un toque.",
    href: "/programs",
  },
  {
    id: "streak",
    Icon: Flame,
    title: "Tu racha por ejercicio",
    body: "Ponle un rango a tus series (por ejemplo 8–10). El fuego cuenta las sesiones seguidas en que llegaste al tope en todas; tócalo para ver el historial del ejercicio y si toca subir.",
  },
  {
    id: "tiktok",
    Icon: Video,
    title: "¿No sabes cómo se hace un ejercicio?",
    body: "Mientras entrenas, toca el botón de TikTok y ves videos de ese ejercicio sin buscarlo a mano.",
  },
  {
    id: "export-for-ai",
    Icon: Share,
    title: "Exporta tu historial para tu IA",
    body: "Elige un rango de fechas y comparte un archivo con tus series, rutinas y medidas. Pásaselo a tu IA y pídele que revise tu progreso.",
    href: "/history?export=1",
  },
  {
    id: "body-measurements",
    Icon: Ruler,
    title: "Registra tus medidas",
    body: "Anota altura, peso y % de grasa con su fecha para ver cómo cambias. Van en el archivo que exportas, así tu IA te asesora mejor.",
    href: "/perfil#medidas",
  },
  {
    id: "exercise-language",
    Icon: Languages,
    title: "Ejercicios en inglés o español",
    body: "Elige cómo se ven los nombres en tus rutinas y tu historial con el botón de idioma del Perfil. Para buscar sirve cualquiera.",
    href: "/perfil",
  },
];
