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

| Export                                 | Módulo           | Desde                                 |
| -------------------------------------- | ---------------- | ------------------------------------- |
| `Button`                               | `design-system`  | E1-T2 — raíz y subpath                |
| `Card`                                 | `design-system`  | E1-T2 — raíz y subpath                |
| `Input`                                | `design-system`  | E1-T2 — raíz y subpath                |
| `Dialog`                               | `design-system`  | E1-T2 — raíz y subpath                |
| `getFirebaseAuth`                      | `auth-rbac`      | E1-T3 — raíz y subpath, perezoso      |
| `getFirebaseDb`                        | `auth-rbac`      | E1-T3 — raíz y subpath, perezoso      |
| `hasRequiredRole`                      | `auth-rbac`      | E1-T3 — raíz y subpath                |
| `useRoleGuard`                         | `auth-rbac`      | E1-T3 — raíz y subpath                |
| `getSession`                           | `auth-rbac`      | E1-T3 — **solo subpath**, server-only |
| `MissingFirebaseAdminCredentialsError` | `auth-rbac`      | E1-T3 — **solo subpath**, server-only |
| `createSede`                           | `multi-location` | E1-T4 — raíz y subpath                |
| `getSede`                              | `multi-location` | E1-T4 — raíz y subpath                |
| `listSedes`                            | `multi-location` | E1-T4 — raíz y subpath                |
| `updateSede`                           | `multi-location` | E1-T4 — raíz y subpath                |
| `deleteSede`                           | `multi-location` | E1-T4 — raíz y subpath                |
| `SedeDeletionConflictError`            | `multi-location` | E1-T4 — raíz y subpath                |
| `createCita`                           | `scheduling`     | E1-T5 — raíz y subpath                |
| `getCita`                              | `scheduling`     | E1-T5 — raíz y subpath                |
| `updateCita`                           | `scheduling`     | E1-T5 — raíz y subpath                |
| `CalendlyEmbed`                        | `scheduling`     | E1-T5 — raíz y subpath                |
| `listUpcomingCitasForClient`           | `scheduling`     | E1-T6 — raíz y subpath                |
| `NextAppointmentCard`                  | `client-portal`  | E1-T6 — raíz y subpath                |
| `NotificationList`                     | `client-portal`  | E1-T6 — raíz y subpath                |
| `listCitasBetween`                     | `scheduling`     | E2-T1 — raíz y subpath                |
| `createEspecialista`                   | `admin-panel`    | E2-T1 — raíz y subpath                |
| `deleteEspecialista`                   | `admin-panel`    | E2-T1 — raíz y subpath                |
| `listEspecialistas`                    | `admin-panel`    | E2-T1 — raíz y subpath                |
| `updateEspecialista`                   | `admin-panel`    | E2-T1 — raíz y subpath                |
| `Dashboard`                            | `admin-panel`    | E2-T1 — raíz y subpath                |
| `CitasTable`                           | `admin-panel`    | E2-T1 — raíz y subpath                |
| `EspecialistasCrud`                    | `admin-panel`    | E2-T1 — raíz y subpath                |
| `SedesCrud`                            | `admin-panel`    | E2-T1 — raíz y subpath                |

## Exports de tipo

| Export                     | Módulo           | Desde                  |
| -------------------------- | ---------------- | ---------------------- |
| `ButtonVariant`            | `design-system`  | E1-T2 — raíz y subpath |
| `Role`                     | `auth-rbac`      | E1-T3 — raíz y subpath |
| `SessionUser`              | `auth-rbac`      | E1-T3 — raíz y subpath |
| `Sede`                     | `multi-location` | E1-T4 — raíz y subpath |
| `CreateSedeInput`          | `multi-location` | E1-T4 — raíz y subpath |
| `UpdateSedeInput`          | `multi-location` | E1-T4 — raíz y subpath |
| `SedeChildBlocker`         | `multi-location` | E1-T4 — raíz y subpath |
| `Cita`                     | `scheduling`     | E1-T5 — raíz y subpath |
| `CitaStatus`               | `scheduling`     | E1-T5 — raíz y subpath |
| `CitaSource`               | `scheduling`     | E1-T5 — raíz y subpath |
| `CreateCitaInput`          | `scheduling`     | E1-T5 — raíz y subpath |
| `UpdateCitaInput`          | `scheduling`     | E1-T5 — raíz y subpath |
| `CalendlyEmbedProps`       | `scheduling`     | E1-T5 — raíz y subpath |
| `NextAppointmentCardProps` | `client-portal`  | E1-T6 — raíz y subpath |
| `NotificationListProps`    | `client-portal`  | E1-T6 — raíz y subpath |
| `PortalNotification`       | `client-portal`  | E1-T6 — raíz y subpath |
| `Especialista`             | `admin-panel`    | E2-T1 — raíz y subpath |
| `CreateEspecialistaInput`  | `admin-panel`    | E2-T1 — raíz y subpath |
| `UpdateEspecialistaInput`  | `admin-panel`    | E2-T1 — raíz y subpath |
| `DashboardProps`           | `admin-panel`    | E2-T1 — raíz y subpath |
| `CitasTableProps`          | `admin-panel`    | E2-T1 — raíz y subpath |
| `EspecialistasCrudProps`   | `admin-panel`    | E2-T1 — raíz y subpath |
| `SedesCrudProps`           | `admin-panel`    | E2-T1 — raíz y subpath |
