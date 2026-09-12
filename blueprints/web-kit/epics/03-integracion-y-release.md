# Epic 03: Integración y release

> Al terminar este epic, `modules.config.ts` controla realmente qué se builda y qué aparece en nav,
> CI corre el gate completo en cada PR, `@mgorrin/web-kit` se publica automáticamente vía Changesets
> a GitHub Packages, existe un scaffolder para generar proyectos de cliente nuevos, y toda la
> documentación (README + un doc por módulo) está escrita y verificada contra el código real.

| | |
|---|---|
| **Epic id** | `03-integracion-y-release` |
| **Tasks** | `E3-T1` … `E3-T5` |
| **Depends on** | `01-foundation`, `02-admin-y-logica-de-negocio` |
| **Unlocks** | nada — es el último epic |
| **Parallel with** | `E3-T3` (release automation) puede trabajarse en paralelo con `E3-T1` — no comparte archivos |

No necesitas ningún otro archivo para completar este epic. Todo lo de abajo está repetido aquí a
propósito.

---

## Stack

Next.js 15.5.9 · TypeScript 5.9.3 · pnpm 12.4.1 workspaces · Changesets 3.0 · GitHub Actions
(`pnpm/action-setup@v6`, `actions/setup-node@v7`).

| Tarea | Comando |
|---|---|
| Build completo | `pnpm build` |
| Typecheck | `pnpm typecheck` |
| Lint | `pnpm lint` |
| Test | `pnpm test` |
| E2E | `pnpm test:e2e` |
| Changeset nuevo | `pnpm changeset` |
| Generar proyecto de cliente | `pnpm setup:client` |

**Gate:** `pnpm lint && pnpm typecheck && pnpm test && pnpm build` pasa antes de marcar cualquier
tarea de este epic como terminada.

## Subárbol de directorios

```
apps/template/
  modules.config.ts                    # NUEVO E3-T1
  modules.config.test.ts                # NUEVO E3-T1
  src/components/nav/AdminNav.tsx        # editado E3-T1
  e2e/ci-smoke.spec.ts                    # NUEVO E3-T2
.github/workflows/
  ci.yml                                  # editado E3-T2 (ya existe desde el bundle)
  release.yml                              # editado E3-T3 (ya existe desde el bundle)
.changeset/
  initial-release.md                       # NUEVO E3-T3
  config.json                               # ya existe desde el bundle
scripts/
  setup.js                                   # NUEVO E3-T4
  setup.test.ts                               # NUEVO E3-T4
README.md                                     # NUEVO E3-T5
docs/
  modules/*.md                                # NUEVO E3-T5 (11 archivos)
  check-docs.ts                                # NUEVO E3-T5
```

Todo lo fuera de este subárbol está fuera de alcance.

## Modelo de datos tocado aquí

Ninguno — este epic es de integración, configuración y tooling, no añade entidades nuevas.

## Contratos

**Consumido** — ya existe, no lo reconstruyas:

| De | Interfaz | Garantía |
|---|---|---|
| `01-foundation`, `02-admin-y-logica-de-negocio` | Los 11 módulos de `packages/web-kit/src/*` | Cada uno ya expone su `index.ts` congelado |

**Producido** — nada consume esto dentro del propio blueprint; es el final de la cadena.

## Convenciones que muerden en esta área

- `modules.config.ts` es la única fuente de verdad de qué está activo — ningún componente decide por
  su cuenta.
- `scripts/setup.js` nunca copia `packages/web-kit/src/` a un proyecto de cliente — el cliente
  consume el paquete publicado, no el código fuente.
- `release.yml` necesita `permissions: packages: write` explícito — el `GITHUB_TOKEN` por defecto no
  lo tiene.

Reglas completas del proyecto: `CLAUDE.md`. Reglas de área: `.claude/rules/{name}.md`.

---

## Tareas

### `E3-T1` — modules.config.ts y navegación/rutas condicionales

**Depende de:** E1-T4, E1-T5, E1-T6, E2-T1, E2-T2, E2-T3, E2-T4, E2-T5, E2-T6 · **Prioridad:** p0

Crea `apps/template/modules.config.ts` (flags para los 10 módulos activables; `design-system` no
lleva flag). Edita la navegación (admin y pública) para leer los flags con import dinámico.

