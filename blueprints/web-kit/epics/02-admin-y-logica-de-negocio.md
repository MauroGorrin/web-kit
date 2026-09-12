# Epic 02: Admin y lógica de negocio

> Al terminar este epic, el admin puede gestionar todo el negocio desde `/admin`, los leads se
> capturan en un pipeline de CRM (con adapter de HubSpot opcional), las citas disparan emails
> transaccionales, el sitio tiene SEO/analítica básicos, y los pagos con Stripe (incluyendo el
> catálogo de e-commerce) funcionan de punta a punta.

| | |
|---|---|
| **Epic id** | `02-admin-y-logica-de-negocio` |
| **Tasks** | `E2-T1` … `E2-T6` |
| **Depends on** | `01-foundation` |
| **Unlocks** | `03-integracion-y-release` |
| **Parallel with** | `E2-T2`, `E2-T3`, `E2-T4` pueden trabajarse en cualquier orden entre sí una vez `01-foundation` está `done` — no comparten archivos |

No necesitas ningún otro archivo para completar este epic. Todo lo de abajo está repetido aquí a
propósito.

---

## Stack

Next.js 15.5.9 · TypeScript 5.9.3 · Firebase (client 12.19 / admin 14.4) · Resend 6.28 · Stripe
(Node SDK 22.6 + `@stripe/stripe-js` 9.16) · pnpm 12.4.1 workspaces.

| Tarea | Comando |
|---|---|
| Dev | `pnpm dev` |
| Typecheck | `pnpm typecheck` |
| Lint | `pnpm lint` |
| Test (un archivo) | `pnpm exec vitest run {ruta}` |
| Emuladores (manual) | `pnpm emulators:up` |

**Gate:** `pnpm typecheck && pnpm lint && pnpm test` pasa antes de marcar cualquier tarea de este epic
como terminada.

## Subárbol de directorios

```
packages/web-kit/src/
  admin-panel/       # NUEVO E2-T1 — Dashboard.tsx, CitasTable.tsx, EspecialistasCrud.tsx, SedesCrud.tsx
  crm/                # NUEVO E2-T2 — types.ts (Lead), repository.ts, hubspot-adapter.ts
  notifications/      # NUEVO E2-T3 — resend-client.ts, send-appointment-email.ts, templates.ts
  seo-analytics/      # NUEVO E2-T4 — metadata-helper.ts, local-business-jsonld.ts, ga4-script.tsx
  payments/            # NUEVO E2-T5 — types.ts (PaymentProvider), stripe-provider.ts
  ecommerce/           # NUEVO E2-T6 — types.ts (Producto, Pedido), repository.ts, CartProvider.tsx
apps/template/src/app/
  admin/{layout,page,citas,especialistas,sedes}.tsx  # NUEVO E2-T1
  api/leads/route.ts                                  # NUEVO E2-T2
  api/citas/route.ts, api/citas/[id]/route.ts          # editados E2-T3 (llamada a notifications)
  sitemap.ts, robots.ts                                # NUEVO E2-T4
  api/checkout/route.ts, api/webhooks/stripe/route.ts    # NUEVO E2-T5
  tienda/page.tsx                                        # NUEVO E2-T6
apps/template/e2e/{admin,tienda}.spec.ts
```

Todo lo fuera de este subárbol está fuera de alcance. Si una tarea parece requerir editar un archivo
no listado aquí, detente y repórtalo.

## Modelo de datos tocado aquí

| Entidad | Campos que este epic añade o lee | Notas |
|---|---|---|
| `Lead` (`leads`) | `id`, `name`, `email`, `phone`, `status`, `notes`, `interactions`, `hubspotContactId` | E2-T2 |
| `Producto` (`productos`) | `id`, `name`, `priceCents`, `images`, `sedeId`, `inventoryCount` | E2-T6 |
| `Pedido` (`pedidos`) | `id`, `clientUid`, `items`, `totalCents`, `shippingNote`, `status`, `stripePaymentIntentId` | E2-T5 (crea), E2-T6 (crea vía checkout) |
| `Cita` (`citas`) | leído por E2-T1 (dashboard), E2-T3 (dispara email) | ya existe desde `01-foundation` |

## Contratos

**Consumido** — ya existe, no lo reconstruyas:

| De | Interfaz | Garantía |
|---|---|---|
| `01-foundation` | `packages/web-kit/src/design-system` → `Button`, `Card`, `Input`, `Dialog` | Componentes tipados, ya congelados |
| `01-foundation` | `packages/web-kit/src/auth-rbac` → `getSession()`, `useRoleGuard()` | Verifica sesión/rol server-side |
| `01-foundation` | `packages/web-kit/src/scheduling` → `CitaRepository`, `POST /api/citas` | Único escritor de `citas` — el admin lo reutiliza, nunca escribe Firestore directo |

