import { expect, test, type Locator, type Page } from "@playwright/test";
import { expectAccessible } from "./axe";

async function signUp(page: Page) {
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const register = await page.request.post("/api/auth/register", {
    data: {
      email: `e2e-${id}@example.test`,
      username: `e2e${id}`,
      password: `pw-${id}-${Math.random().toString(36).slice(2)}`,
    },
  });
  expect(register.ok()).toBeTruthy();
  const cookies = await page.context().cookies();
  await page
    .context()
    .addCookies(cookies.map((cookie) => ({ ...cookie, secure: false })));

  const catalog: { id: string }[] = await (
    await page.request.get("/api/exercises")
  ).json();
  const block = { kind: "weight_reps", sets: 2, reps: 8, repsMax: null };
  const routine: { id: string } = await (
    await page.request.post("/api/routines", {
      data: {
        name: `E2E ${id}`,
        items: catalog.slice(0, 3).map((e, position) => ({
          exerciseId: e.id,
          position,
          blocks: [block],
        })),
      },
    })
  ).json();
  const program: { id: string } = await (
    await page.request.post("/api/programs", {
      data: { name: `E2E ${id}`, routineIds: [routine.id] },
    })
  ).json();
  const slug = `e2e-${id}`;
  const publish = await page.request.post(
    `/api/routines/${routine.id}/publish`,
    { data: { slug } },
  );
  expect(publish.ok()).toBeTruthy();
  return { routine, program, slug, cookies: await page.context().cookies() };
}

let account: Awaited<ReturnType<typeof signUp>>;

test.beforeAll(async ({ browser }, testInfo) => {
  const context = await browser.newContext({
    baseURL: testInfo.project.use.baseURL,
  });
  account = await signUp(await context.newPage());
  await context.close();
});

const signIn = (page: Page) => page.context().addCookies(account.cookies);

async function visit(page: Page, path: string) {
  await page.goto(path);
  await expectAccessible(page);
}

async function openSheet(page: Page, trigger: Locator) {
  await trigger.click();
  await expect(page.locator("[role=dialog],[role=alertdialog]")).toBeVisible();
  await expectAccessible(page);
  await page.keyboard.press("Escape");
  await expect(page.locator("[role=dialog],[role=alertdialog]")).toBeHidden();
}

for (const colorScheme of ["light", "dark"] as const) {
  test.describe(colorScheme, () => {
    test.use({ colorScheme });

    test("public pages are accessible", async ({ page }) => {
      for (const path of [
        "/",
        "/login",
        "/register",
        "/privacidad",
        "/does-not-exist",
      ]) {
        await visit(page, path);
      }
    });

    test("signed-in pages are accessible", async ({ page }) => {
      await signIn(page);
      const { routine, program, slug } = account;

      await visit(page, "/");
      await openSheet(
        page,
        page.getByRole("button", { name: /Novedades/ }).first(),
      );

      for (const path of [
        "/routines",
        `/routines/${routine.id}`,
        "/routines/new",
        `/routines/${routine.id}/publish`,
        "/programs",
        `/programs/${program.id}`,
        "/log",
        "/history",
        "/explore",
        `/explore/routines/${slug}`,
        "/perfil",
        "/perfil/ajustes",
      ]) {
        await visit(page, path);
      }

      await openSheet(page, page.getByRole("button", { name: "Tema" }));
      await openSheet(
        page,
        page.getByRole("button", { name: "Nombres de ejercicios" }),
      );
      await openSheet(
        page,
        page.getByRole("button", { name: "Borrar mi cuenta" }),
      );
    });

    test("training is accessible", async ({ page }) => {
      await signIn(page);
      await page.goto("/routines");
      await page.getByRole("button", { name: "Empezar Rutina" }).click();
      await expect(page).toHaveURL(/\/train/);
      await expectAccessible(page);
      await openSheet(page, page.getByTitle("Mapa de la sesión"));

      await page.locator('input[inputmode="decimal"]').fill("40");
      await page.getByRole("button", { name: "Registrar serie" }).click();
      await expect(
        page.getByRole("status").filter({ hasText: "Serie" }),
      ).toBeHidden();
      await expectAccessible(page);

      await visit(page, "/history");
      await openSheet(
        page,
        page.getByRole("button", { name: "Exportar para tu IA" }),
      );
    });
  });
}