**Files**
- `apps/template/modules.config.ts` — nuevo
- `apps/template/src/components/nav/AdminNav.tsx` — editado
- `apps/template/modules.config.test.ts` — nuevo

**Acceptance**

1. **WHEN** `modules.config.ts` tiene `ecommerce: false` **THE SYSTEM SHALL** no incluir el enlace a `/tienda` en la navegación ni en el sitemap.
2. **WHEN** `modules.config.ts` tiene `ecommerce: false` y se builda **THE SYSTEM SHALL** no incrementar el bundle de la ruta `/` con código de `ecommerce`.
3. **WHEN** todos los módulos activables están en `false` **THE SYSTEM SHALL** seguir buildando y arrancando sin error.
4. **WHEN** `design-system` se busca en `modules.config.ts` **THE SYSTEM SHALL** no encontrar ningún flag para él.

**Verify**

```bash
pnpm exec vitest run apps/template/modules.config.test.ts
pnpm --filter template build
pnpm typecheck
```

**Checkpoint**

```bash
git add -A && git commit -m "E3-T1: modules.config.ts + conditional nav/routes"
git tag step-13-modules-config
```

### `E3-T2` — Endurecimiento de CI

**Depende de:** E3-T1 · **Prioridad:** p0

Confirma/edita `.github/workflows/ci.yml` (ya emitido en el bundle): install → playwright install →
lint → format → typecheck → unit → rules (emulador) → build → e2e, en ese orden.

**Files**
- `.github/workflows/ci.yml` — editado
- `apps/template/e2e/ci-smoke.spec.ts` — nuevo

**Acceptance**

1. **WHEN** se abre un PR **THE SYSTEM SHALL** correr el pipeline completo (lint -> format -> typecheck -> unit -> rules -> build -> e2e).
2. **WHEN** cualquiera de esas etapas falla **THE SYSTEM SHALL** detener el pipeline sin ejecutar el release.
3. **WHEN** el pipeline corre localmente ejecutando cada línea del job en orden **THE SYSTEM SHALL** salir con código 0 en un checkout limpio.

**Verify**

```bash
pnpm install --frozen-lockfile
pnpm exec playwright install --with-deps chromium
pnpm lint
pnpm format
pnpm typecheck
pnpm test
pnpm exec firebase emulators:exec --only firestore,auth "pnpm exec vitest run tests/rules"
pnpm build
pnpm test:e2e
```

**Checkpoint**

```bash
git add -A && git commit -m "E3-T2: CI hardening"
git tag step-14-ci-hardening
```

### `E3-T3` — Automatización de release con Changesets

**Depende de:** E1-T1 · **Prioridad:** p1

Confirma `.changeset/config.json` y `.github/workflows/release.yml` (ya emitidos en el bundle). Añade
el primer changeset real.

**Files**
- `.changeset/initial-release.md` — nuevo
- `.github/workflows/release.yml` — confirmado/editado
- `.changeset/config.json` — confirmado

**Acceptance**

1. **WHEN** `pnpm changeset status` corre con el changeset inicial presente **THE SYSTEM SHALL** reportar un bump pendiente para `@mgorrin/web-kit`.
2. **WHEN** `pnpm --filter @mgorrin/web-kit build` corre antes de publicar **THE SYSTEM SHALL** salir con código 0.
3. **WHEN** se inspecciona `release.yml` **THE SYSTEM SHALL** declarar `permissions: packages: write` explícitamente.

**Verify**

```bash
pnpm exec changeset status --since=step-01-monorepo-bootstrap
pnpm --filter @mgorrin/web-kit build
grep -q "packages: write" .github/workflows/release.yml
```

**Checkpoint**

```bash
git add -A && git commit -m "E3-T3: release automation + initial changeset"
git tag step-15-release-automation
```

### `E3-T4` — Scaffolder scripts/setup.js

**Depende de:** E3-T1 · **Prioridad:** p1

Crea `scripts/setup.js` (Node puro, sin dependencias nuevas): prompts de nombre de cliente, directorio
destino, y qué módulos activar; escribe `modules.config.ts` y copia `apps/template` (sin
`node_modules`/`.next`). Soporta `--dry-run --name= --out=` no interactivo para tests.

