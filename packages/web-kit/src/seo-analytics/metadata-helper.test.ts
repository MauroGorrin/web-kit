import { describe, expect, it } from "vitest";
import { buildMetadata, MissingPageMetadataError } from "./metadata-helper.ts";

describe("buildMetadata", () => {
  it("retorna la metadata cuando title y description están presentes", () => {
    expect(buildMetadata({ title: "Home", description: "La página principal" })).toEqual({
      title: "Home",
      description: "La página principal",
    });
  });

  it("lanza MissingPageMetadataError si falta el title", () => {
    expect(() => buildMetadata({ title: "", description: "algo" })).toThrow(
      MissingPageMetadataError,
    );
  });

  it("lanza MissingPageMetadataError si falta la description", () => {
    expect(() => buildMetadata({ title: "algo", description: "" })).toThrow(
      MissingPageMetadataError,
    );
  });
});
