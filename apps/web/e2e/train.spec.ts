import { expect, test, type Page } from "@playwright/test";

const SHOTS = "e2e-screenshots/train";

const shot = (page: Page, name: string) =>
  page.screenshot({ path: `${SHOTS}/${name}.png`, animations: "disabled" });

async function logSet(page: Page, weight: string) {
  await page.locator('input[inputmode="decimal"]').fill(weight);
  await page.getByRole("button", { name: "Registrar serie" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Serie" }),
  ).toBeHidden();
}

const currentExercise = (page: Page, name: string) =>
  expect(page.getByRole("main").getByText(name, { exact: true })).toBeVisible();

test("trains a guided routine, jumping ahead, without ending it early", async ({
  page,
}) => {
  const startedAt = new Date();
  const id = Date.now().toString(36);
  const register = await page.request.post("/api/auth/register", {
    data: {
      email: `e2e-${id}@example.test`,
      username: `e2e-${id}`,
      password: `pw-${id}-${Math.random().toString(36).slice(2)}`,
    },
  });
  expect(register.ok()).toBeTruthy();
  const cookies = await page.context().cookies();
  await page
    .context()
    .addCookies(cookies.map((cookie) => ({ ...cookie, secure: false })));

  const catalog: { id: string; name: string }[] = await (
    await page.request.get("/api/exercises")
  ).json();
  const [a, b, c] = catalog.slice(0, 3);
  const block = { kind: "weight_reps", sets: 2, reps: 8, repsMax: null };
  const routine = await page.request.post("/api/routines", {
    data: {
      name: `E2E ${id}`,
      items: [a, b, c].map((e, position) => ({
        exerciseId: e.id,
        position,
        blocks: [block],
      })),
    },
  });
  expect(routine.ok()).toBeTruthy();

  await page.goto("/routines");
  const start = page.getByRole("button", { name: "Empezar Rutina" });
  await expect(start).toBeVisible();
  await shot(page, "01-routines");
  await start.click();
  await currentExercise(page, a.name);
  await shot(page, "02-first-set");

  await logSet(page, "40");
  await currentExercise(page, a.name);

  await page.getByTitle("Mapa de la sesión").click();
  await expect(
    page.getByRole("heading", { name: "Mapa de la sesión" }),
  ).toBeVisible();
  await shot(page, "03-session-map");
  await page.getByRole("button").filter({ hasText: c.name }).click();
  await currentExercise(page, c.name);

  await logSet(page, "20");
  await logSet(page, "20");

  await expect(page.getByText("¡Rutina completada!")).toBeHidden();
  await currentExercise(page, a.name);
  await shot(page, "04-back-to-pending");

  await logSet(page, "40");
  await currentExercise(page, b.name);
  await logSet(page, "30");
  await logSet(page, "30");

  await expect(page.getByText("¡Rutina completada!")).toBeVisible();
  await shot(page, "05-routine-done");

  const range = `from=${new Date(startedAt.getTime() - 60_000).toISOString()}&to=${new Date(Date.now() + 60_000).toISOString()}`;
  await expect
    .poll(
      async () =>
        (await (await page.request.get(`/api/workouts?${range}`)).json())
          .length,
    )
    .toBe(6);

  await page.getByRole("button", { name: "Terminar sesión" }).click();
  await expect(page).toHaveURL("/");
  await expect(page.getByRole("link", { name: /Iniciar/ })).toBeVisible();
  await shot(page, "06-home");
});
