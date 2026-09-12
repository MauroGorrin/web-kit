import "@testing-library/jest-dom/vitest";

// Loader de entorno para Vitest: Vitest NO carga .env por sí solo (solo lo hace
// el framework Next.js al arrancar la app). Este archivo es el mecanismo de
// carga explícito que exige el §19.6 para cualquier herramienta standalone que
// lea process.env — aquí, la propia suite de tests.
import { loadEnv } from "vite";

const env = loadEnv("test", process.cwd(), "");
for (const [key, value] of Object.entries(env)) {
  if (process.env[key] === undefined) process.env[key] = value;
}

// Valores fijos de los emuladores locales — nunca secretos reales.
process.env.FIRESTORE_EMULATOR_HOST ??= "127.0.0.1:8080";
process.env.FIREBASE_AUTH_EMULATOR_HOST ??= "127.0.0.1:9099";
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ??= "web-kit-test";
process.env.FIREBASE_ADMIN_PROJECT_ID ??= "web-kit-test";