**Producido** — el epic 03 depende exactamente de estas firmas:

| Export | Firma | Usado por |
|---|---|---|
| `packages/web-kit/src/payments` → `PaymentProvider` | interfaz con `createCheckoutSession()`, `verifyWebhookSignature()` | `E2-T6` (mismo epic), `03-integracion-y-release` (nav condicional) |
| `packages/web-kit/src/crm` → `CrmAdapter` | interfaz con `syncLead(lead: Lead): Promise<void>` | Documentado en `docs/modules/crm.md` (epic 03) como base para el futuro adapter Pipedrive |

## Convenciones que muerden en esta área

- El admin **nunca** escribe `citas` directamente — siempre a través del `POST /api/citas` de
  `01-foundation`. Un segundo escritor rompe la garantía de "único escritor por colección".
- `crm.externalSync` apagado (default) significa **cero** llamadas de red a HubSpot, ni siquiera con
  `HUBSPOT_API_KEY` presente — verificado con un test que espía el módulo HTTP.
- `resend-client.ts` y `stripe-provider.ts` son server-only — nunca importados desde un archivo
  `"use client"`.
- El envío de email es un efecto secundario, nunca transaccional: un fallo de Resend no revierte la
  escritura en Firestore que lo disparó.

Reglas completas del proyecto: `CLAUDE.md`. Reglas de área: `.claude/rules/{name}.md`.

---

## Tareas

### `E2-T1` — Módulo admin-panel

**Depende de:** E1-T4, E1-T5 · **Prioridad:** p0

Crea `packages/web-kit/src/admin-panel/`: `Dashboard.tsx`, `CitasTable.tsx`,
`EspecialistasCrud.tsx`, `SedesCrud.tsx`, `index.ts`. Crea las páginas de `/admin` correspondientes.

**Files**
- `packages/web-kit/src/admin-panel/**` — nuevo
- `apps/template/src/app/admin/**` — nuevo
- `apps/template/e2e/admin.spec.ts` — nuevo
- `packages/web-kit/src/index.ts` — editado

**Acceptance**

1. **WHEN** un usuario con rol `admin` visita `/admin` **THE SYSTEM SHALL** mostrar el conteo de citas de los próximos 7 días.
2. **WHEN** un usuario con rol `specialist` visita `/admin` **THE SYSTEM SHALL** redirigir a `/portal`.
3. **WHEN** un admin crea una Cita manualmente desde `/admin/citas` **THE SYSTEM SHALL** usar el mismo `POST /api/citas` sin un segundo escritor de la colección.
4. **WHEN** solo existe una Sede **THE SYSTEM SHALL** ocultar el selector de sede en los formularios de `/admin/citas` y preseleccionar la única Sede.
5. **WHEN** `pnpm exec playwright test apps/template/e2e/admin.spec.ts` corre **THE SYSTEM SHALL** pasar el flujo de crear y listar una Cita desde el admin.

**Verify**

```bash
pnpm exec vitest run packages/web-kit/src/admin-panel
pnpm --filter template build
pnpm exec playwright test apps/template/e2e/admin.spec.ts
pnpm typecheck
```

**Checkpoint**

```bash
git add -A && git commit -m "E2-T1: admin-panel module"
git tag step-07-admin-panel
```

### `E2-T2` — Módulo crm y adapter de HubSpot

**Depende de:** E1-T3 · **Prioridad:** p1

Crea `packages/web-kit/src/crm/`: `types.ts` (`Lead`), `repository.ts`, `hubspot-adapter.ts`
(implementa `CrmAdapter`, gateado por `crm.externalSync`), `index.ts`. Crea
`apps/template/src/app/api/leads/route.ts`.

**Files**
- `packages/web-kit/src/crm/**` — nuevo
- `apps/template/src/app/api/leads/route.ts` — nuevo
- `packages/web-kit/src/index.ts` — editado

**Acceptance**

1. **WHEN** `POST /api/leads` recibe un `email` o `phone` válido **THE SYSTEM SHALL** crear o actualizar un Lead con `status: "new"` si es nuevo.
2. **WHEN** `crm.externalSync` está apagado (default) **THE SYSTEM SHALL** nunca llamar a la API de HubSpot, ni con `HUBSPOT_API_KEY` presente.
3. **WHEN** `crm.externalSync` está encendido y se crea un Lead **THE SYSTEM SHALL** llamar al adapter de HubSpot con el mapeo de etapa `new -> "lead"`.
4. **WHEN** el `CrmAdapter` recibe un status no mapeado **THE SYSTEM SHALL** lanzar un error tipado en vez de sincronizar un valor arbitrario.
5. **WHEN** una Cita se crea con `clientUid` correspondiente a un Lead existente por email **THE SYSTEM SHALL** actualizar ese Lead a `status: "scheduled"`.

