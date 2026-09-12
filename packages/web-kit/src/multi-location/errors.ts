export interface SedeChildBlocker {
  collection: string;
  count: number;
}

/**
 * Error tipado — `code` es literal (`"CONFLICT"`), no un string suelto, así
 * un caller puede discriminar `error.code === "CONFLICT"` sin `instanceof`
 * si prefiere trabajar con el objeto serializado (p. ej. across un Route
 * Handler → cliente).
 */
export class SedeDeletionConflictError extends Error {
  readonly code = "CONFLICT" as const;
  readonly blockers: readonly SedeChildBlocker[];

  constructor(blockers: readonly SedeChildBlocker[]) {
    super(
      `No se puede borrar la Sede: tiene registros activos en ${blockers
        .map((b) => `${b.collection} (${b.count})`)
        .join(", ")}.`,
    );
    this.name = "SedeDeletionConflictError";
    this.blockers = blockers;
  }
}
