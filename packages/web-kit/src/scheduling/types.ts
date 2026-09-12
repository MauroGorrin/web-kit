// Ver blueprint §8 (modelo de datos) — colección `citas`.
export type CitaStatus = "scheduled" | "confirmed" | "cancelled" | "completed";
export type CitaSource = "calendly" | "manual";

export interface Cita {
  id: string;
  clientUid: string | null;
  sedeId: string;
  especialistaId: string | null;
  datetime: Date;
  status: CitaStatus;
  source: CitaSource;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCitaInput {
  clientUid?: string | null;
  sedeId: string;
  especialistaId?: string | null;
  datetime: Date;
  source: CitaSource;
  notes?: string;
}

export interface UpdateCitaInput {
  status?: CitaStatus;
  especialistaId?: string | null;
  datetime?: Date;
  notes?: string;
}
