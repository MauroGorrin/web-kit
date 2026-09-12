// Esta es una ALLOWLIST pública, no un barrel file: cada export nombrado aquí es superficie
// pública congelada del paquete y cualquier cambio a esta lista debe reflejarse en
// `docs/surface.md`. No se agrega `export *` de ningún módulo — cada símbolo se re-exporta
// explícitamente cuando su módulo esté listo.
//
export * from "./design-system/index.ts";
// Deliberadamente NO `export * from "./auth-rbac/index.ts"`: ese barrel incluye
// session.ts/firebase-admin.server.ts (server-only, con una comprobación de
// credenciales que se evalúa al importar el módulo). Reexportar aunque sea un
// solo nombre desde ahí forzaría a evaluar TODO ese módulo — y con él, la
// comprobación de credenciales — en cualquier página que solo quiera un
// <Button>. Confirmado por ejecución real durante E1-T3. Lo client-safe se
// reexporta a mano desde los archivos concretos; `getSession` y el resto de lo
// server-only viven únicamente en el subpath `@mgorrin/web-kit/auth-rbac`.
export type { Role, SessionUser } from "./auth-rbac/types.ts";
export { hasRequiredRole, useRoleGuard } from "./auth-rbac/use-role-guard.ts";
export { getFirebaseAuth, getFirebaseDb } from "./auth-rbac/firebase-client.ts";
// multi-location y scheduling no tienen efectos secundarios al importar —
// seguro de reexportar completo.
export * from "./multi-location/index.ts";
export * from "./scheduling/index.ts";
