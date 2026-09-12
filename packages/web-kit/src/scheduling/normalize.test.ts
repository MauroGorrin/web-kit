import { describe, expect, it } from "vitest";
import { normalizeCreateCitaInput } from "./normalize.ts";

describe("normalizeCreateCitaInput", () => {
  it("siempre fuerza status a scheduled", () => {
    const result = normalizeCreateCitaInput({
      sedeId: "sede-1",
      datetime: new Date("2026-10-01T15:00:00Z"),
      source: "calendly",
    });
    expect(result.status).toBe("scheduled");
  });

  it("defaultea clientUid y especialistaId a null cuando se omiten", () => {
    const result = normalizeCreateCitaInput({
      sedeId: "sede-1",
      datetime: new Date("2026-10-01T15:00:00Z"),
      source: "manual",
    });
    expect(result.clientUid).toBeNull();
    expect(result.especialistaId).toBeNull();
  });

  it("acepta clientUid: null explícito — cliente sin cuenta agendado por el admin", () => {
    const result = normalizeCreateCitaInput({
      sedeId: "sede-1",
      clientUid: null,
      datetime: new Date("2026-10-01T15:00:00Z"),
      source: "manual",
    });
    expect(result.clientUid).toBeNull();
  });

  it("defaultea notes a string vacío", () => {
    const result = normalizeCreateCitaInput({
      sedeId: "sede-1",
      datetime: new Date("2026-10-01T15:00:00Z"),
      source: "calendly",
    });
    expect(result.notes).toBe("");
  });

  it("preserva los valores explícitos pasados", () => {
    const result = normalizeCreateCitaInput({
      sedeId: "sede-1",
      clientUid: "uid-1",
      especialistaId: "esp-1",
      datetime: new Date("2026-10-01T15:00:00Z"),
      source: "manual",
      notes: "primera visita",
    });
    expect(result).toMatchObject({
      clientUid: "uid-1",
      especialistaId: "esp-1",
      source: "manual",
      notes: "primera visita",
    });
  });
});
