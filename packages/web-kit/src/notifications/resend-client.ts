// Server-only — sostiene `RESEND_API_KEY`. Ver CLAUDE.md, límites de capas.
import "server-only";
import { Resend } from "resend";
import { resolveResendApiKey } from "./resend-credentials.ts";

// Se evalúa al importar el módulo, no al primer uso — ver acceptance #3 de
// E2-T3 (mismo patrón que `auth-rbac/firebase-admin.server.ts`).
export const resend = new Resend(resolveResendApiKey());
