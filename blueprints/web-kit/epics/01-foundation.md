# Epic 01: Foundation

> Al terminar este epic existe un monorepo pnpm funcional con el paquete `@mgorrin/web-kit` (con
> superficie pública congelada) y una app plantilla Next.js con design-system, auth con roles,
> múltiples sedes, agendamiento y portal de cliente funcionando de punta a punta.

| | |
|---|---|
| **Epic id** | `01-foundation` |
| **Tasks** | `E1-T1` … `E1-T6` |
| **Depends on** | nothing — start here |
| **Unlocks** | `02-admin-y-logica-de-negocio`, `03-integracion-y-release` |
| **Parallel with** | nada — cada tarea depende de la anterior en este epic |

No necesitas ningún otro archivo para completar este epic. Todo lo de abajo está repetido aquí a
propósito.

---

## Stack

Next.js 15.5.9 · TypeScript 5.9.3 · Tailwind 4.3 · `radix-ui` (paquete unificado) ·
class-variance-authority · Firebase (client 12.19 / admin 14.4) · pnpm 12.4.1 workspaces (sin
Turborepo). Runtime fijado en `.nvmrc` (Node 22). Versiones exactas en `pnpm-lock.yaml` — léelo, nunca
las adivines.

| Tarea | Comando |
|---|---|
| Dev | `pnpm dev` |
| Typecheck | `pnpm typecheck` |
| Lint | `pnpm lint` |
| Test (un archivo) | `pnpm exec vitest run {ruta}` |
| Tests de reglas Firestore | `pnpm exec firebase emulators:exec --only firestore,auth "pnpm exec vitest run {ruta}"` |
| Emuladores (manual) | `pnpm emulators:up` / Ctrl+C para bajar |

**Gate:** `pnpm lint && pnpm typecheck && pnpm test` pasa antes de marcar cualquier tarea de este epic
como terminada.

Si alguna tarea de abajo verifica contra un servicio real (el emulador de Firestore/Auth), levántalo
primero con el comando de arriba. El archivo que lo define (`firebase.json`) ya llegó en
`workspace/` y ya está en la raíz del proyecto — no lo escribes tú, y nunca sustituyas un mock donde
los criterios de aceptación nombran el emulador real.

## Subárbol de directorios

Solo las partes que este epic toca:

```
packages/web-kit/
  src/
    index.ts                  # allowlist pública — NUEVO en E1-T1, editado en cada tarea siguiente
    design-system/            # NUEVO en E1-T2 — tokens.css, Button, Card, Input, Dialog
    auth-rbac/                # NUEVO en E1-T3 — firebase-client.ts, firebase-admin.ts, session.ts
    multi-location/           # NUEVO en E1-T4 — types.ts, repository.ts (Sede)
    scheduling/                # NUEVO en E1-T5 — types.ts, repository.ts, CalendlyEmbed.tsx (Cita)
    client-portal/             # NUEVO en E1-T6 — NextAppointmentCard.tsx, NotificationList.tsx
  firestore.rules              # existe, editado en E1-T3/T4/T5
apps/template/
  package.json                 # editado en E1-T1
  theme.config.ts               # NUEVO en E1-T2
  src/app/
    page.tsx                    # editado en E1-T2
    portal/page.tsx              # NUEVO en E1-T6
    api/citas/route.ts            # NUEVO en E1-T5
    api/citas/[id]/route.ts        # NUEVO en E1-T5
  e2e/{home,portal}.spec.ts       # NUEVO en E1-T2/T6
tests/rules/{users,sedes,citas}.test.ts  # NUEVO en E1-T3/T4/T5
docs/surface.md                 # NUEVO en E1-T1, congelado en E1-T2
```

Todo lo fuera de este subárbol está fuera de alcance. Si una tarea parece requerir editar un archivo
no listado aquí, detente y repórtalo — significa que el límite del epic está mal.

## Modelo de datos tocado aquí

| Entidad | Campos que este epic añade o lee | Notas |
|---|---|---|
| `User` (`users`) | `uid`, `email`, `displayName`, `role`, `sedeId`, `createdAt` | E1-T3 |
| `Sede` (`sedes`) | `id`, `name`, `address`, `hours`, `contact`, `isDefault` | E1-T4 |
| `Cita` (`citas`) | `id`, `clientUid`, `sedeId`, `especialistaId`, `datetime`, `status`, `source`, `notes` | E1-T5, leído en E1-T6 |

