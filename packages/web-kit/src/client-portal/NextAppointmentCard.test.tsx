import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextAppointmentCard } from "./NextAppointmentCard.tsx";
import type { Cita } from "../scheduling/index.ts";

const CITA: Cita = {
  id: "cita-1",
  clientUid: "cliente-uid",
  sedeId: "sede-1",
  especialistaId: null,
  datetime: new Date("2026-10-01T15:00:00Z"),
  status: "confirmed",
  source: "manual",
  notes: "",
  createdAt: new Date("2026-09-01T00:00:00Z"),
  updatedAt: new Date("2026-09-01T00:00:00Z"),
};

describe("NextAppointmentCard", () => {
  it("muestra fecha, hora y estado cuando hay una Cita futura", () => {
    render(<NextAppointmentCard cita={CITA} />);
    expect(screen.getByText(CITA.datetime.toLocaleDateString())).toBeInTheDocument();
    expect(screen.getByText(CITA.datetime.toLocaleTimeString())).toBeInTheDocument();
    expect(screen.getByText("Confirmada")).toBeInTheDocument();
  });

  it('muestra el estado vacío "No tienes citas programadas" con un enlace a /agenda', () => {
    render(<NextAppointmentCard cita={null} />);
    expect(screen.getByText("No tienes citas programadas")).toBeInTheDocument();
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/agenda");
  });

  it("nunca renderiza ningún campo de dato clínico", () => {
    render(<NextAppointmentCard cita={CITA} />);
    const html = document.body.innerHTML.toLowerCase();
    for (const clinicalWord of [
      "diagnóstico",
      "diagnostico",
      "historial",
      "receta",
      "tratamiento",
    ]) {
      expect(html).not.toContain(clinicalWord);
    }
  });
});
