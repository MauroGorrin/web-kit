// Lógica pura, sin `server-only` — separada de `hubspot-adapter.ts` para que
// sea testeable directamente con vitest (mismo motivo que
// `auth-rbac/admin-credentials.ts`: "server-only" lanza incondicionalmente
// fuera del pipeline de build de Next.js).
import { UnmappedLeadStatusError } from "./errors.ts";
import type { LeadStatus } from "./types.ts";

// Solo el mapeo confirmado hoy — ver acceptance #3 de E2-T2. Cualquier status
// fuera de este mapa lanza `UnmappedLeadStatusError` en vez de sincronizar un
// valor arbitrario (acceptance #4); se amplía cuando el negocio confirme la
// etapa de HubSpot correspondiente a cada uno.
const STAGE_MAP: Partial<Record<LeadStatus, string>> = {
  new: "lead",
};

export function mapStatusToStage(status: LeadStatus): string {
  const stage = STAGE_MAP[status];
  if (!stage) throw new UnmappedLeadStatusError(status);
  return stage;
}