## Contratos

**Consumido** — ya existe, no lo reconstruyas:

| De | Interfaz | Garantía |
|---|---|---|
| — | — | E1-T1 es la raíz del build; no consume nada previo |

**Producido** — epics posteriores dependen exactamente de estas firmas. Cambiar una las rompe:

| Export | Firma | Usado por |
|---|---|---|
| `packages/web-kit/src/design-system` → `Button`, `Card`, `Input`, `Dialog` | componentes React tipados con `class-variance-authority` | `02-admin-y-logica-de-negocio`, `03-integracion-y-release` |
| `packages/web-kit/src/auth-rbac` → `getSession()`, `useRoleGuard()` | `() => Promise<Session \| null>`, `(role: Role) => boolean` | `02-admin-y-logica-de-negocio` (admin-panel, crm, payments) |
| `packages/web-kit/src/scheduling` → `CitaRepository` | CRUD tipado sobre `citas` | `02-admin-y-logica-de-negocio` (admin-panel, notifications) |

## Convenciones que muerden en esta área

- Especificadores relativos con extensión `.ts` en todo import interno del paquete —
  `allowImportingTsExtensions`/`rewriteRelativeImportExtensions` ya están en `tsconfig.base.json`.
- Nunca importar `@radix-ui/react-*` fuera de `design-system/` — el lint lo bloquea desde E1-T2.
- `firebase-admin.ts` es server-only: nunca se importa desde un archivo `"use client"`.
- Sin campo `tenantId` en ningún tipo — el aislamiento es un proyecto de Firebase por cliente.

Reglas completas del proyecto: `CLAUDE.md`. Reglas de área: `.claude/rules/{name}.md`. Ambos ya están
en la raíz del proyecto — el builder los copió ahí desde `workspace/` del bundle antes de la tarea 1.

---

## Tareas

Listadas en el mismo orden que `tasks.json`. Ese orden es el orden de construcción — trabaja de
arriba a abajo, no reordenes por prioridad ni por lo que parezca más rápido.

### `E1-T1` — Bootstrap del monorepo y scaffold de la plantilla

**Depende de:** nada · **Prioridad:** p0 — bloquea todo lo demás

Crea `packages/web-kit/src/index.ts` con una allowlist vacía (comentario explícito de que es
allowlist, no barrel). Crea `docs/surface.md` declarando las dos secciones (exports de valor / exports
de tipo), ambas vacías. `mkdir -p apps` primero (confirmado por ejecución real: `create-next-app`
puede fallar con "application path is not writable" en Windows si el directorio padre no existe).
Corre `pnpm create next-app@15.5.9 apps/template --typescript --tailwind --eslint --app --src-dir
--import-alias "@/*" --use-pnpm --yes` para escandar la app — `allowBuilds`/`minimumReleaseAgeExclude`
en `pnpm-workspace.yaml` (§19.6) ya cubren los postinstalls conocidos; si aun así aborta con
`ERR_PNPM_IGNORED_BUILDS` en un paquete nuevo, `pnpm approve-builds --all && pnpm install` completa
la instalación que el scaffold dejó a medias. Edita `apps/template/package.json` (ya escrito por el
scaffold): añade `"@mgorrin/web-kit": "workspace:*"` como dependencia; fija `devDependencies.typescript`
a `"5.9.3"` exacto (el scaffold trae `"^5"` — se fija explícito para igualar el pin de la raíz; NUNCA
subir a 6.0.3, rompe el build de Next 15.5.9, confirmado por ejecución real); alinea `eslint`,
`eslint-config-next`, `tailwindcss`, `@tailwindcss/postcss`, `@eslint/eslintrc` a los mismos pines
exactos que la raíz.

**Files**
- `packages/web-kit/src/index.ts` — nuevo, allowlist vacía
- `docs/surface.md` — nuevo, declara la superficie (vacía)
- `apps/template/package.json` — editado tras el scaffold (workspace dep + pines de TS/eslint/tailwind alineados)
- `apps/template/src/app/**` — generado por el scaffold, no tocado a mano en esta tarea

**Acceptance**

