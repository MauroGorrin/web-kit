import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Dashboard } from "./Dashboard.tsx";
import type { Cita } from "../scheduling/index.ts";

function makeCita(id: string): Cita {
  return {
    id,
    clientUid: null,
    sedeId: "sede-1",
    especialistaId: null,
    datetime: new Date("2026-10-05T10:00:00Z"),
    status: "scheduled",
    source: "manual",
    notes: "",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

describe("Dashboard", () => {
  it("muestra el conteo de citas de los próximos 7 días", () => {
    render(<Dashboard citasProximos7Dias={[makeCita("1"), makeCita("2"), makeCita("3")]} />);
    expect(screen.getByTestId("citas-count")).toHaveTextContent("3");
  });

  it("muestra 0 cuando no hay citas en los próximos 7 días", () => {
    render(<Dashboard citasProximos7Dias={[]} />);
    expect(screen.getByTestId("citas-count")).toHaveTextContent("0");
  });
});
