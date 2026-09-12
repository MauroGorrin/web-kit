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

export function renderAppointmentEmail(
  template: AppointmentEmailTemplate,
  data: AppointmentEmailData,
): RenderedEmail {
  const fecha = data.datetime.toLocaleString();

  if (template === "confirmada") {
    return {
      subject: `Tu cita en ${data.sedeName} está confirmada`,
      html: `<p>Hola ${data.clienteName},</p><p>Tu cita en <strong>${data.sedeName}</strong> el ${fecha} fue confirmada.</p>`,
    };
  }

  return {
    subject: `Tu cita en ${data.sedeName} fue cancelada`,
    html: `<p>Hola ${data.clienteName},</p><p>Tu cita en <strong>${data.sedeName}</strong> el ${fecha} fue cancelada.</p>`,
  };
}