1. **WHEN** `pnpm install --frozen-lockfile` corre en la raíz **THE SYSTEM SHALL** salir con código 0.
2. **WHEN** `pnpm --filter template build` corre **THE SYSTEM SHALL** producir un build de producción sin errores.
3. **WHEN** `pnpm --filter template start` arranca y se hace `curl` a `/` **THE SYSTEM SHALL** responder `200`.
4. **WHEN** `pnpm --filter @mgorrin/web-kit build` corre contra `src/index.ts` vacío **THE SYSTEM SHALL** salir con código 0.
5. **WHEN** se lee `docs/surface.md` **THE SYSTEM SHALL** tener las dos secciones (valor / tipo) presentes, aunque vacías.

**Verify**

```bash
pnpm install --frozen-lockfile
pnpm --filter @mgorrin/web-kit build
pnpm --filter template build
pnpm --filter template start &
sleep 2
test "$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/)" = "200"
kill %1
test -f docs/surface.md
```

**Checkpoint**

```bash
git add -A && git commit -m "E1-T1: monorepo bootstrap + template scaffold"
git tag step-01-monorepo-bootstrap
```

### `E1-T2` — Módulo design-system y congelamiento de la superficie pública

**Depende de:** E1-T1 · **Prioridad:** p0

Crea `packages/web-kit/src/design-system/` con `tokens.css`, `Button.tsx`, `Card.tsx`, `Input.tsx`,
`Dialog.tsx` sobre `radix-ui` + `class-variance-authority`, e `index.ts` (allowlist:
`Button`, `Card`, `Input`, `Dialog`, `ButtonVariant`). Crea `apps/template/theme.config.ts`. Añade
`export * from "./design-system/index.ts"` a `packages/web-kit/src/index.ts`. Actualiza
`docs/surface.md` con las 4 filas de valor y 1 de tipo. **Esta tarea congela la superficie pública** —
desde aquí el chequeo de drift corre como gate.

**Files**
- `packages/web-kit/src/design-system/**` — nuevo
- `apps/template/theme.config.ts` — nuevo
- `packages/web-kit/src/index.ts` — editado
- `apps/template/e2e/home.spec.ts` — nuevo
- `docs/surface.md` — editado (congelado)

**Acceptance**

1. **WHEN** `pnpm --filter @mgorrin/web-kit build` corre **THE SYSTEM SHALL** exportar `Button`, `Card`, `Input`, `Dialog` desde `dist/design-system/index.js`.
2. **WHEN** el script de chequeo de drift corre **THE SYSTEM SHALL** comparar las filas de valor de `docs/surface.md` contra el namespace runtime y las filas de tipo contra la salida de `tsc --declaration`, saliendo con código 0.
3. **WHEN** la home de `apps/template` renderiza un `<Button>` **THE SYSTEM SHALL** aplicar `--color-primary` de `theme.config.ts` sin hardcodear el hex en el componente.
4. **WHEN** `pnpm exec playwright test apps/template/e2e/home.spec.ts` corre **THE SYSTEM SHALL** pasar.
5. **WHEN** se importa `@radix-ui/react-dialog` directamente fuera de `design-system/` **THE SYSTEM SHALL** fallar el lint.

**Verify**

```bash
pnpm --filter @mgorrin/web-kit build
node -e "const m = require('./packages/web-kit/dist/design-system/index.js'); ['Button','Card','Input','Dialog'].forEach(n => { if (!(n in m)) { console.error('missing '+n); process.exit(1); } })"
pnpm exec vitest run packages/web-kit/src/design-system
pnpm --filter template build
pnpm exec playwright test apps/template/e2e/home.spec.ts
pnpm lint
```

**Checkpoint**

```bash
git add -A && git commit -m "E1-T2: design-system module, freeze public surface"
git tag step-02-design-system
```

### `E1-T3` — Módulo auth-rbac y reglas de seguridad de users

**Depende de:** E1-T2 · **Prioridad:** p0

Corre `pnpm --filter template add firebase@^12.19.0` primero — `firebase` es un `peerDependency`
de `@mgorrin/web-kit` y `apps/template` es quien lo satisface como dependencia real. Luego crea
`packages/web-kit/src/auth-rbac/`: `firebase-client.ts`, `firebase-admin.ts`, `session.ts`
(`getSession()`), `use-role-guard.ts`, `types.ts` (`Role`). La sección `users` de
`packages/web-kit/firestore.rules` ya existe (emitida en el bundle) — esta tarea la confirma con
tests reales contra el emulador.

**Files**
- `apps/template/package.json` — editado (dependencia real `firebase`)
- `packages/web-kit/src/auth-rbac/**` — nuevo
- `tests/rules/users.test.ts` — nuevo
- `packages/web-kit/src/index.ts` — editado
- `docs/surface.md` — editado

