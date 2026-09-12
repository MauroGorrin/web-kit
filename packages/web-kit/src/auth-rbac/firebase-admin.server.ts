// SDK admin de Firebase — SOLO server-side. `import "server-only"` convierte
// cualquier intento de arrastrar este archivo a un bundle de cliente en un
// error de build explícito, en vez de una fuga silenciosa de credenciales.
// Ver CLAUDE.md, límites de capas: "firebase-admin solo en archivos *.server.ts".
import "server-only";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { resolveAdminCredentials } from "./admin-credentials.ts";

export { MissingFirebaseAdminCredentialsError } from "./admin-credentials.ts";

function createAdminApp(): App {
  const existing = getApps()[0];
  if (existing) return existing;

  // Se evalúa al importar el módulo, no al primer uso — ver acceptance #5.
  const credentials = resolveAdminCredentials();

  if (credentials.mode === "emulator") {
    return initializeApp({ projectId: credentials.projectId });
  }

  return initializeApp({
    credential: cert({
      projectId: credentials.projectId,
      clientEmail: credentials.clientEmail,
      privateKey: credentials.privateKey,
    }),
    projectId: credentials.projectId,
  });
}

const adminApp = createAdminApp();

export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);
