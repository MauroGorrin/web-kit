# Superficie pública de `@mgorrin/web-kit`

> Este documento es la fuente de verdad legible por humanos de lo que exporta
> `packages/web-kit/src/index.ts` (raíz del paquete, `@mgorrin/web-kit`) y cada subpath de módulo
> (`@mgorrin/web-kit/<módulo>`). Cada símbolo listado abajo debe existir, verbatim, en la allowlist
> correspondiente. Ambas listas se actualizan juntas, nunca por separado.
>
> **Congelada desde E1-T2.** Cualquier export nuevo pasa por `.claude/skills/add-a-module`.
>
> **"Solo subpath, server-only":** el barrel raíz (`@mgorrin/web-kit`) deliberadamente NO reexporta
> estos — solo lo client-safe de cada módulo. Estos símbolos usan el SDK admin (o sostienen una API
> key de servidor) porque sus únicos llamadores son Route Handlers/Server Components; el SDK cliente
> ahí nunca queda autenticado como el usuario del request, así que `firestore.rules` siempre le
> negaría el paso — la autorización real la hace el caller en código. Reexportar aunque sea un solo
> nombre desde el barrel del módulo forzaría a evaluar ese import (y su comprobación de credenciales,
> donde aplica) en cualquier página que solo quiera un `<Button>` — confirmado por ejecución real
> durante E1-T3 y el retrofit de E2-T2. Solo alcanzables vía `@mgorrin/web-kit/<módulo>`.

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
| `CalendlyEmbed`                        | `scheduling`     | E1-T5 — raíz y subpath                |
| `createCita`                           | `scheduling`     | E1-T5 — **solo subpath**, server-only |
| `getCita`                              | `scheduling`     | E1-T5 — **solo subpath**, server-only |
| `updateCita`                           | `scheduling`     | E1-T5 — **solo subpath**, server-only |
| `listUpcomingCitasForClient`           | `scheduling`     | E1-T6 — **solo subpath**, server-only |
| `NextAppointmentCard`                  | `client-portal`  | E1-T6 — raíz y subpath                |
| `NotificationList`                     | `client-portal`  | E1-T6 — raíz y subpath                |
| `listCitasBetween`                     | `scheduling`     | E2-T1 — **solo subpath**, server-only |
| `createEspecialista`                   | `admin-panel`    | E2-T1 — raíz y subpath                |
| `deleteEspecialista`                   | `admin-panel`    | E2-T1 — raíz y subpath                |
| `listEspecialistas`                    | `admin-panel`    | E2-T1 — raíz y subpath                |
| `updateEspecialista`                   | `admin-panel`    | E2-T1 — raíz y subpath                |
| `Dashboard`                            | `admin-panel`    | E2-T1 — raíz y subpath                |
| `CitasTable`                           | `admin-panel`    | E2-T1 — raíz y subpath                |
| `EspecialistasCrud`                    | `admin-panel`    | E2-T1 — raíz y subpath                |
| `SedesCrud`                            | `admin-panel`    | E2-T1 — raíz y subpath                |
| `HubspotAdapter`                       | `crm`            | E2-T2 — **solo subpath**, server-only |
| `createOrUpdateLead`                   | `crm`            | E2-T2 — **solo subpath**, server-only |
| `markLeadScheduledByEmail`             | `crm`            | E2-T2 — **solo subpath**, server-only |
| `UnmappedLeadStatusError`              | `crm`            | E2-T2 — raíz y subpath                |
| `renderAppointmentEmail`               | `notifications`  | E2-T3 — raíz y subpath                |
| `MissingResendApiKeyError`             | `notifications`  | E2-T3 — raíz y subpath                |
| `sendAppointmentEmail`                 | `notifications`  | E2-T3 — **solo subpath**, server-only |
| `buildMetadata`                        | `seo-analytics`  | E2-T4 — raíz y subpath                |
| `buildLocalBusinessJsonLd`             | `seo-analytics`  | E2-T4 — raíz y subpath                |
| `Ga4Script`                            | `seo-analytics`  | E2-T4 — raíz y subpath                |
| `MissingStripeSecretKeyError`          | `payments`       | E2-T5 — raíz y subpath                |
| `MissingStripeWebhookSecretError`      | `payments`       | E2-T5 — raíz y subpath                |
| `StripeProvider`                       | `payments`       | E2-T5 — **solo subpath**, server-only |
| `recordCheckoutSessionCompleted`       | `payments`       | E2-T5 — **solo subpath**, server-only |

