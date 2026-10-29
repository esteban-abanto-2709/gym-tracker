import type { LucideIcon } from "lucide-react";
import type { Messages } from "next-intl";
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
  id: keyof Messages["news"]["items"];
  Icon: LucideIcon;
  href?: string;
}

export const NEWS: NewsItem[] = [
  {
    id: "explore-programs-2",
    Icon: Compass,
    href: "/explore",
  },
  {
    id: "programs",
    Icon: CalendarRange,
    href: "/programs",
  },
  {
    id: "streak",
    Icon: Flame,
  },
  {
    id: "tiktok",
    Icon: Video,
  },
  {
    id: "export-for-ai",
    Icon: Share,
    href: "/history?export=1",
  },
  {
    id: "body-measurements",
    Icon: Ruler,
    href: "/perfil#medidas",
  },
  {
    id: "exercise-language",
    Icon: Languages,
    href: "/perfil/ajustes",
  },
];
