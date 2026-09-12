---
name: add-a-module
description: Añadir un módulo nuevo (o una función nueva a un módulo existente) a @mgorrin/web-kit — cuándo tocar packages/web-kit/src, cómo exponerlo en index.ts, y cómo verificarlo antes de un changeset. Úsalo al agregar una funcionalidad reutilizable entre clientes.
---

# add-a-module

## Cuándo usar

Al crear un módulo nuevo en `packages/web-kit/src/<nombre>/`, o al añadir una función/componente
exportado a uno existente.

## Pasos

1. Crea (o edita) `packages/web-kit/src/<módulo>/index.ts` con una allowlist explícita de exports —
   nunca `export *`.
2. Si el módulo lee/escribe Firestore, añade su sección a `packages/web-kit/firestore.rules` en el
   mismo cambio.
3. Añade el export nuevo a `packages/web-kit/package.json` → `exports["./<módulo>"]` si es un módulo
   nuevo (no si solo agregas una función a uno existente).
4. Si el módulo se activa/desactiva por cliente, añade el flag a `apps/template/modules.config.ts` y
   documenta su forma en `docs/modules/<módulo>.md`.
5. Escribe el test unitario junto al código (`*.test.ts`), y el test de reglas si toca Firestore
   (`tests/rules/<módulo>.test.ts`).
6. Corre el gate completo.
7. Crea el changeset: `pnpm changeset`.

## Verificar

```bash
pnpm --filter @mgorrin/web-kit typecheck   # expect: exit 0
pnpm --filter @mgorrin/web-kit build       # expect: exit 0
pnpm test                                   # expect: exit 0, 0 failed
```

## No hacer

- No agregues un export a `index.ts` sin que exista una fila correspondiente en
  `docs/surface.md`/`docs/modules/*.md` — cada export público es una promesa de compatibilidad.
- No importes `@radix-ui/react-*` directamente; pasa siempre por `radix-ui`.
