import { expect, test, type Page } from "@playwright/test";

const id = Date.now().toString(36);

const account = (name: string) => ({
  email: `e2e-${name}-${id}@example.test`,
  username: `e2e${name}${id}`,
  password: `pw-${id}-${Math.random().toString(36).slice(2)}`,
  locale: "es",
});

async function signIn(page: Page, path: string, data: object) {
  const res = await page.request.post(path, { data });
  expect(res.ok()).toBeTruthy();
  const cookies = await page.context().cookies();
  await page
    .context()
    .addCookies(cookies.map((cookie) => ({ ...cookie, secure: false })));
}

const range = () => {
  const day = 24 * 60 * 60 * 1000;
  const from = new Date(Date.now() - day).toISOString();
  const to = new Date(Date.now() + day).toISOString();
  return `from=${from}&to=${to}`;
};

const pendingSets = (page: Page) =>
  page.evaluate(() =>
    Object.keys(localStorage)
      .filter((k) => k.startsWith("gymtrack-pending-sets"))
      .flatMap((k) => JSON.parse(localStorage.getItem(k) ?? "[]")),
  );

const workouts = async (page: Page) =>
  (await (await page.request.get(`/api/workouts?${range()}`)).json()).length;

test("pending sets wait for their own account on a shared phone", async ({
  page,
}) => {
  const ana = account("ana");
  const ben = account("ben");
  await signIn(page, "/api/auth/register", ana);

  const [exercise] = await (await page.request.get("/api/exercises")).json();

  await page.route("**/api/workouts", (route) =>
    route.request().method() === "POST" ? route.abort() : route.continue(),
  );
  await page.goto("/log");
  await page
    .getByPlaceholder("Busca o escribe para crear...")
    .fill(exercise.name);
  await page.getByRole("button", { name: exercise.name, exact: true }).click();
  await page.locator('input[inputmode="decimal"]').fill("40");
  await page.locator('input[inputmode="numeric"]').fill("8");
  await page.getByRole("button", { name: "Registrar Set" }).click();
  await expect.poll(() => pendingSets(page)).toHaveLength(1);

  await page.goto("/perfil/ajustes");
  await page.getByRole("button", { name: "Cerrar sesión" }).click();
  await expect(page).toHaveURL(/\/login/);
  await page.unroute("**/api/workouts");

  await signIn(page, "/api/auth/register", ben);
  await page.goto("/log");
  await expect(page.getByRole("main")).toBeVisible();
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(2000);
  expect(await workouts(page)).toBe(0);
  expect(await pendingSets(page)).toHaveLength(1);

  await signIn(page, "/api/auth/login", {
    email: ana.email,
    password: ana.password,
  });
  await page.goto("/log");
  await expect.poll(() => workouts(page)).toBe(1);
  await expect.poll(() => pendingSets(page)).toHaveLength(0);
});
