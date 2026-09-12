// Server-only — usa `resend-client.ts`. El único llamador es
// `apps/template/src/app/api/citas/route.ts`/`[id]/route.ts`.
import "server-only";
import { resend } from "./resend-client.ts";
import { renderAppointmentEmail, type AppointmentEmailTemplate } from "./templates.ts";

export interface SendAppointmentEmailInput {
  template: AppointmentEmailTemplate;
  /** Cliente y/o admin de la Sede — ver acceptance #1 de E2-T3. */
  to: string[];
  clienteName: string;
  sedeName: string;
  datetime: Date;
}

/**
 * Efecto secundario, nunca transaccional — un fallo se registra pero NUNCA
 * se propaga: el caller no debe (ni puede, esta función no relanza) revertir
 * la Cita ya creada/actualizada por esto. Ver acceptance #4 de E2-T3 y
 * CLAUDE.md "El envío de email es un efecto secundario, nunca transaccional".
 */
export async function sendAppointmentEmail(input: SendAppointmentEmailInput): Promise<void> {
  if (input.to.length === 0) return;

  const email = renderAppointmentEmail(input.template, {
    clienteName: input.clienteName,
    sedeName: input.sedeName,
    datetime: input.datetime,
  });

  try {
    await resend.emails.send({
      from: process.env.NOTIFICATIONS_FROM_EMAIL ?? "no-reply@example.com",
      to: input.to,
      subject: email.subject,
      html: email.html,
    });
  } catch (err) {
    console.error("Fallo enviando email de notificación de cita:", err);
  }
}
