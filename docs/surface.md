# Superficie pública de `@mgorrin/web-kit`

> Este documento es la fuente de verdad legible por humanos de lo que exporta
> `packages/web-kit/src/index.ts` (raíz del paquete, `@mgorrin/web-kit`) y cada subpath de módulo
> (`@mgorrin/web-kit/<módulo>`). Cada símbolo listado abajo debe existir, verbatim, en la allowlist
> correspondiente. Ambas listas se actualizan juntas, nunca por separado.
>
> **Congelada desde E1-T2.** Cualquier export nuevo pasa por `.claude/skills/add-a-module`.
>
> **Nota sobre `auth-rbac`:** el barrel raíz (`@mgorrin/web-kit`) deliberadamente NO reexporta todo
> lo de `auth-rbac` — solo lo client-safe. Lo marcado _"solo subpath"_ existe únicamente en
> `@mgorrin/web-kit/auth-rbac` (nunca en la raíz): son piezas server-only cuya sola importación
> evalúa una comprobación de credenciales, y forzar esa evaluación en cualquier página que solo
> importe la raíz del paquete rompería páginas que nunca tocan Firebase Admin.

## Exports de valor

| Export                                 | Módulo          | Desde                                 |
| -------------------------------------- | --------------- | ------------------------------------- |
| `Button`                               | `design-system` | E1-T2 — raíz y subpath                |
| `Card`                                 | `design-system` | E1-T2 — raíz y subpath                |
| `Input`                                | `design-system` | E1-T2 — raíz y subpath                |
| `Dialog`                               | `design-system` | E1-T2 — raíz y subpath                |
| `getFirebaseAuth`                      | `auth-rbac`     | E1-T3 — raíz y subpath, perezoso      |
| `getFirebaseDb`                        | `auth-rbac`     | E1-T3 — raíz y subpath, perezoso      |
| `hasRequiredRole`                      | `auth-rbac`     | E1-T3 — raíz y subpath                |
| `useRoleGuard`                         | `auth-rbac`     | E1-T3 — raíz y subpath                |
| `getSession`                           | `auth-rbac`     | E1-T3 — **solo subpath**, server-only |
| `MissingFirebaseAdminCredentialsError` | `auth-rbac`     | E1-T3 — **solo subpath**, server-only |

## Exports de tipo

| Export          | Módulo          | Desde                  |
| --------------- | --------------- | ---------------------- |
| `ButtonVariant` | `design-system` | E1-T2 — raíz y subpath |
| `Role`          | `auth-rbac`     | E1-T3 — raíz y subpath |
| `SessionUser`   | `auth-rbac`     | E1-T3 — raíz y subpath |