**Acceptance**

1. **WHEN** un usuario sin sesión intenta leer `users/{otroUid}` en el emulador **THE SYSTEM SHALL** denegar el acceso.
2. **WHEN** un usuario con rol `admin` lee cualquier documento de `users` **THE SYSTEM SHALL** permitirlo.
3. **WHEN** un usuario intenta escribir su propio documento `users/{uid}` sin ser `super_admin` **THE SYSTEM SHALL** denegar la escritura.
4. **WHEN** `getSession()` se llama sin cookie de sesión válida **THE SYSTEM SHALL** retornar `null`, nunca lanzar una excepción no capturada.
5. **WHEN** `FIREBASE_ADMIN_PRIVATE_KEY` está ausente al importar `firebase-admin.ts` **THE SYSTEM SHALL** lanzar un error nombrado en el import.
6. **WHEN** `pnpm exec vitest run tests/rules/users.test.ts` corre contra el emulador **THE SYSTEM SHALL** pasar con 0 fallos.

**Verify**

```bash
grep -q '"firebase"' apps/template/package.json
pnpm --filter @mgorrin/web-kit build
pnpm exec firebase emulators:exec --only firestore,auth "pnpm exec vitest run tests/rules/users.test.ts"
pnpm typecheck
```

**Checkpoint**

```bash
git add -A && git commit -m "E1-T3: auth-rbac module + firestore rules for users"
git tag step-03-auth-rbac
```

### `E1-T4` — Módulo multi-location

**Depende de:** E1-T3 · **Prioridad:** p1

Crea `packages/web-kit/src/multi-location/`: `types.ts` (`Sede`), `repository.ts` (CRUD + guardia de
borrado que verifica hijos activos), `index.ts`.

**Files**
- `packages/web-kit/src/multi-location/**` — nuevo
- `tests/rules/sedes.test.ts` — nuevo
- `packages/web-kit/src/index.ts` — editado
- `docs/surface.md` — editado

**Acceptance**

1. **WHEN** se crea la primera Sede de un proyecto **THE SYSTEM SHALL** marcarla `isDefault: true` automáticamente.
2. **WHEN** se intenta borrar una Sede con al menos un `Especialista` activo **THE SYSTEM SHALL** rechazar el borrado con un error tipado `CONFLICT`.
3. **WHEN** un usuario sin rol admin intenta escribir en `sedes` vía el emulador **THE SYSTEM SHALL** denegarlo.
4. **WHEN** solo existe una Sede **THE SYSTEM SHALL** permitir que la UI la oculte del selector sin romper ninguna consulta.

**Verify**

```bash
pnpm exec vitest run packages/web-kit/src/multi-location
pnpm exec firebase emulators:exec --only firestore,auth "pnpm exec vitest run tests/rules/sedes.test.ts"
pnpm typecheck
```

**Checkpoint**

```bash
git add -A && git commit -m "E1-T4: multi-location module"
git tag step-04-multi-location
```

### `E1-T5` — Módulo scheduling y rutas de la API de citas

**Depende de:** E1-T4 · **Prioridad:** p0

Crea `packages/web-kit/src/scheduling/`: `types.ts` (`Cita`), `repository.ts` (único escritor de
`citas`), `CalendlyEmbed.tsx`, `index.ts`. Crea `apps/template/src/app/api/citas/route.ts` (POST) y
`apps/template/src/app/api/citas/[id]/route.ts` (PATCH).

**Files**
- `packages/web-kit/src/scheduling/**` — nuevo
- `apps/template/src/app/api/citas/route.ts` — nuevo
- `apps/template/src/app/api/citas/[id]/route.ts` — nuevo
- `tests/rules/citas.test.ts` — nuevo
- `packages/web-kit/src/index.ts` — editado

**Acceptance**

1. **WHEN** `POST /api/citas` recibe un body válido con sesión **THE SYSTEM SHALL** crear un documento en `citas` con `status: "scheduled"` y responder `201`.
2. **WHEN** `POST /api/citas` recibe `sedeId` inexistente **THE SYSTEM SHALL** responder `404` con `{ ok: false, error: { code: "NOT_FOUND" } }` y no escribir ningún documento.
3. **WHEN** `POST /api/citas` recibe una request sin sesión **THE SYSTEM SHALL** responder `401` y no escribir ningún documento.
4. **WHEN** `PATCH /api/citas/[id]` es llamado por un usuario sin rol admin **THE SYSTEM SHALL** responder `403`.
5. **WHEN** un cliente sin cuenta agenda manualmente vía el admin **THE SYSTEM SHALL** aceptar `clientUid: null`.

