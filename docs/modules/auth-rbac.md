# auth-rbac

Firebase Auth + control de acceso por rol. Flag: `modulesConfig.authRbac`.

## Exports — raíz y subpath (`@mgorrin/web-kit` y `@mgorrin/web-kit/auth-rbac`)

| Export                    | Tipo  | Notas                                                                                                                                                                                    |
| ------------------------- | ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `getFirebaseAuth`         | valor | SDK cliente de Firebase Auth — perezoso, no inicializa hasta el primer uso.                                                                                                              |
| `getFirebaseDb`           | valor | SDK cliente de Firestore — perezoso.                                                                                                                                                     |
| `hasRequiredRole`         | valor | `(role, allowed[]) => boolean` — puro.                                                                                                                                                   |
| `useRoleGuard`            | valor | Igual que `hasRequiredRole`, pensado para UI cosmética.                                                                                                                                  |
| `GoogleSignInButton`      | valor | Componente cliente — "Continuar con Google". `signInWithPopup` → ID token → `POST /api/auth/session` → redirige a `/admin` (rol admin/super_admin) o a `redirectTo` (default `/portal`). |
| `SignOutButton`           | valor | Cierra el SDK cliente y la cookie de sesión, en ese orden.                                                                                                                               |
| `Role`                    | tipo  | `"super_admin" \| "admin" \| "specialist"`.                                                                                                                                              |
| `SessionUser`             | tipo  | `{ uid, email, displayName, role, sedeId }`.                                                                                                                                             |
| `GoogleSignInButtonProps` | tipo  | `{ redirectTo?: string }`.                                                                                                                                                               |

## Exports — **solo subpath** (`@mgorrin/web-kit/auth-rbac`), server-only

| Export                                 | Notas                                                                                                                                                                                                                                                                                                                          |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `getSession(sessionCookie)`            | Nunca lanza — retorna `null` en cualquier caso de cookie ausente/inválida/expirada. Recibe la cookie ya extraída (no toca `next/headers` directamente, para no acoplar el paquete a Next.js).                                                                                                                                  |
| `establishSession(idToken)`            | Intercambia un ID token por una cookie de sesión (`adminAuth.createSessionCookie`), y crea `users/{uid}` con `role: "specialist"` por defecto si es el primer login. Puede lanzar `InvalidIdTokenError` — a diferencia de `getSession`, el caller (la ruta de login) necesita distinguir "credencial inválida" de "todo bien". |
| `InvalidIdTokenError`                  | —                                                                                                                                                                                                                                                                                                                              |
| `MissingFirebaseAdminCredentialsError` | Lanzado al importar el SDK admin si faltan `FIREBASE_ADMIN_*` fuera del modo emulador.                                                                                                                                                                                                                                         |

**Por qué no están en la raíz:** importan (transitivamente) el SDK admin, que resuelve credenciales
al cargar el módulo. Reexportarlos desde el barrel raíz forzaría esa comprobación en cualquier
página que solo quiera un `<Button>`. Ver `docs/surface.md`.

## Flujo de login (blueprint §8)

navegador: `GoogleSignInButton` → `signInWithPopup` (Firebase Auth) → `getIdToken()` → `POST
/api/auth/session` (Route Handler) → `establishSession` → cookie `session` httpOnly seteada → según
el rol devuelto, redirige a `/admin` o `/portal`.

Cierre de sesión: `SignOutButton` → `signOut()` del SDK cliente → `DELETE /api/auth/session` → borra
la cookie → redirige a `/`.

La nav pública (`apps/template/src/app/layout.tsx`) muestra `GoogleSignInButton` sin sesión, o el
nombre + `SignOutButton` con sesión — ambos Server-rendered vía `getSession()`.

## Reforzamiento de rutas

La autorización real siempre se verifica server-side (`getSession()` + `hasRequiredRole()` dentro
del Route Handler o layout) — un guard de UI que oculta un botón nunca es la única verificación. Ver
`CLAUDE.md`, "Regla de refuerzo".

## Server-side con permisos usa el SDK admin

Cualquier repositorio de OTRO módulo que escriba/lea Firestore desde un Route Handler o Server
Component (no desde un componente `"use client"` en el navegador) usa el SDK admin
(`firebase-admin/firestore`), nunca `getFirebaseDb()` — el SDK cliente en el servidor nunca queda
autenticado como el usuario del request.

## `.firebaserc`

El proyecto pin el id `web-kit-test` para el emulador (`.firebaserc` en la raíz). Sin él, `firebase
emulators:start`/`emulators:exec` auto-genera un id `demo-*` distinto, y cualquier ID token real
emitido por el emulador de Auth trae ese id en su claim `aud` — que no coincide con
`FIREBASE_ADMIN_PROJECT_ID`, y `adminAuth.verifyIdToken()`/`establishSession()` lo rechazan.
Confirmado por ejecución real.
