import { CalendlyEmbed, buildMetadata } from "@mgorrin/web-kit";

export const metadata = buildMetadata({
  title: "Reservá tu evaluación gratuita — Vitalis Capilar",
  description:
    "Agendá tu evaluación capilar gratuita en línea. Sin compromiso, con un/a especialista en injerto capilar.",
});

export default function AgendaPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 p-8">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-[var(--color-primary)]">
          Reservá tu evaluación gratuita
        </h1>
        <p className="mt-2 opacity-70">
          Una charla de 30 minutos, presencial o por videollamada, para revisar tu zona donante, tu
          tipo de calvicie y qué técnica se ajusta mejor a tu caso — sin costo ni compromiso.
        </p>
      </div>

      <CalendlyEmbed className="mx-auto" />

      {!process.env.NEXT_PUBLIC_CALENDLY_URL ? (
        <p className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center opacity-70">
          El calendario en línea todavía no está conectado en este ambiente de ejemplo. Mientras
          tanto, escribinos a <strong>hola@vitaliscapilar.com.ar</strong> o llamanos al{" "}
          <strong>+54 11 4000-0000</strong> para coordinar tu evaluación.
        </p>
      ) : null}
    </main>
  );
}
