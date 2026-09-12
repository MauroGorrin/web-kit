// Allowlist del módulo auth-rbac — no un barrel. `getSession` es server-only
// (ver session.ts/firebase-admin.server.ts, protegidos por `server-only`);
// el resto es seguro tanto en Server como en Client Components.
export type { Role, SessionUser } from "./types.ts";
export { getFirebaseAuth, getFirebaseDb } from "./firebase-client.ts";
export { getSession } from "./session.ts";
export { MissingFirebaseAdminCredentialsError } from "./firebase-admin.server.ts";
export { hasRequiredRole, useRoleGuard } from "./use-role-guard.ts";
