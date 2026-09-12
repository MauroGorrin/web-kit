import { test, expect } from "@playwright/test";

test("un usuario no autenticado que visita /portal es redirigido a /", async ({ page }) => {
  await page.goto("/portal");
  await expect(page).toHaveURL("/");
});
