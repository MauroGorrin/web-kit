import { CalendarClock, Mail, Phone } from "lucide-react";
import { CalendlyEmbed, buildMetadata } from "@mgorrin/web-kit";

export const metadata = buildMetadata({
  title: "Reserva tu evaluación gratuita — Vitalis Capilar",
  description:
    "Agenda tu evaluación capilar gratuita en línea. Sin compromiso, con un especialista en injerto capilar.",
});

export default function AgendaPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 p-8">
      <div className="text-center">
        <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)]/10 px-4 py-1 text-sm font-semibold text-[var(--color-primary)]">
          <CalendarClock size={16} />
          Evaluación gratuita — 30 minutos
        </span>
        <h1 className="text-2xl font-semibold text-[var(--color-primary)] sm:text-3xl">
          Reserva tu evaluación gratuita
        </h1>
        <p className="mx-auto mt-2 max-w-xl opacity-70">
          Una charla de 30 minutos, presencial o por videollamada, para revisar la zona donante, el
          tipo de calvicie y qué técnica se ajusta mejor a cada caso — sin costo ni compromiso.
        </p>
      </div>

      <CalendlyEmbed className="mx-auto" />

      {!process.env.NEXT_PUBLIC_CALENDLY_URL ? (
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center">
          <p className="mb-4 opacity-70">
            El calendario en línea todavía no está conectado en este ambiente de ejemplo. Mientras
            tanto, este es el canal de contacto directo:
          </p>
          <div className="flex flex-col items-center gap-2 text-[var(--color-primary)]">
            <p className="flex items-center gap-2 font-semibold">
              <Phone size={16} /> +54 11 4000-0000
            </p>
            <p className="flex items-center gap-2 font-semibold">
              <Mail size={16} /> hola@vitaliscapilar.com.ar
            </p>
          </div>
        </div>
      ) : null}
    </main>
  );
}