**Verify**

```bash
pnpm exec vitest run packages/web-kit/src/crm
pnpm typecheck
```

**Checkpoint**

```bash
git add -A && git commit -m "E2-T2: crm module + HubSpot adapter"
git tag step-08-crm
```

### `E2-T3` — Módulo notifications (Resend)

**Depende de:** E1-T5 · **Prioridad:** p1

Crea `packages/web-kit/src/notifications/`: `resend-client.ts`, `send-appointment-email.ts`,
`templates.ts`, `index.ts`. Edita `apps/template/src/app/api/citas/route.ts` y `.../[id]/route.ts`
para disparar el envío.

**Files**
- `packages/web-kit/src/notifications/**` — nuevo
- `apps/template/src/app/api/citas/route.ts` — editado
- `apps/template/src/app/api/citas/[id]/route.ts` — editado
- `packages/web-kit/src/index.ts` — editado

**Acceptance**

1. **WHEN** se crea una Cita vía `POST /api/citas` **THE SYSTEM SHALL** llamar a `sendAppointmentEmail` con el template "confirmada", dirigido al cliente y al admin de la Sede.
2. **WHEN** `PATCH /api/citas/[id]` cambia `status` a `"cancelled"` **THE SYSTEM SHALL** enviar el template "cancelada".
3. **WHEN** `RESEND_API_KEY` está ausente al importar `resend-client.ts` **THE SYSTEM SHALL** lanzar un error nombrado.
4. **WHEN** el envío de email falla **THE SYSTEM SHALL** registrar el error pero no revertir la creación de la Cita.
5. **WHEN** `pnpm exec vitest run packages/web-kit/src/notifications` corre **THE SYSTEM SHALL** pasar con 0 fallos.

**Verify**

```bash
pnpm exec vitest run packages/web-kit/src/notifications
pnpm typecheck
```

**Checkpoint**

```bash
git add -A && git commit -m "E2-T3: notifications module (Resend)"
git tag step-09-notifications
```

### `E2-T4` — Módulo seo-analytics

**Depende de:** E1-T2 · **Prioridad:** p1

Crea `packages/web-kit/src/seo-analytics/`: `metadata-helper.ts`, `local-business-jsonld.ts`,
`ga4-script.tsx`, `index.ts`. Crea `apps/template/src/app/sitemap.ts` y `robots.ts`.

**Files**
- `packages/web-kit/src/seo-analytics/**` — nuevo
- `apps/template/src/app/sitemap.ts` — nuevo
- `apps/template/src/app/robots.ts` — nuevo
- `packages/web-kit/src/index.ts` — editado

**Acceptance**

1. **WHEN** `apps/template` se builda **THE SYSTEM SHALL** generar `/sitemap.xml` con al menos las rutas `/`, `/agenda`, `/portal`.
2. **WHEN** se solicita `/robots.txt` **THE SYSTEM SHALL** responder con `Allow: /` y una referencia a `/sitemap.xml`.
3. **WHEN** una página no define `title`/`description` vía `metadata-helper` **THE SYSTEM SHALL** fallar el build.
4. **WHEN** `NEXT_PUBLIC_GA_MEASUREMENT_ID` está ausente **THE SYSTEM SHALL** omitir el script de GA4 sin romper el render.
5. **WHEN** se renderiza la home **THE SYSTEM SHALL** incluir un bloque JSON-LD `LocalBusiness` válido.

**Verify**

```bash
pnpm --filter template build
pnpm --filter template start &
sleep 2
test "$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/sitemap.xml)" = "200"
test "$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/robots.txt)" = "200"
curl -s http://localhost:3000/ | grep -q "LocalBusiness"
kill %1
```

**Checkpoint**

```bash
git add -A && git commit -m "E2-T4: seo-analytics module"
git tag step-10-seo-analytics
```

### `E2-T5` — Módulo payments (Stripe)

**Depende de:** E1-T3 · **Prioridad:** p0

Crea `packages/web-kit/src/payments/`: `types.ts` (`PaymentProvider`), `stripe-provider.ts`,
`index.ts`. Crea `apps/template/src/app/api/checkout/route.ts` y
`apps/template/src/app/api/webhooks/stripe/route.ts`.

**Files**
- `packages/web-kit/src/payments/**` — nuevo
- `apps/template/src/app/api/checkout/route.ts` — nuevo
- `apps/template/src/app/api/webhooks/stripe/route.ts` — nuevo
- `apps/template/src/app/api/webhooks/stripe/route.test.ts` — nuevo
- `packages/web-kit/src/index.ts` — editado

**Acceptance**