**Verify**

```bash
pnpm exec vitest run packages/web-kit/src/scheduling
pnpm --filter template build
pnpm --filter template start &
sleep 2
test "$(curl -s -o /dev/null -w '%{http_code}' -X POST http://localhost:3000/api/citas -H 'Content-Type: application/json' -d '{}')" = "401"
kill %1
```

**Checkpoint**

```bash
git add -A && git commit -m "E1-T5: scheduling module + citas API routes"
git tag step-05-scheduling
```

### `E1-T6` — Módulo client-portal

**Depende de:** E1-T3, E1-T5 · **Prioridad:** p1

Crea `packages/web-kit/src/client-portal/`: `NextAppointmentCard.tsx`, `NotificationList.tsx`,
`index.ts`. Crea `apps/template/src/app/portal/page.tsx`.

**Files**
- `packages/web-kit/src/client-portal/**` — nuevo
- `apps/template/src/app/portal/page.tsx` — nuevo
- `apps/template/e2e/portal.spec.ts` — nuevo
- `packages/web-kit/src/index.ts` — editado

**Acceptance**

1. **WHEN** un usuario autenticado con una Cita futura visita `/portal` **THE SYSTEM SHALL** mostrar fecha, hora y estado de esa Cita.
2. **WHEN** un usuario autenticado sin citas futuras visita `/portal` **THE SYSTEM SHALL** mostrar el estado vacío "No tienes citas programadas" con un enlace a `/agenda`.
3. **WHEN** un usuario no autenticado visita `/portal` **THE SYSTEM SHALL** redirigir a `/`.
4. **WHEN** se inspecciona cualquier componente de `client-portal` **THE SYSTEM SHALL** no contener ningún campo de dato clínico.

**Verify**

```bash
pnpm exec vitest run packages/web-kit/src/client-portal
pnpm --filter template build
pnpm exec playwright test apps/template/e2e/portal.spec.ts
pnpm typecheck
```

**Checkpoint**

```bash
git add -A && git commit -m "E1-T6: client-portal module"
git tag step-06-client-portal
```

---

## Aceptación del epic

El epic está terminado cuando todas las tareas están `done` **y**:

1. **WHEN** se corre el flujo completo (crear cuenta → login con Google → agendar cita → verla en `/portal`) contra el emulador **THE SYSTEM SHALL** completarlo sin ningún error 5xx.
2. **WHEN** `pnpm lint && pnpm typecheck && pnpm test` corre desde la raíz **THE SYSTEM SHALL** salir con código 0.

```bash
pnpm typecheck && pnpm lint && pnpm test
pnpm --filter template build
pnpm exec playwright test apps/template/e2e/home.spec.ts apps/template/e2e/portal.spec.ts
```

Corridos desde la raíz del proyecto.

## Trampas

- **No dupliques el escritor de `citas`.** El admin (epic 02) reutiliza el mismo `POST /api/citas` de
  E1-T5 — nunca escribas Firestore directamente desde el admin.
- **No importes Radix fuera de `design-system/`** — el lint lo bloquea, no lo trabajes alrededor.
- **`getSession()` nunca lanza** — siempre retorna `null` en ausencia de sesión válida; lanzar rompería
  cada Server Component que lo llama sin `try/catch`.

## Antes de avanzar

- [ ] Todas las tareas de este epic están `done` en `tasks.json` — ninguna quedó `in_progress`.
- [ ] Cada comando `verify` de cada tarea de este epic pasó, no solo el primero.
- [ ] Cada tarea de este epic tiene su tag de checkpoint en git — `git tag -l 'step-0[1-6]-*'` lista 6.
- [ ] El gate del epic pasa limpio, corrido desde la raíz.
- [ ] Cada contrato "Producido" de arriba existe con la firma indicada.
- [ ] Ningún archivo fuera del subárbol fue modificado.
- [ ] `.env.example` está actualizado con las variables que este epic añadió (Firebase client/admin,
      emuladores, Calendly).
- [ ] Un commit por tarea, cada uno prefijado con su id de tarea, cada uno seguido de su tag de checkpoint.
