---
description: Convenciones de activación de módulos y generación de rutas/nav
paths:
  - "apps/template/modules.config.ts"
  - "apps/template/src/app/**"
---

- `modules.config.ts` es la única fuente de verdad sobre qué módulos están activos. Ningún componente
  decide por su cuenta si renderizarse — siempre lee el flag correspondiente.
- Un módulo inactivo no debe aportar peso de bundle ni entradas de navegación — usa import dinámico
  condicionado al flag, no un `if` alrededor de un import estático de nivel superior.
- `design-system` nunca se apaga; no lleva flag.
- Al activar `crm.externalSync`, `HUBSPOT_API_KEY` pasa de opcional a requerido — actualiza
  `src/lib/env.ts` en el mismo cambio.
