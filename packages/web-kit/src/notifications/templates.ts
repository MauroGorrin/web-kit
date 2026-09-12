// Lógica pura — sin `server-only`, testeable directamente. Genera el
// asunto/cuerpo de cada template; `send-appointment-email.ts` es quien
// realmente llama a Resend.
export type AppointmentEmailTemplate = "confirmada" | "cancelada";

export interface AppointmentEmailData {
  clienteName: string;
  sedeName: string;
  datetime: Date;
}

export interface RenderedEmail {
  subject: string;
  html: string;
}

// `clienteName` viene del `displayName` de la cuenta de Google del usuario
// (ver `create-session.server.ts`) — no es texto de confianza. Sin este
// escape, alguien podría setear su nombre de perfil a markup HTML y
// hacer phishing/inyección en el email transaccional (ver CN-014 del
// reporte Cyber Neo).
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function renderAppointmentEmail(
  template: AppointmentEmailTemplate,
  data: AppointmentEmailData,
): RenderedEmail {
  const clienteName = escapeHtml(data.clienteName);
  const sedeName = escapeHtml(data.sedeName);
  const fecha = data.datetime.toLocaleString();

  if (template === "confirmada") {
    return {
      subject: `Tu cita en ${data.sedeName} está confirmada`,
      html: `<p>Hola ${clienteName},</p><p>Tu cita en <strong>${sedeName}</strong> el ${fecha} fue confirmada.</p>`,
    };
  }

  return {
    subject: `Tu cita en ${data.sedeName} fue cancelada`,
    html: `<p>Hola ${clienteName},</p><p>Tu cita en <strong>${sedeName}</strong> el ${fecha} fue cancelada.</p>`,
  };
}