1. **WHEN** `POST /api/webhooks/stripe` recibe un `Stripe-Signature` inválido **THE SYSTEM SHALL** responder `400` y escribir cero documentos.
2. **WHEN** `checkout.session.completed` llega con un `event.id` nuevo **THE SYSTEM SHALL** crear/actualizar un Pedido exactamente una vez.
3. **WHEN** el mismo `event.id` se entrega dos veces **THE SYSTEM SHALL** responder `200` ambas veces y dejar el conteo de documentos sin cambios.
4. **WHEN** `STRIPE_WEBHOOK_SECRET` está ausente al importar el Route Handler **THE SYSTEM SHALL** fallar el arranque del build con un error nombrado.
5. **WHEN** un evento no manejado llega **THE SYSTEM SHALL** responder `200`.
6. **WHEN** `pnpm exec vitest run apps/template/src/app/api/webhooks/stripe` corre **THE SYSTEM SHALL** reportar 0 fallos.

**Verify**

```bash
pnpm exec vitest run apps/template/src/app/api/webhooks/stripe
pnpm typecheck
```

**Checkpoint**

```bash
git add -A && git commit -m "E2-T5: payments module (Stripe)"
git tag step-11-payments
```

### `E2-T6` — Módulo ecommerce

**Depende de:** E2-T5 · **Prioridad:** p2

Crea `packages/web-kit/src/ecommerce/`: `types.ts` (`Producto`, `Pedido`), `repository.ts`,
`CartProvider.tsx`, `index.ts`. Crea `apps/template/src/app/tienda/page.tsx`.

**Files**
- `packages/web-kit/src/ecommerce/**` — nuevo
- `apps/template/src/app/tienda/page.tsx` — nuevo
- `apps/template/e2e/tienda.spec.ts` — nuevo
- `packages/web-kit/src/index.ts` — editado

**Acceptance**

1. **WHEN** `/tienda` se visita con al menos un Producto activo **THE SYSTEM SHALL** listar sus productos filtrados por la Sede por defecto.
2. **WHEN** un producto tiene `inventoryCount: 0` **THE SYSTEM SHALL** deshabilitar su botón de "Agregar al carrito".
3. **WHEN** se agrega un producto al carrito y se hace checkout **THE SYSTEM SHALL** usar el módulo `payments` sin un segundo camino de pago.
4. **WHEN** no hay ningún Producto activo **THE SYSTEM SHALL** ocultar la sección de catálogo completa.
5. **WHEN** `pnpm exec playwright test apps/template/e2e/tienda.spec.ts` corre **THE SYSTEM SHALL** pasar el flujo de agregar un producto al carrito.

**Verify**

```bash
pnpm exec vitest run packages/web-kit/src/ecommerce
pnpm --filter template build
pnpm exec playwright test apps/template/e2e/tienda.spec.ts
pnpm typecheck
```

**Checkpoint**

```bash
git add -A && git commit -m "E2-T6: ecommerce module"
git tag step-12-ecommerce
```

---

## Aceptación del epic

1. **WHEN** se crea un Lead vía `/api/leads`, se agenda su cita, y un admin la confirma **THE SYSTEM SHALL** completar el flujo (Lead → `scheduled` → email enviado) sin ningún error 5xx.
2. **WHEN** se completa un checkout de Stripe en modo test **THE SYSTEM SHALL** dejar exactamente un `Pedido` con `status: "paid"`.

```bash
pnpm typecheck && pnpm lint && pnpm test
pnpm --filter template build
pnpm exec playwright test apps/template/e2e/admin.spec.ts apps/template/e2e/tienda.spec.ts
```

## Trampas

- **No crear un segundo escritor de `citas`** en el admin — reutiliza `POST /api/citas`.
- **No sincronizar con HubSpot cuando `crm.externalSync` está apagado** — verifica el flag antes de
  cualquier import dinámico del cliente HTTP de HubSpot, no solo antes de la llamada.
- **El webhook de Stripe necesita el body crudo** — no uses el parser JSON por defecto de Next.js en
  esa ruta, o la verificación de firma falla siempre.

## Antes de avanzar

- [ ] Todas las tareas de este epic están `done` en `tasks.json`.
- [ ] Cada `verify` de cada tarea pasó, no solo el primero.
- [ ] `git tag -l 'step-0[7-9]-*' 'step-1[0-2]-*'` lista 6 tags.
- [ ] Gate del epic limpio, corrido desde la raíz.
- [ ] Cada contrato "Producido" existe con la firma indicada.
- [ ] Ningún archivo fuera del subárbol fue modificado.
- [ ] `.env.example` actualizado con `RESEND_API_KEY`, `NOTIFICATIONS_FROM_EMAIL`,
      `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
      `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `HUBSPOT_API_KEY`.
- [ ] Un commit por tarea, cada uno con su tag de checkpoint.
