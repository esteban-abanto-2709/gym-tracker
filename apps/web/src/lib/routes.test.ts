import { readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { isPrivatePath, isPublicPath } from "@/lib/routes";

const OPEN_PAGES = [
  "/",
  "/privacidad",
  "/explore",
  "/explore/programs/x",
  "/explore/routines/x",
];

const appDir = resolve(import.meta.dirname, "../app");

const pages = readdirSync(appDir, { recursive: true, encoding: "utf8" })
  .map((file) => file.replaceAll("\\", "/"))
  .filter((file) => file === "page.tsx" || file.endsWith("/page.tsx"))
  .map(
    (file) =>
      `/${file.replace(/\/?page\.tsx$/, "").replace(/\[[^\]]+\]/g, "x")}`,
  );

describe("page access", () => {
  it("finds the app pages", () => {
    expect(pages).toContain("/history");
    expect(pages).toContain("/routines/x/publish");
  });

  it.each(pages)("%s is private, public or deliberately open", (page) => {
    const kinds = [
      isPrivatePath(page),
      isPublicPath(page),
      OPEN_PAGES.includes(page),
    ];
    expect(kinds.filter(Boolean)).toHaveLength(1);
  });
});
