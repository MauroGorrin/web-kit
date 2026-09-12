// Allowlist del módulo notifications — no un barrel.
export type { AppointmentEmailData, AppointmentEmailTemplate, RenderedEmail } from "./templates.ts";
export { renderAppointmentEmail } from "./templates.ts";
export { MissingResendApiKeyError } from "./resend-credentials.ts";
export { sendAppointmentEmail, type SendAppointmentEmailInput } from "./send-appointment-email.ts";
