---
"@mgorrin/web-kit": minor
---

Añade el módulo `scheduling`: CRUD de `Cita` (`createCita`, `getCita`, `updateCita`, siempre
`status: "scheduled"` al crear) y `CalendlyEmbed`. Añade las rutas `POST /api/citas` y
`PATCH /api/citas/[id]` en `apps/template`, con validación de sesión/rol en el borde y `404`
tipado cuando la Sede referenciada no existe.
