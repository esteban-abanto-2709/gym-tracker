import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";

const TAGS = [
  "wcag2a",
  "wcag2aa",
  "wcag21a",
  "wcag21aa",
  "wcag22aa",
  "best-practice",
];

export async function expectAccessible(page: Page) {
  await page.waitForLoadState("networkidle");
  await expect(page).toHaveTitle(/Gym Tracker/);
  await page.locator("main").waitFor({ state: "attached" });
  await page.evaluate(() =>
    Promise.allSettled(
      document
        .getAnimations()
        .filter((a) => a.effect?.getTiming().iterations !== Infinity)
        .map((a) => a.finished),
    ),
  );
  const { violations } = await new AxeBuilder({ page })
    .withTags(TAGS)
    .analyze();
  expect(
    violations.map(
      (v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`,
    ),
    page.url(),
  ).toEqual([]);
}
