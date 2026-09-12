// Allowlist del módulo seo-analytics — no un barrel.
export {
  buildMetadata,
  MissingPageMetadataError,
  type PageMetadata,
  type PageMetadataInput,
} from "./metadata-helper.ts";
export {
  buildLocalBusinessJsonLd,
  toJsonLdScript,
  type LocalBusinessData,
  type LocalBusinessJsonLd,
} from "./local-business-jsonld.ts";
export { Ga4Script, type Ga4ScriptProps } from "./ga4-script.tsx";
