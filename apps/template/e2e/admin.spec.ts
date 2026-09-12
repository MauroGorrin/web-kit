import { test, expect } from "@playwright/test";

test("un usuario no autenticado que visita /admin es redirigido a /", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL("/");
});

// El flujo completo "admin crea y ve listada una Cita" (acceptance #5)
// necesita una sesión de admin real: crear un usuario en el emulador de
// Firebase Auth, sembrar su documento `users/{uid}` con `role: "admin"`, y
// mintar la cookie de sesión con `adminAuth.createSessionCookie()`. Ningún
// task del blueprint construye la ruta que emite esa cookie a partir del
// login de Google (el flujo de login-real está descrito en la narrativa de
// §8, pero no como una tarea con `verify` propio) — sin ella no hay forma de
// autenticar un browser real contra este build. Documentado como hallazgo
// del blueprint; no es un defecto de esta tarea.
test("un admin crea una Cita desde /admin/citas y la ve listada", async () => {
  test.skip(
    true,
    "Bloqueado: no existe ninguna ruta que emita la cookie de sesión (ver comentario arriba).",
  );
});
