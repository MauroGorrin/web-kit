// Lógica pura, sin `server-only` — separada de `resend-client.ts` para que
// sea testeable directamente con vitest. `server-only` lanza
// incondicionalmente fuera del pipeline de build de Next.js — mismo patrón
// que `auth-rbac/admin-credentials.ts`.
export class MissingResendApiKeyError extends Error {
  constructor() {
    super("Falta la variable de entorno RESEND_API_KEY. Ver .env.example.");
    this.name = "MissingResendApiKeyError";
  }
}

/** Se llama al importar `resend-client.ts`, no al primer uso — ver acceptance #3 de E2-T3. */
export function resolveResendApiKey(): string {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new MissingResendApiKeyError();
  return apiKey;
}