**Files**
- `scripts/setup.js` — nuevo
- `scripts/setup.test.ts` — nuevo

**Acceptance**

1. **WHEN** `node scripts/setup.js --dry-run --name=demo --out=<tmp>` corre **THE SYSTEM SHALL** escribir `<tmp>/modules.config.ts` con los flags por defecto y salir con código 0.
2. **WHEN** el directorio destino ya existe y no está vacío **THE SYSTEM SHALL** abortar con código 1 sin sobrescribir nada.
3. **WHEN** el script copia `apps/template` **THE SYSTEM SHALL** excluir `node_modules/` y `.next/` del destino.
4. **WHEN** `pnpm exec vitest run scripts/setup.test.ts` corre **THE SYSTEM SHALL** pasar con 0 fallos.

**Verify**

```bash
pnpm exec vitest run scripts/setup.test.ts
TMP_OUT="$(mktemp -d)" && node scripts/setup.js --dry-run --name=demo --out="$TMP_OUT" && test -f "$TMP_OUT/modules.config.ts" && rm -rf "$TMP_OUT"
```

**Checkpoint**

```bash
git add -A && git commit -m "E3-T4: scripts/setup.js scaffolder"
git tag step-16-setup-script
```

### `E3-T5` — Documentación (README + docs/modules)

**Depende de:** E3-T2, E3-T3, E3-T4 · **Prioridad:** p1

Crea `README.md` (qué es esto, cómo generar un proyecto de cliente, configuración de
`.npmrc`/GitHub Packages). Crea `docs/modules/*.md` (uno por cada uno de los 11 módulos). Crea
`docs/check-docs.ts` que confirma la correspondencia módulo ↔ doc.

**Files**
- `README.md` — nuevo
- `docs/modules/*.md` — nuevo (11 archivos)
- `docs/check-docs.ts` — nuevo

**Acceptance**

1. **WHEN** `node --experimental-strip-types docs/check-docs.ts` corre **THE SYSTEM SHALL** confirmar que existe un `docs/modules/<módulo>.md` por cada módulo exportado en `packages/web-kit/src/index.ts`, saliendo con código 1 si falta alguno.
2. **WHEN** se lee `README.md` **THE SYSTEM SHALL** incluir la configuración exacta de `.npmrc` con los dos scopes de token.
3. **WHEN** se cuentan los archivos en `docs/modules/` **THE SYSTEM SHALL** haber exactamente 11.

**Verify**

```bash
node --experimental-strip-types docs/check-docs.ts
test "$(ls docs/modules | wc -l)" = "11"
grep -q "write:packages" README.md
```

**Checkpoint**

```bash
git add -A && git commit -m "E3-T5: documentation (README + docs/modules)"
git tag step-17-documentation
```

---

## Aceptación del epic

1. **WHEN** se corre el gate global de `blueprint.md` §20.1 completo desde la raíz **THE SYSTEM SHALL** salir con código 0 en cada línea.
2. **WHEN** se genera un proyecto de cliente de prueba con `pnpm setup:client` y se corre `pnpm install && pnpm dev` dentro de él **THE SYSTEM SHALL** arrancar sin error.

```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm build
node --experimental-strip-types docs/check-docs.ts
```

## Trampas

- **No copies `packages/web-kit/src/` al proyecto de cliente** — el cliente consume el paquete
  publicado vía `workspace:*` solo dentro de este monorepo; un proyecto de cliente generado depende
  de `@mgorrin/web-kit` como paquete normal de GitHub Packages.
- **No olvides `permissions: packages: write`** en `release.yml` — sin esa línea el `GITHUB_TOKEN` por
  defecto no puede publicar, y el fallo aparece como un 403 confuso en el job de release.

## Antes de avanzar

- [ ] Todas las tareas de este epic están `done` en `tasks.json`.
- [ ] Cada `verify` de cada tarea pasó, no solo el primero.
- [ ] `git tag -l 'step-1[3-7]-*'` lista 5 tags.
- [ ] El gate global de `blueprint.md` §20.1 pasa completo.
- [ ] Ningún archivo fuera del subárbol fue modificado.
- [ ] `.env.example` no requiere cambios en este epic (no se añaden variables nuevas).
- [ ] Un commit por tarea, cada uno con su tag de checkpoint.
