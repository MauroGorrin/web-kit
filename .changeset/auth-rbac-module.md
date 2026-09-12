---
"@mgorrin/web-kit": minor
---

Añade el módulo `auth-rbac`: SDK cliente/admin de Firebase, `getSession()` server-only,
`hasRequiredRole`/`useRoleGuard`, y el tipo `Role`. Confirma con tests reales contra el emulador la
sección `users` de `firestore.rules`. El barrel raíz del paquete solo reexporta las piezas
client-safe — `getSession` y lo server-only viven únicamente en el subpath `@mgorrin/web-kit/auth-rbac`.
