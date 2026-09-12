import { test, expect } from "@playwright/test";

// Smoke test de CI: confirma que el build arrancó y las rutas públicas
// básicas responden — deliberadamente sin tocar Firestore (a diferencia de
// portal/admin/tienda), para que sea la primera señal de vida del pipeline
// aunque algo más profundo falle.
test.describe("CI smoke", () => {
  test("la home responde 200", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
  });

  test("/agenda responde 200", async ({ page }) => {
    const response = await page.goto("/agenda");
    expect(response?.status()).toBe(200);
  });

  test("/sitemap.xml y /robots.txt responden 200", async ({ request, baseURL }) => {
    const sitemap = await request.get(`${baseURL}/sitemap.xml`);
    expect(sitemap.status()).toBe(200);

    const robots = await request.get(`${baseURL}/robots.txt`);
    expect(robots.status()).toBe(200);
  });
});
