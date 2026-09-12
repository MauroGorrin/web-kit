import { describe, expect, it } from "vitest";
import { SedeDeletionConflictError } from "./errors.ts";
import { assertNoActiveChildren, isFirstSede } from "./guards.ts";

describe("isFirstSede", () => {
  it("es true cuando no hay ninguna Sede todavía", () => {
    expect(isFirstSede(0)).toBe(true);
  });

  it("es false cuando ya existe al menos una Sede", () => {
    expect(isFirstSede(1)).toBe(false);
    expect(isFirstSede(5)).toBe(false);
  });
});

describe("assertNoActiveChildren", () => {
  it("no lanza cuando todos los contadores están en cero", () => {
    expect(() =>
      assertNoActiveChildren([
        { collection: "especialistas", count: 0 },
        { collection: "citas", count: 0 },
        { collection: "productos", count: 0 },
      ]),
    ).not.toThrow();
  });

  it("lanza SedeDeletionConflictError tipado con code CONFLICT cuando hay un Especialista activo", () => {
    try {
      assertNoActiveChildren([
        { collection: "especialistas", count: 1 },
        { collection: "citas", count: 0 },
        { collection: "productos", count: 0 },
      ]);
      expect.unreachable("debía lanzar");
    } catch (error) {
      expect(error).toBeInstanceOf(SedeDeletionConflictError);
      expect((error as SedeDeletionConflictError).code).toBe("CONFLICT");
      expect((error as SedeDeletionConflictError).blockers).toEqual([
        { collection: "especialistas", count: 1 },
      ]);
    }
  });

  it("solo reporta los bloqueadores con conteo mayor a cero", () => {
    try {
      assertNoActiveChildren([
        { collection: "especialistas", count: 0 },
        { collection: "citas", count: 2 },
        { collection: "productos", count: 3 },
      ]);
      expect.unreachable("debía lanzar");
    } catch (error) {
      expect((error as SedeDeletionConflictError).blockers).toEqual([
        { collection: "citas", count: 2 },
        { collection: "productos", count: 3 },
      ]);
    }
  });
});
