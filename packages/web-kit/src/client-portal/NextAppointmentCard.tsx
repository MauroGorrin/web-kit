import { Card } from "../design-system/index.ts";
import type { Cita } from "../scheduling/index.ts";

// NUNCA agregar aquí un campo de dato clínico (diagnóstico, foto, nota
// médica) — ver CLAUDE.md, regla de código #7. Solo cita, estado y datos de
// cuenta.
export interface NextAppointmentCardProps {
  cita: Cita | null;
}

const STATUS_LABEL: Record<Cita["status"], string> = {
  scheduled: "Programada",
  confirmed: "Confirmada",
  cancelled: "Cancelada",
  completed: "Completada",
};

export function NextAppointmentCard({ cita }: NextAppointmentCardProps) {
  if (!cita) {
    return (
      <Card>
        <p>No tienes citas programadas</p>
        <a href="/agenda">Agendar una cita</a>
      </Card>
    );
  }

  return (
    <Card>
      <p>{cita.datetime.toLocaleDateString()}</p>
      <p>{cita.datetime.toLocaleTimeString()}</p>
      <p>{STATUS_LABEL[cita.status]}</p>
    </Card>
  );
}
