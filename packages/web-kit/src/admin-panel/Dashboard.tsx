import { Card } from "../design-system/index.ts";
import type { Cita } from "../scheduling/index.ts";

export interface DashboardProps {
  /** Ya filtradas a los próximos 7 días — ver `listCitasBetween` en scheduling. */
  citasProximos7Dias: Cita[];
}

export function Dashboard({ citasProximos7Dias }: DashboardProps) {
  return (
    <Card>
      <p>Citas — próximos 7 días</p>
      <p className="text-3xl font-semibold" data-testid="citas-count">
        {citasProximos7Dias.length}
      </p>
    </Card>
  );
}
