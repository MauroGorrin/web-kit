---
description: Versionado y publicación de @mgorrin/web-kit
paths:
  - "packages/web-kit/**"
  - ".changeset/**"
  - ".github/workflows/release.yml"
---

- Todo cambio a `packages/web-kit/src/**` que afecte a un consumidor va acompañado de
  `pnpm changeset` en el mismo commit — sin excepción, incluso para fixes menores.
- Rompimientos de compatibilidad son un major (`breaking change` en el changeset) — no hay ventana de
  deprecación formal en v1; los clientes actualizan cuando les convenga.
- Nunca editar `packages/web-kit/dist/` a mano — es el output de `pnpm --filter @mgorrin/web-kit build`.
- El registro es privado (GitHub Packages, scope `@mgorrin`). Publicar solo ocurre desde
  `release.yml` en CI, nunca desde una máquina local.
