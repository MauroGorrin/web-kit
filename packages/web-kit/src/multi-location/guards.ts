// Lógica pura del módulo — sin Firestore, así que es testeable sin mocks ni
// emulador. `repository.ts` hace las consultas reales y delega la decisión
// aquí.
import { SedeDeletionConflictError, type SedeChildBlocker } from "./errors.ts";

/** La primera Sede de un proyecto siempre nace `isDefault: true`. */
export function isFirstSede(existingCount: number): boolean {
  return existingCount === 0;
}

/**
 * Lanza `SedeDeletionConflictError` si algún hijo (`especialistas`, `citas`,
 * `productos` con esa `sedeId`) sigue activo. Ver blueprint §8, relación
 * Sede→Especialista/Cita/Producto.
 */
export function assertNoActiveChildren(blockers: readonly SedeChildBlocker[]): void {
  const active = blockers.filter((b) => b.count > 0);
  if (active.length > 0) {
    throw new SedeDeletionConflictError(active);
  }
}
