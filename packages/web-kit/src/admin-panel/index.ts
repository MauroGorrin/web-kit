// Allowlist del módulo admin-panel — no un barrel.
export type { CreateEspecialistaInput, Especialista, UpdateEspecialistaInput } from "./types.ts";
export {
  createEspecialista,
  deleteEspecialista,
  listEspecialistas,
  updateEspecialista,
} from "./especialistas-repository.ts";
export { Dashboard, type DashboardProps } from "./Dashboard.tsx";
export { CitasTable, type CitasTableProps } from "./CitasTable.tsx";
export { EspecialistasCrud, type EspecialistasCrudProps } from "./EspecialistasCrud.tsx";
export { SedesCrud, type SedesCrudProps } from "./SedesCrud.tsx";
