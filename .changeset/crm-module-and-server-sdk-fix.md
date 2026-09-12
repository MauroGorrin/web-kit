---
"@mgorrin/web-kit": major
---

Añade el módulo `crm`: `createOrUpdateLead`, `markLeadScheduledByEmail`, `HubspotAdapter` (gateado por
un flag `externalSync` explícito hasta que `modules.config.ts` lo conecte en E3-T1), y
`UnmappedLeadStatusError`. Añade `POST /api/leads` en `apps/template`.

**Cambio de ruptura:** `scheduling` (`createCita`, `getCita`, `updateCita`, `listCitasBetween`,
`listUpcomingCitasForClient`) pasa de SDK cliente a SDK admin, en archivos `*.server.ts`. Estas
funciones ya no se reexportan desde el barrel raíz del paquete (`@mgorrin/web-kit`) — solo desde
`@mgorrin/web-kit/scheduling`. Corrige un bug real: llamadas desde Route Handlers/Server Components
con el SDK cliente nunca quedaban autenticadas como el usuario del request, así que `firestore.rules`
(`isSignedIn()`, `isAdminOrAbove()`) les negaba el paso contra un proyecto de Firebase real —
inadvertido hasta ahora porque ninguna verificación previa ejercitó una escritura real contra
reglas activas (los tests de reglas usan sus propios contextos autenticados de
`rules-unit-testing`, no el código de la app). `multi-location` y las escrituras de `admin-panel`
sobre `especialistas` no cambian — corren client-side, donde el SDK sí lleva la sesión real del
navegador.
