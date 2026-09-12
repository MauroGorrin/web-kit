import { CalendlyEmbed, buildMetadata } from "@mgorrin/web-kit";

export const metadata = buildMetadata({
  title: "Agenda tu cita",
  description: "Reserva tu cita en línea con nuestro calendario.",
});

export default function AgendaPage() {
  return (
    <main className="flex min-h-screen flex-col items-center gap-6 p-8">
      <h1 className="text-2xl font-semibold">Agenda tu cita</h1>
      <CalendlyEmbed />
    </main>
  );
}
