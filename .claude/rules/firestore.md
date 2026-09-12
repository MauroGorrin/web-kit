---
description: Convenciones de Firestore y reglas de seguridad
paths:
  - "packages/web-kit/src/**"
  - "**/*.rules"
---

- Cada colección nueva necesita una entrada explícita en `packages/web-kit/firestore.rules` antes de
  que cualquier código la lea o escriba — la regla por defecto al final del archivo deniega todo.
- Un único archivo por módulo es el escritor de una colección (`repository.ts`); nada más llama a
  `setDoc`/`updateDoc` directamente sobre esa colección.
- Nunca añadir un campo `tenantId`. El aislamiento entre clientes es un proyecto de Firebase por
  cliente, no un filtro de datos.
- Todo campo de fecha se guarda como `Timestamp` de Firestore, nunca como string ni como `Date` crudo.
- Los tests de reglas (`tests/rules/**`) corren contra el emulador (`pnpm test:rules`), nunca contra
  un proyecto real.