## Exports de tipo

| Export                       | Módulo           | Desde                    |
| ---------------------------- | ---------------- | ------------------------ |
| `ButtonVariant`              | `design-system`  | E1-T2 — raíz y subpath   |
| `Role`                       | `auth-rbac`      | E1-T3 — raíz y subpath   |
| `SessionUser`                | `auth-rbac`      | E1-T3 — raíz y subpath   |
| `Sede`                       | `multi-location` | E1-T4 — raíz y subpath   |
| `CreateSedeInput`            | `multi-location` | E1-T4 — raíz y subpath   |
| `UpdateSedeInput`            | `multi-location` | E1-T4 — raíz y subpath   |
| `SedeChildBlocker`           | `multi-location` | E1-T4 — raíz y subpath   |
| `Cita`                       | `scheduling`     | E1-T5 — raíz y subpath   |
| `CitaStatus`                 | `scheduling`     | E1-T5 — raíz y subpath   |
| `CitaSource`                 | `scheduling`     | E1-T5 — raíz y subpath   |
| `CreateCitaInput`            | `scheduling`     | E1-T5 — raíz y subpath   |
| `UpdateCitaInput`            | `scheduling`     | E1-T5 — raíz y subpath   |
| `CalendlyEmbedProps`         | `scheduling`     | E1-T5 — raíz y subpath   |
| `NextAppointmentCardProps`   | `client-portal`  | E1-T6 — raíz y subpath   |
| `NotificationListProps`      | `client-portal`  | E1-T6 — raíz y subpath   |
| `PortalNotification`         | `client-portal`  | E1-T6 — raíz y subpath   |
| `Especialista`               | `admin-panel`    | E2-T1 — raíz y subpath   |
| `CreateEspecialistaInput`    | `admin-panel`    | E2-T1 — raíz y subpath   |
| `UpdateEspecialistaInput`    | `admin-panel`    | E2-T1 — raíz y subpath   |
| `DashboardProps`             | `admin-panel`    | E2-T1 — raíz y subpath   |
| `CitasTableProps`            | `admin-panel`    | E2-T1 — raíz y subpath   |
| `EspecialistasCrudProps`     | `admin-panel`    | E2-T1 — raíz y subpath   |
| `SedesCrudProps`             | `admin-panel`    | E2-T1 — raíz y subpath   |
| `CrmAdapter`                 | `crm`            | E2-T2 — raíz y subpath   |
| `Lead`                       | `crm`            | E2-T2 — raíz y subpath   |
| `LeadInteraction`            | `crm`            | E2-T2 — raíz y subpath   |
| `LeadStatus`                 | `crm`            | E2-T2 — raíz y subpath   |
| `CreateLeadInput`            | `crm`            | E2-T2 — raíz y subpath   |
| `CreateOrUpdateLeadOptions`  | `crm`            | E2-T2 — **solo subpath** |
| `AppointmentEmailTemplate`   | `notifications`  | E2-T3 — raíz y subpath   |
| `AppointmentEmailData`       | `notifications`  | E2-T3 — raíz y subpath   |
| `RenderedEmail`              | `notifications`  | E2-T3 — raíz y subpath   |
| `SendAppointmentEmailInput`  | `notifications`  | E2-T3 — **solo subpath** |
| `MissingPageMetadataError`   | `seo-analytics`  | E2-T4 — raíz y subpath   |
| `PageMetadata`               | `seo-analytics`  | E2-T4 — raíz y subpath   |
| `PageMetadataInput`          | `seo-analytics`  | E2-T4 — raíz y subpath   |
| `LocalBusinessData`          | `seo-analytics`  | E2-T4 — raíz y subpath   |
| `LocalBusinessJsonLd`        | `seo-analytics`  | E2-T4 — raíz y subpath   |
| `Ga4ScriptProps`             | `seo-analytics`  | E2-T4 — raíz y subpath   |
| `CheckoutLineItem`           | `payments`       | E2-T5 — raíz y subpath   |
| `CheckoutSession`            | `payments`       | E2-T5 — raíz y subpath   |
| `CreateCheckoutSessionInput` | `payments`       | E2-T5 — raíz y subpath   |
| `PaymentProvider`            | `payments`       | E2-T5 — raíz y subpath   |
