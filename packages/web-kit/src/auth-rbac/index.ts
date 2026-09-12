// Allowlist del módulo auth-rbac — no un barrel. `getSession`/`establishSession`
// son server-only (ver session.ts/create-session.server.ts/firebase-admin.server.ts,
// protegidos por `server-only`); el resto es seguro tanto en Server como en
// Client Components.
export type { Role, SessionUser } from "./types.ts";
export { getFirebaseAuth, getFirebaseDb } from "./firebase-client.ts";
export { getSession } from "./session.ts";
export {
  establishSession,
  InvalidIdTokenError,
  type EstablishedSession,
} from "./create-session.server.ts";
export { MissingFirebaseAdminCredentialsError } from "./firebase-admin.server.ts";
export { hasRequiredRole, useRoleGuard } from "./use-role-guard.ts";
export { GoogleSignInButton, type GoogleSignInButtonProps } from "./GoogleSignInButton.tsx";
export { SignOutButton } from "./SignOutButton.tsx";
