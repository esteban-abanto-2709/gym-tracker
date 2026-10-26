import { cache } from "react";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { routes } from "@/lib/routes";
import type { ExploreDetail, PublicationKind } from "@/lib/types";

const API_URL = process.env.API_INTERNAL_URL ?? "http://localhost:4000";

async function serverGet<T>(endpoint: string): Promise<T | null> {
  const incoming = await headers();
  const res = await fetch(`${API_URL}${endpoint}`, {
    cache: "no-store",
    headers: {
      cookie: incoming.get("cookie") ?? "",
      "accept-language": incoming.get("accept-language") ?? "",
    },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`API ${res.status} on ${endpoint}`);
  return res.json();
}

export async function siteOrigin() {
  const incoming = await headers();
  const host = incoming.get("x-forwarded-host") ?? incoming.get("host");
  const proto = incoming.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

export const getPublication = cache((kind: PublicationKind, slug: string) =>
  serverGet<ExploreDetail>(
    routes.api.explore.get(kind, encodeURIComponent(slug)),
  ),
);

export function exerciseCount(publication: ExploreDetail) {
  return publication.routines.reduce((n, r) => n + r.items.length, 0);
}

export async function publicationMetadata(
  kind: PublicationKind,
  slug: string,
): Promise<Metadata> {
  const publication = await getPublication(kind, slug);
  if (!publication) return { title: "No disponible" };

  const what = kind === "PROGRAM" ? "Programa" : "Rutina";
  const description =
    publication.description ||
    `${what} de ${publication.author.username} · ${exerciseCount(publication)} ejercicios. ${kind === "PROGRAM" ? "Cópialo" : "Cópiala"} en Gym Tracker.`;
  const origin = await siteOrigin();
  return {
    title: publication.name,
    description,
    openGraph: {
      type: "website",
      siteName: "Gym Tracker",
      title: `${publication.name} · ${what}`,
      description,
      url: `${origin}${routes.explorePublication(kind, slug)}`,
      images: [
        {
          url: `${origin}${routes.publicationImage(kind, slug)}`,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: { card: "summary_large_image" },
  };
}
