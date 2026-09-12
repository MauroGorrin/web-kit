---
"@mgorrin/web-kit": minor
---

Corrige los hallazgos críticos/altos/medios del reporte de seguridad Cyber Neo:

- `firestore.rules`: la lectura de `citas` ya no es `if isSignedIn()` — ahora exige ser el dueño
  (`clientUid`) o admin, igual que `update`/`delete`. `create` valida que `status` sea `"scheduled"`
  y que `clientUid` no pueda suplantar a otro usuario.
- `ecommerce`: nuevo `getProductoById` — usado por `apps/template/src/app/api/checkout/route.ts`
  para resolver `name`/`priceCents` server-side desde Firestore en vez de confiar en lo que mande el
  cliente (el checkout aceptaba cualquier precio).
- `notifications`: `renderAppointmentEmail` escapa HTML en `clienteName`/`sedeName` antes de
  templatear — evita inyección de markup en el email transaccional vía el `displayName` de Google.
- `seo-analytics`: nuevo `toJsonLdScript` — escapa `<` antes de inyectar JSON-LD en un
  `<script>`, para que un valor con `</script>` no rompa el bloque.

No hay breaking changes en la superficie pública existente — solo exports nuevos y un
endurecimiento de reglas que ninguna ruta actual de `apps/template` violaba (confirmado con
`pnpm test`, `pnpm test:rules` y `pnpm test:e2e`).
