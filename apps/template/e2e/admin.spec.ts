import { test, expect } from "@playwright/test";
import { getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp as initClientApp } from "firebase/app";
import {
  connectAuthEmulator,
  getAuth as getClientAuth,
  signInWithCustomToken,
} from "firebase/auth";

test("un usuario no autenticado que visita /admin es redirigido a /", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL("/");
});

// Autentica un admin real contra el emulador vía custom token (misma técnica
// que un login real de Google, salteando solo el popup) y siembra una Sede —
// ver `packages/web-kit/src/auth-rbac/create-session.server.ts` y
// `apps/template/src/app/api/auth/session/route.ts`. `page.request` comparte
// el cookie jar con `page`, así que la cookie que devuelve esa ruta queda
// puesta en el browser sin tocar nada del lado del cliente.
test("un admin crea una Cita desde /admin/citas y la ve listada", async ({ page, baseURL }) => {
  const adminApp =
    getApps()[0] ??
    initializeApp({ projectId: process.env.FIREBASE_ADMIN_PROJECT_ID ?? "web-kit-test" });
  const adminAuth = getAuth(adminApp);
  const db = getFirestore(adminApp);

  const uid = `admin-e2e-${Date.now()}`;
  await adminAuth.createUser({ uid, email: `${uid}@example.com`, displayName: "Admin E2E" });
  await db
    .collection("users")
    .doc(uid)
    .set({
      uid,
      email: `${uid}@example.com`,
      displayName: "Admin E2E",
      role: "admin",
      sedeId: null,
    });
  // `isDefault: false` a propósito — `tienda.spec.ts` siembra su propia Sede
  // default en paralelo contra el mismo emulador; dos Sedes con
  // `isDefault: true` a la vez hacen que `/tienda` (que resuelve
  // `sedes.find(s => s.isDefault)`) pueda quedarse con la de este test, que
  // no tiene productos. `CitasTable` no necesita que la suya sea la default,
  // solo que exista al menos una Sede para preseleccionar.
  await db.collection("sedes").doc("sede-admin-e2e").set({
    name: "Sede Admin E2E",
    address: "Calle 1",
    hours: "",
    contact: "",
    isDefault: false,
  });

  const customToken = await adminAuth.createCustomToken(uid);

  const clientApp = initClientApp(
    { apiKey: "demo-api-key", projectId: process.env.FIREBASE_ADMIN_PROJECT_ID ?? "web-kit-test" },
    `admin-e2e-client-${uid}`,
  );
  const clientAuth = getClientAuth(clientApp);
  connectAuthEmulator(
    clientAuth,
    `http://${process.env.FIREBASE_AUTH_EMULATOR_HOST ?? "127.0.0.1:9099"}`,
  );
  const credential = await signInWithCustomToken(clientAuth, customToken);
  const idToken = await credential.user.getIdToken();

  const sessionResponse = await page.request.post(`${baseURL}/api/auth/session`, {
    data: { idToken },
  });
  expect(sessionResponse.ok()).toBe(true);

  await page.goto("/admin/citas");

  const datetimeInput = page.locator('input[type="datetime-local"]');
  await datetimeInput.fill("2026-12-01T15:00");
  await page.getByRole("button", { name: "Agendar" }).click();

  await expect(page.getByText("2026")).toBeVisible();
});
