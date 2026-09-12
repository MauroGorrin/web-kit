// Lógica pura, sin `server-only` — separada de `firebase-admin.server.ts` a
// propósito para que sea testeable directamente con vitest. `server-only`
// lanza incondicionalmente fuera del pipeline de build de Next.js (es lo que
// lo hace funcionar: Next lo alía a un no-op solo en bundles de servidor), así
// que un archivo que lo importe no puede probarse con un import plano.
export class MissingFirebaseAdminCredentialsError extends Error {
  constructor(missing: string[]) {
    super(
      `Faltan variables de entorno del SDK admin de Firebase: ${missing.join(", ")}. ` +
        "Ver .env.example — son obligatorias fuera del emulador local.",
    );
    this.name = "MissingFirebaseAdminCredentialsError";
  }
}

export function isEmulatorMode(): boolean {
  return Boolean(process.env.FIRESTORE_EMULATOR_HOST || process.env.FIREBASE_AUTH_EMULATOR_HOST);
}

export type AdminCredentials =
  | { mode: "emulator"; projectId: string }
  | { mode: "cert"; projectId: string; clientEmail: string; privateKey: string };

/**
 * Contra el emulador local no hace falta una cuenta de servicio real — el
 * emulador no verifica credenciales. Fuera de él, las tres variables son
 * obligatorias y su ausencia lanza aquí — se llama al importar
 * `firebase-admin.server.ts`, no al primer uso. Ver acceptance #5 de E1-T3.
 */
export function resolveAdminCredentials(): AdminCredentials {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;

  if (isEmulatorMode()) {
    return { mode: "emulator", projectId: projectId ?? "web-kit-test" };
  }

  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  const missing: string[] = [];
  if (!projectId) missing.push("FIREBASE_ADMIN_PROJECT_ID");
  if (!clientEmail) missing.push("FIREBASE_ADMIN_CLIENT_EMAIL");
  if (!privateKey) missing.push("FIREBASE_ADMIN_PRIVATE_KEY");
  if (missing.length > 0) {
    throw new MissingFirebaseAdminCredentialsError(missing);
  }

  return {
    mode: "cert",
    projectId: projectId!,
    clientEmail: clientEmail!,
    // La consola de Firebase entrega la clave con saltos de línea escapados
    // (`\n` literal) cuando se pega en una env var de una sola línea.
    privateKey: privateKey!.replace(/\\n/g, "\n"),
  };
}
