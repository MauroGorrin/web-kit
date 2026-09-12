import { describe, expect, it } from "vitest";
import { renderAppointmentEmail } from "./templates.ts";

const DATA = {
  clienteName: "Ana",
  sedeName: "Sede Centro",
  datetime: new Date("2026-10-01T15:00:00Z"),
};

describe("renderAppointmentEmail", () => {
  it('el template "confirmada" menciona la confirmación', () => {
    const email = renderAppointmentEmail("confirmada", DATA);
    expect(email.subject).toContain("confirmada");
    expect(email.html).toContain("Ana");
    expect(email.html).toContain("Sede Centro");
  });

  it('el template "cancelada" menciona la cancelación', () => {
    const email = renderAppointmentEmail("cancelada", DATA);
    expect(email.subject).toContain("cancelada");
    expect(email.html).toContain("Ana");
  });
});
