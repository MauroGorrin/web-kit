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
// multi-location, client-portal y admin-panel no tienen efectos secundarios
// al importar (sus repositorios usan el SDK cliente desde componentes
// `"use client"`, o leen colecciones públicas) — seguro de reexportar
// completo.
export * from "./multi-location/index.ts";
export * from "./client-portal/index.ts";
export * from "./admin-panel/index.ts";
// scheduling: su repositorio (`repository.server.ts`) usa el SDK admin —
// TODOS sus llamadores son Route Handlers/Server Components, así que
// `getCita`/`createCita`/`listCitasBetween`/`listUpcomingCitasForClient`/
// `updateCita` viven únicamente en el subpath `@mgorrin/web-kit/scheduling`.
// Solo los tipos y `CalendlyEmbed` (client-safe) van en el barrel raíz.
export type {
  Cita,
  CitaSource,
  CitaStatus,
  CreateCitaInput,
  UpdateCitaInput,
} from "./scheduling/types.ts";
export { CalendlyEmbed, type CalendlyEmbedProps } from "./scheduling/CalendlyEmbed.tsx";
// crm: igual que auth-rbac — `repository.ts`/`hubspot-adapter.ts` importan
// "server-only" (sostienen HUBSPOT_API_KEY). Solo lo puramente de datos
// (types/errors) es seguro en el barrel raíz; el resto vive únicamente en el
// subpath `@mgorrin/web-kit/crm`.
export type {
  CreateLeadInput,
  CrmAdapter,
  Lead,
  LeadInteraction,
  LeadStatus,
} from "./crm/types.ts";
export { UnmappedLeadStatusError } from "./crm/errors.ts";
// notifications: `send-appointment-email.ts` importa "server-only" (sostiene
// RESEND_API_KEY vía resend-client.ts). `templates.ts` es puro — seguro en
// el barrel raíz; `sendAppointmentEmail` solo en el subpath.
export type {
  AppointmentEmailData,
  AppointmentEmailTemplate,
  RenderedEmail,
} from "./notifications/templates.ts";
export { renderAppointmentEmail } from "./notifications/templates.ts";
export { MissingResendApiKeyError } from "./notifications/resend-credentials.ts";
// seo-analytics no tiene efectos secundarios al importar — seguro de
// reexportar completo.
export * from "./seo-analytics/index.ts";
// payments: `stripe-provider.ts`/`repository.server.ts` importan
// "server-only" y sostienen STRIPE_SECRET_KEY/STRIPE_WEBHOOK_SECRET. Solo
// tipos y clases de error en la raíz; `StripeProvider` y
// `recordCheckoutSessionCompleted` solo en el subpath `@mgorrin/web-kit/payments`.
export type {
  CheckoutLineItem,
  CheckoutSession,
  CreateCheckoutSessionInput,
  PaymentProvider,
} from "./payments/types.ts";
export {
  MissingStripeSecretKeyError,
  MissingStripeWebhookSecretError,
} from "./payments/stripe-credentials.ts";
