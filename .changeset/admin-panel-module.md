---
"@mgorrin/web-kit": minor
---

Añade el módulo `admin-panel`: `Dashboard` (conteo de citas próximos 7 días), `CitasTable` (crea
citas reutilizando `POST /api/citas`, oculta el selector de sede con una sola sede), `SedesCrud` y
`EspecialistasCrud` (primer escritor de la colección `especialistas`, con su sección nueva en
`firestore.rules`). Añade `listCitasBetween` a `scheduling`. Añade `/admin`, `/admin/citas`,
`/admin/especialistas` y `/admin/sedes` en `apps/template`, con guard de rol en `layout.tsx`.
