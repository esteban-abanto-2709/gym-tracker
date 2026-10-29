import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";
import { exerciseCount, getPublication } from "@/lib/server-api";
import type { PublicationKind } from "@/lib/types";

const KINDS: Record<string, PublicationKind> = {
  routines: "ROUTINE",
  programs: "PROGRAM",
};

const RED = "#ff3b2f";

const oswald = readFile(join(process.cwd(), "src/app/fonts/oswald-700.ttf"));

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ kind: string; slug: string }> },
) {
  const { kind: segment, slug } = await params;
  const kind = KINDS[segment];
  const publication = kind ? await getPublication(kind, slug) : null;
  if (!kind || !publication) return new Response("Not found", { status: 404 });

  const t = await getTranslations("explore");
  const isProgram = kind === "PROGRAM";
  const name = publication.name;
  const stats = [
    isProgram ? t("routines", { count: publication.routines.length }) : null,
    t("exercises", { count: exerciseCount(publication) }),
    publication.likeCount > 0
      ? t("likes", { count: publication.likeCount })
      : null,
  ].filter(Boolean);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#09090b",
        color: "#fafafa",
        padding: "64px 72px",
        fontFamily: "Oswald",
      }}
    >
      <div
        style={{
          display: "flex",
          height: 14,
          width: 280,
          background: `repeating-linear-gradient(45deg, ${RED} 0 18px, #09090b 18px 36px)`,
        }}
      />
      <div
        style={{
          display: "flex",
          marginTop: 48,
          fontSize: 30,
          letterSpacing: 4,
          color: RED,
          textTransform: "uppercase",
        }}
      >
        {`${t(isProgram ? "program" : "routine")} · ${t("by")} ${publication.author.username}`}
      </div>
      <div
        style={{
          display: "flex",
          flex: 1,
          alignItems: "center",
          fontSize: name.length > 28 ? 76 : 104,
          fontWeight: 700,
          lineHeight: 1.1,
          textTransform: "uppercase",
        }}
      >
        {name}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          fontSize: 30,
          color: "#a1a1aa",
        }}
      >
        <div style={{ display: "flex" }}>{stats.join("  ·  ")}</div>
        <div style={{ display: "flex", color: "#fafafa", fontWeight: 700 }}>
          Gym Tracker
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [{ name: "Oswald", data: await oswald, weight: 700 }],
    },
  );
}
