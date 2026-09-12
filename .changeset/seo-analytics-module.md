---
"@mgorrin/web-kit": minor
---

Añade el módulo `seo-analytics`: `buildMetadata` (lanza si falta `title`/`description`),
`buildLocalBusinessJsonLd`, y `Ga4Script` (omite el script sin `NEXT_PUBLIC_GA_MEASUREMENT_ID`).
Añade `/sitemap.xml` y `/robots.txt` en `apps/template`. Añade la ruta `/agenda` (embed de Calendly)
que faltaba desde E1-T6 — ahora referenciada tanto por el enlace del estado vacío de `/portal` como
por el sitemap.
