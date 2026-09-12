# auth-rbac

Firebase Auth + control de acceso por rol. Flag: `modulesConfig.authRbac`.

## Exports — raíz y subpath (`@mgorrin/web-kit` y `@mgorrin/web-kit/auth-rbac`)

| Export            | Tipo  | Notas                                                                       |
| ----------------- | ----- | --------------------------------------------------------------------------- |
| `getFirebaseAuth` | valor | SDK cliente de Firebase Auth — perezoso, no inicializa hasta el primer uso. |
| `getFirebaseDb`   | valor | SDK cliente de Firestore — perezoso.                                        |
| `hasRequiredRole` | valor | `(role, allowed[]) => boolean` — puro.                                      |
| `useRoleGuard`    | valor | Igual que `hasRequiredRole`, pensado para UI cosmética.                     |
| `Role`            | tipo  | `"super_admin" \| "admin" \| "specialist"`.                                 |
| `SessionUser`     | tipo  | `{ uid, email, displayName, role, sedeId }`.                                |

## Exports — **solo subpath** (`@mgorrin/web-kit/auth-rbac`), server-only

| Export                                 | Notas                                                                                                                                                                                         |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `getSession(sessionCookie)`            | Nunca lanza — retorna `null` en cualquier caso de cookie ausente/inválida/expirada. Recibe la cookie ya extraída (no toca `next/headers` directamente, para no acoplar el paquete a Next.js). |
| `MissingFirebaseAdminCredentialsError` | Lanzado al importar el SDK admin si faltan `FIREBASE_ADMIN_*` fuera del modo emulador.                                                                                                        |

**Por qué `getSession` no está en la raíz:** importa (transitivamente) el SDK admin, que resuelve
credenciales al cargar el módulo. Reexportarlo desde el barrel raíz forzaría esa comprobación en
cualquier página que solo quiera un `<Button>`. Ver `docs/surface.md`.

## Reforzamiento de rutas

La autorización real siempre se verifica server-side (`getSession()` + `hasRequiredRole()` dentro
del Route Handler o layout) — un guard de UI que oculta un botón nunca es la única verificación. Ver
`CLAUDE.md`, "Regla de refuerzo".

## Server-side con permisos usa el SDK admin

Cualquier repositorio de OTRO módulo que escriba/lea Firestore desde un Route Handler o Server
Component (no desde un componente `"use client"` en el navegador) usa el SDK admin
(`firebase-admin/firestore`), nunca `getFirebaseDb()` — el SDK cliente en el servidor nunca queda
autenticado como el usuario del request.
