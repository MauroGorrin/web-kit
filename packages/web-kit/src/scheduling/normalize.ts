// Lógica pura — testeable sin Firestore. `repository.ts` la usa antes de
// escribir; una Cita nueva SIEMPRE nace `status: "scheduled"` (default del
// modelo de datos, blueprint §8), nunca lo que el caller haya pasado.
import type { CreateCitaInput } from "./types.ts";

export interface NormalizedCita {
  clientUid: string | null;
  sedeId: string;
  especialistaId: string | null;
  datetime: Date;
  source: CreateCitaInput["source"];
  notes: string;
  status: "scheduled";
}

export function normalizeCreateCitaInput(input: CreateCitaInput): NormalizedCita {
  return {
    clientUid: input.clientUid ?? null,
    sedeId: input.sedeId,
    especialistaId: input.especialistaId ?? null,
    datetime: input.datetime,
    source: input.source,
    notes: input.notes ?? "",
    status: "scheduled",
  };
}
