import { describe, expect, it } from "vitest";
import { UnmappedLeadStatusError } from "./errors.ts";
import { mapStatusToStage } from "./stage-mapping.ts";

describe("mapStatusToStage", () => {
  it('mapea "new" a la etapa "lead" de HubSpot', () => {
    expect(mapStatusToStage("new")).toBe("lead");
  });

  it("lanza UnmappedLeadStatusError tipado para un status sin mapeo, en vez de sincronizar un valor arbitrario", () => {
    for (const status of ["contacted", "scheduled", "client"] as const) {
      expect(() => mapStatusToStage(status)).toThrow(UnmappedLeadStatusError);
      try {
        mapStatusToStage(status);
      } catch (error) {
        expect((error as UnmappedLeadStatusError).code).toBe("UNMAPPED_STATUS");
      }
    }
  });
});
