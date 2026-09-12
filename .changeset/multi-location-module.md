---
"@mgorrin/web-kit": minor
---

Añade el módulo `multi-location`: CRUD de `Sede` (`createSede`, `getSede`, `listSedes`,
`updateSede`, `deleteSede`) con la primera Sede marcada `isDefault: true` automáticamente, y
`deleteSede` rechazado con `SedeDeletionConflictError` (`code: "CONFLICT"`) mientras existan
`especialistas`/`citas`/`productos` activos ligados a esa sede.
