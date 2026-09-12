import { test, expect } from "@playwright/test";
import { theme } from "../theme.config";

function hexToRgb(hex: string): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgb(${r}, ${g}, ${b})`;
}

test("la home renderiza un Button estilizado con --color-primary de theme.config.ts", async ({
  page,
}) => {
  await page.goto("/");

  const button = page.getByRole("button", { name: "Empezar" });
  await expect(button).toBeVisible();

  // El componente nunca hardcodea el hex — lee var(--color-primary), cuyo
  // valor final viene del override que theme.config.ts inyecta en el layout.
  const backgroundColor = await button.evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(backgroundColor).toBe(hexToRgb(theme.colorPrimary));
});
