# multi-location

Sedes físicas del negocio (colección `sedes`). Flag: `modulesConfig.multiLocation`.

## Exports

| Export                                | Tipo       | Notas                                                                                                                                                                                              |
| ------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `createSede`                          | valor      | La primera Sede de un proyecto se marca `isDefault: true` automáticamente. Al crear una nueva con `isDefault: true` explícito, despromueve la anterior (invariante: exactamente una Sede default). |
| `getSede`                             | valor      | Lectura por id.                                                                                                                                                                                    |
| `listSedes`                           | valor      | Lectura de todas.                                                                                                                                                                                  |
| `updateSede`                          | valor      | Update parcial.                                                                                                                                                                                    |
| `deleteSede`                          | valor      | Rechaza con `SedeDeletionConflictError` si hay `especialistas`/`citas` activos o cualquier `producto` ligado a la Sede.                                                                            |
| `Sede`                                | tipo       | `{ id, name, address, hours, contact, isDefault }`.                                                                                                                                                |
| `CreateSedeInput` / `UpdateSedeInput` | tipo       | —                                                                                                                                                                                                  |
| `SedeDeletionConflictError`           | tipo/valor | `error.code === "CONFLICT"`, `error.blockers` lista qué colección bloquea el borrado.                                                                                                              |
| `SedeChildBlocker`                    | tipo       | `{ collection, count }`.                                                                                                                                                                           |

## SDK y autorización

Usa el SDK cliente (`getFirebaseDb`) — sus llamadores son componentes `"use client"`
(`SedesCrud` de `admin-panel`) donde el navegador sí lleva la sesión real, o lecturas públicas desde
Server Components (`firestore.rules`: `allow read: if true` en `sedes`, no requiere sesión). Por eso
NO necesita el SDK admin, a diferencia de `scheduling`/`crm`/`payments`.

## Reglas de Firestore

```
match /sedes/{sedeId} {
  allow read: if true;
  allow write: if isAdminOrAbove();
}
```
