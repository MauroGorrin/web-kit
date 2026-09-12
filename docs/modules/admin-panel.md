# admin-panel

Dashboard y CRUD de citas/especialistas/sedes para el admin. Flag: `modulesConfig.adminPanel`.

## Exports

| Export                                                                                   | Tipo  | Notas                                                                                                                                                                                                                       |
| ---------------------------------------------------------------------------------------- | ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Dashboard`                                                                              | valor | Conteo de citas de los próximos 7 días.                                                                                                                                                                                     |
| `CitasTable`                                                                             | valor | Lista citas y las crea vía `fetch("/api/citas")` — **nunca escribe Firestore directo**, reutiliza el mismo Route Handler que `scheduling` (E1-T5). Oculta el selector de Sede y preselecciona la única cuando solo hay una. |
| `SedesCrud`                                                                              | valor | CRUD de `Sede` (client-side, vía `multi-location`). Captura `SedeDeletionConflictError` y la muestra como mensaje.                                                                                                          |
| `EspecialistasCrud`                                                                      | valor | CRUD de `Especialista` — este módulo es el único escritor de la colección `especialistas` (ningún otro módulo la reclama).                                                                                                  |
| `createEspecialista` / `updateEspecialista` / `deleteEspecialista` / `listEspecialistas` | valor | Repositorio de `especialistas`, SDK cliente (llamado desde componentes `"use client"`).                                                                                                                                     |
| `Especialista` / `CreateEspecialistaInput` / `UpdateEspecialistaInput`                   | tipo  | `{ id, name, sedeId, active }`.                                                                                                                                                                                             |
| `DashboardProps` / `CitasTableProps` / `EspecialistasCrudProps` / `SedesCrudProps`       | tipo  | —                                                                                                                                                                                                                           |

## Rutas

`/admin` (dashboard), `/admin/citas`, `/admin/especialistas`, `/admin/sedes` — todas protegidas por
`apps/template/src/app/admin/layout.tsx` (sin sesión → `/`; rol `specialist` → `/portal`). La nav
(`apps/template/src/components/nav/AdminNav.tsx`) lee `modules.config.ts` para decidir qué enlaces
mostrar.

## Reglas de Firestore (`especialistas`)

```
match /especialistas/{especialistaId} {
  allow read: if true;
  allow write: if isAdminOrAbove();
}
```
