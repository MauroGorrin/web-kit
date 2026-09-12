# crm

Pipeline de leads + adapter opcional de HubSpot. Flag: `modulesConfig.crm.enabled` (con
`modulesConfig.crm.externalSync` como sub-flag independiente).

## Exports — raíz y subpath

| Export                                                        | Tipo  | Notas                                                                                                                             |
| ------------------------------------------------------------- | ----- | --------------------------------------------------------------------------------------------------------------------------------- |
| `UnmappedLeadStatusError`                                     | valor | Lanzado por `HubspotAdapter` cuando un `LeadStatus` no tiene mapeo a una etapa de HubSpot — nunca sincroniza un valor arbitrario. |
| `CrmAdapter`                                                  | tipo  | Interfaz `{ syncLead(lead): Promise<void> }` — base para un futuro adapter Pipedrive.                                             |
| `Lead` / `LeadInteraction` / `LeadStatus` / `CreateLeadInput` | tipo  | `LeadStatus`: `"new" \| "contacted" \| "scheduled" \| "client"`.                                                                  |

## Exports — **solo subpath**, server-only

| Export                               | Notas                                                                                                                                                                                                                                                                                     |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `createOrUpdateLead(input, options)` | Crea con `status: "new"` si el Lead es nuevo (por email); si ya existe, actualiza los datos de contacto sin tocar el status. `options.externalSync` (default `false`) gatea la llamada a HubSpot — **nunca llama a la API ni con `HUBSPOT_API_KEY` presente si `externalSync` es falso**. |
| `markLeadScheduledByEmail(email)`    | Mueve un Lead existente a `status: "scheduled"` — llamado desde `POST /api/citas` cuando el cliente que agenda coincide por email. Sin referencia inversa Lead↔Cita (evita acoplamiento entre módulos).                                                                                   |
| `HubspotAdapter`                     | Implementa `CrmAdapter`. Mapeo confirmado hoy: `"new" → "lead"`. Cualquier otro status lanza `UnmappedLeadStatusError`.                                                                                                                                                                   |

## `crm.externalSync`

Al encenderlo, `HUBSPOT_API_KEY` pasa de opcional a requerido — ver `.env.example` y
`.claude/rules/modules.md`. `apps/template/src/app/api/leads/route.ts` todavía pasa
`externalSync: false` explícito (el flag real de `modules.config.ts` no está conectado ahí; ver
`E3-T1`/`modules.config.ts` para el estado de esa integración).

## Reglas de Firestore (`leads`)

```
match /leads/{leadId} {
  allow read, write: if isAdminOrAbove();
}
```

Correcto tal cual: la escritura real desde `POST /api/leads` usa el SDK admin (bypassa la regla); la
regla queda como barrera contra un hipotético escritor directo desde el navegador.
