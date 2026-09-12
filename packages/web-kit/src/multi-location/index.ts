// Allowlist del módulo multi-location — no un barrel.
export type { CreateSedeInput, Sede, UpdateSedeInput } from "./types.ts";
export { SedeDeletionConflictError, type SedeChildBlocker } from "./errors.ts";
export { createSede, deleteSede, getSede, listSedes, updateSede } from "./repository.ts";
