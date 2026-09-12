// Allowlist del módulo scheduling — no un barrel.
export type { Cita, CitaSource, CitaStatus, CreateCitaInput, UpdateCitaInput } from "./types.ts";
// Server-only (SDK admin, ver repository.server.ts) — alcanzable desde el
// subpath del módulo, igual que `auth-rbac`; el barrel raíz del paquete NO
// reexporta estos, solo los tipos y `CalendlyEmbed`.
export {
  createCita,
  getCita,
  listCitasBetween,
  listUpcomingCitasForClient,
  updateCita,
} from "./repository.server.ts";
export { CalendlyEmbed, type CalendlyEmbedProps } from "./CalendlyEmbed.tsx";
