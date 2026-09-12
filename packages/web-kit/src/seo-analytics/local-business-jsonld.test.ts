import { describe, expect, it } from "vitest";
import { buildLocalBusinessJsonLd, toJsonLdScript } from "./local-business-jsonld.ts";

describe("buildLocalBusinessJsonLd", () => {
  it("genera un bloque LocalBusiness válido con los campos mínimos", () => {
    const jsonld = buildLocalBusinessJsonLd({ name: "Mi Negocio", address: "Calle 1" });
    expect(jsonld["@context"]).toBe("https://schema.org");
    expect(jsonld["@type"]).toBe("LocalBusiness");
    expect(jsonld.name).toBe("Mi Negocio");
    expect(jsonld.address).toBe("Calle 1");
  });

  it("incluye telephone/url solo cuando se pasan", () => {
    const jsonld = buildLocalBusinessJsonLd({ name: "Mi Negocio", address: "Calle 1" });
    expect(jsonld.telephone).toBeUndefined();

    const withPhone = buildLocalBusinessJsonLd({
      name: "Mi Negocio",
      address: "Calle 1",
      telephone: "555-0000",
    });
    expect(withPhone.telephone).toBe("555-0000");
  });
});

describe("toJsonLdScript", () => {
  it("escapa '<' para que un valor con </script> no rompa el bloque — CN-021", () => {
    const jsonld = buildLocalBusinessJsonLd({
      name: "Mi Negocio</script><script>alert(1)</script>",
      address: "Calle 1",
    });
    const serialized = toJsonLdScript(jsonld);
    expect(serialized).not.toContain("</script>");
    expect(serialized).toContain("\\u003c/script>");
  });
});
