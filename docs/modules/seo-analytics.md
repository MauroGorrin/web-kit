# seo-analytics

Metadata, sitemap/robots, JSON-LD y GA4. Flag: `modulesConfig.seoAnalytics`.

## Exports

| Export                                                                                                | Tipo  | Notas                                                                                                                                                                                                                |
| ----------------------------------------------------------------------------------------------------- | ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `buildMetadata({ title, description })`                                                               | valor | **Lanza `MissingPageMetadataError` si falta `title` o `description`** — toda página del proyecto lo usa en vez de armar un objeto `Metadata` a mano, para que un build con metadata incompleta falle explícitamente. |
| `buildLocalBusinessJsonLd(data)`                                                                      | valor | Genera el bloque JSON-LD `LocalBusiness` (schema.org) — se serializa en un `<script type="application/ld+json">` en la home.                                                                                         |
| `Ga4Script`                                                                                           | valor | Componente cliente — omite el script (no renderiza nada) sin `NEXT_PUBLIC_GA_MEASUREMENT_ID`. Inyección manual (mismo motivo que `CalendlyEmbed`: `next/script` no resuelve desde este paquete).                     |
| `MissingPageMetadataError`                                                                            | valor | —                                                                                                                                                                                                                    |
| `PageMetadata` / `PageMetadataInput` / `LocalBusinessData` / `LocalBusinessJsonLd` / `Ga4ScriptProps` | tipo  | —                                                                                                                                                                                                                    |

## Rutas generadas

`apps/template/src/app/sitemap.ts` y `robots.ts` — el sitemap incluye siempre `/`, `/agenda`,
`/portal`, y condicionalmente `/tienda` (solo si `modulesConfig.ecommerce` está activo).
