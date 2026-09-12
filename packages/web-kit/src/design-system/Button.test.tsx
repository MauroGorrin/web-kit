import "@testing-library/jest-dom/vitest";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "./Button.tsx";

describe("Button", () => {
  it("aplica la clase de variante primary por defecto", () => {
    render(<Button>Empezar</Button>);
    const button = screen.getByRole("button", { name: "Empezar" });
    expect(button).toHaveClass("wk-btn", "wk-btn--primary", "wk-btn--md");
  });

  it("aplica la clase de la variante pedida", () => {
    render(<Button variant="outline">Cancelar</Button>);
    expect(screen.getByRole("button", { name: "Cancelar" })).toHaveClass("wk-btn--outline");
  });

  it("nunca hardcodea un color inline — solo clases que leen tokens.css", () => {
    render(<Button>Empezar</Button>);
    const button = screen.getByRole("button", { name: "Empezar" });
    expect(button.style.backgroundColor).toBe("");
  });
});
