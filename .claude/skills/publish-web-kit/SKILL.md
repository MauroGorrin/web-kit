---
name: publish-web-kit
description: Publicar una nueva versión de @mgorrin/web-kit en GitHub Packages — configuración exacta de .npmrc, scopes de token requeridos, y el flujo de Changesets. Úsalo cuando hay que liberar una versión nueva del paquete o cuando falla la publicación/instalación por credenciales del registro.
---

# publish-web-kit

## Cuándo usar

Al fusionar cambios a `main` que incluyen un changeset pendiente, o al depurar un fallo de
`npm install`/`pnpm install` contra el scope `@mgorrin` (el punto de fricción más común de todo este
setup).

## Configuración requerida (una sola vez)

- `.npmrc` en la raíz de CADA repo (web-kit y cada proyecto de cliente) debe tener:
  ```
  @mgorrin:registry=https://npm.pkg.github.com
  always-auth=true
  ```
- Publicar necesita un token de GitHub con scopes `write:packages` + `repo` (repo privado).
- Consumir (`pnpm install` en un proyecto de cliente) necesita un token con `read:packages`.
- El workflow `release.yml` necesita `permissions: packages: write` explícito — el `GITHUB_TOKEN`
  por defecto de Actions NO tiene ese permiso a menos que se declare.
- Localmente, exporta `NODE_AUTH_TOKEN=<tu-token>` antes de cualquier `pnpm install`/`pnpm publish`
  manual contra el registro.

## Pasos (flujo normal)

1. En la rama de trabajo: `pnpm changeset` y describe el cambio.
2. Push y merge a `main`.
3. `release.yml` abre (o actualiza) un PR de "Version Packages" vía Changesets.
4. Al mergear ese PR, `release.yml` publica automáticamente.

## Verificar

```bash
pnpm --filter @mgorrin/web-kit build          # expect: exit 0
cat .npmrc | grep -q "@mgorrin:registry"       # expect: exit 0
```

## No hacer

- No publiques manualmente desde un laptop — solo desde `release.yml` en CI.
- No commitees un `.npmrc` con un token embebido — el token vive en `NODE_AUTH_TOKEN`, nunca en el
  archivo.
