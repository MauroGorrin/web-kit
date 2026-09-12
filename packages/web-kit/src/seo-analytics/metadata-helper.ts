// Toda página declara su metadata a través de esta función — nunca un
// objeto `Metadata` armado a mano. `title`/`description` vacíos lanzan aquí,
// en tiempo de build (Next.js evalúa los `export const metadata` de cada
// página durante "Collecting page data"), no en runtime. Ver acceptance #3
// de E2-T4.
export class MissingPageMetadataError extends Error {
  constructor(field: "title" | "description") {
    super(
      `buildMetadata requiere un "${field}" no vacío — toda página declara su metadata vía metadata-helper.`,
    );
    this.name = "MissingPageMetadataError";
  }
}

export interface PageMetadataInput {
  title: string;
  description: string;
}

export interface PageMetadata {
  title: string;
  description: string;
}

export function buildMetadata(input: PageMetadataInput): PageMetadata {
  if (!input.title) throw new MissingPageMetadataError("title");
  if (!input.description) throw new MissingPageMetadataError("description");

  return {
    title: input.title,
    description: input.description,
  };
}
