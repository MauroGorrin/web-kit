import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CitasTable } from "./CitasTable.tsx";
import type { Sede } from "../multi-location/index.ts";

function makeSede(id: string, name: string): Sede {
  return { id, name, address: "", hours: "", contact: "", isDefault: id === "sede-1" };
}

describe("CitasTable", () => {
  it("oculta el selector de sede y preselecciona la única Sede cuando solo hay una", () => {
    render(<CitasTable citas={[]} sedes={[makeSede("sede-1", "Sede Centro")]} />);
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(screen.getByDisplayValue("sede-1")).toBeInTheDocument();
  });

  it("muestra el selector de sede cuando hay más de una", () => {
    render(
      <CitasTable
        citas={[]}
        sedes={[makeSede("sede-1", "Sede Centro"), makeSede("sede-2", "Sede Norte")]}
      />,
    );
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });
});
