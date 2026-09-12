import { test, expect } from "@playwright/test";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Siembra Sede + Producto directo contra el emulador vía SDK admin (bypassa
// firestore.rules) — no hay todavía una ruta que emita una cookie de sesión
// real para simular un admin logueado desde el browser (ver hallazgo de
// E2-T1). Requiere el emulador de Firestore corriendo
// (FIRESTORE_EMULATOR_HOST) antes de este comando — igual que
// `tests/rules/*.test.ts`.
test.beforeAll(async () => {
  const app =
    getApps()[0] ??
    initializeApp({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID ?? "web-kit-test",
      ...(process.env.FIRESTORE_EMULATOR_HOST ? {} : { credential: cert({} as never) }),
    });
  const db = getFirestore(app);

  await db.collection("sedes").doc("sede-e2e-tienda").set({
    name: "Sede E2E",
    address: "Calle 1",
    hours: "",
    contact: "",
    isDefault: true,
  });

  await db.collection("productos").doc("producto-e2e-tienda").set({
    name: "Producto E2E",
    priceCents: 1999,
    images: [],
    sedeId: "sede-e2e-tienda",
    inventoryCount: 5,
  });
});

test("agrega un producto al carrito desde /tienda", async ({ page }) => {
  await page.goto("/tienda");

  const addButton = page.getByRole("button", { name: "Agregar al carrito" }).first();
  await expect(addButton).toBeVisible();
  await addButton.click();

  await expect(page.getByTestId("cart-count")).toContainText("1");
});
