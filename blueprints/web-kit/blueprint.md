# Web Kit — Blueprint

> Generado por The Architect el 2026-09-12
> Shape: cli-library-mcp (perfil librería privada + template) · `knowledge/shapes/cli-library-mcp.md`
> Runtime track: ts-node · `knowledge/runtime-tracks/ts-node.md`
> Emisión: bundle
> Versión del blueprint: 1
> Versiones verificadas por última vez: 2026-09-12 — ver §11 para la procedencia por paquete

---

## 1. Visión general del proyecto y no-objetivos

### Visión
Web Kit es el starter-kit interno y privado de una agencia de dos desarrolladores (la agencia de
Mauro Gorrín) para levantar rápido nuevos sitios de cliente en Next.js + Firebase, reutilizando una
librería compartida de módulos en lugar de reconstruir cada sitio desde cero. La agencia construye
sitios a medida (marketing + front público, portal de cliente/paciente con login, panel de admin con
roles, agendamiento vía Calendly, notificaciones, SEO/analítica básica y a veces e-commerce, CRM o
múltiples sedes físicas) para pequeños negocios — hoy un taller de costura, mañana una clínica de
trasplante capilar. Web Kit extrae esas piezas comunes en un paquete privado versionado
(`@mgorrin/web-kit`) del que dependen todos los proyectos de cliente nuevos, más un repo plantilla y
un script de setup que permite elegir qué módulos están activos por cliente. Cuando un módulo recibe
una corrección o mejora, subir la versión del paquete deja que cada proyecto de cliente la adopte
cuando le convenga.

### Usuarios
| Persona | Qué viene a hacer | Frecuencia |
|---|---|---|
| Desarrollador de la agencia | Generar un proyecto de cliente nuevo, activar módulos, corregir un módulo compartido | Semanal |
| Mauro (dueño/desarrollador) | Publicar una versión nueva de `@mgorrin/web-kit`, revisar el changelog antes de actualizar un cliente | Quincenal |

### Objetivos — alcance v1
1. Un paquete privado `@mgorrin/web-kit` en GitHub Packages con 11 módulos (design-system siempre
   activo, 10 activables) consumible por `workspace:*` en el monorepo y como dependencia normal desde
   cualquier proyecto de cliente futuro.
2. Un repo plantilla (`apps/template`) que arranca, se builda y despliega con todos los módulos
   activos, listo para clonar.
3. Un script interactivo (`scripts/setup.js`) que genera un proyecto de cliente nuevo eligiendo qué
   módulos activar.
4. Un flujo de release automatizado (Changesets + GitHub Actions) que versiona y publica el paquete
   sin pasos manuales más allá de mergear un PR.
5. Aislamiento total de datos entre clientes: un proyecto de Firebase por cliente, nunca compartido.

### No-objetivos — explícitamente fuera de alcance para v1
| No se construye | Por qué no ahora | Revisar cuando |
|---|---|---|
| Base de datos multi-tenant compartida | Cada cliente tiene su propio proyecto de Firebase; mezclar datos de clientes distintos es un riesgo que no compensa el ahorro de infraestructura a esta escala | Nunca se prevé — es una decisión de aislamiento, no de costo |
| Datos clínicos/médicos en `client-portal` | Riesgo legal y de privacidad (HIPAA-like) sin validación de negocio que lo justifique; el portal es de citas y cuenta, no un expediente | Un cliente médico pide explícitamente historial clínico y la agencia contrata asesoría legal |
| Integración WhatsApp/SMS | No hay validación de que los clientes actuales lo necesiten; añade un proveedor y costo recurrente | Dos o más clientes lo piden explícitamente |
| Adapter de CRM Pipedrive | Solo HubSpot tiene un cliente real hoy; la interfaz `CrmAdapter` ya soporta añadirlo sin tocar el resto del código | Un cliente use Pipedrive en vez de HubSpot |
| Adapters de pago Yappy / Pagüelo Fácil | Sin cliente panameño con esa necesidad todavía; la interfaz `PaymentProvider` ya deja el espacio libre | Un cliente requiere cobro local panameño |
| Multi-almacén / cálculo de tarifas de envío en `ecommerce` | Los clientes actuales son negocios de un solo almacén con envío manual/plano | Un cliente con e-commerce multi-bodega |
| Publicación pública de `@mgorrin/web-kit` en npm | Es tooling interno de dos personas; publicarlo públicamente añade superficie de soporte sin beneficio | La agencia decide venderlo como producto a otras agencias |
| Turborepo/Nx (build-caching) | pnpm workspaces solo, equipo de 2 personas, build times aún no son un problema | Los tiempos de build se vuelven un cuello de botella real |
| Ventana formal de deprecación de versiones | Rompimientos son un major; los clientes actualizan cuando quieren, no hay calendario que mantener | La agencia empieza a vender el kit a terceros con SLA |

**El builder no debe implementar nada de esta tabla**, aunque parezca una adición pequeña mientras
trabaja en un paso adyacente. Si un paso parece requerir un no-objetivo, es un defecto del blueprint —
detente y repórtalo en vez de expandir el alcance.

### Métricas de éxito
| Métrica | Objetivo | Cómo se mide |
|---|---|---|
| Tiempo de generar un proyecto de cliente nuevo, arrancable | < 30 minutos desde `pnpm setup:client` hasta `pnpm dev` funcionando | Cronometrado manualmente la primera vez que se usa en un cliente real |
| Módulos reutilizados sin reescritura entre el 2º y 3er cliente | 100% de los módulos activados se usan tal cual, sin fork | Revisión del diff del segundo proyecto de cliente generado |
| Tiempo entre bugfix en `@mgorrin/web-kit` y disponibilidad para clientes | < 1 día (changeset + merge + publish automático) | Timestamp del changeset vs timestamp de publicación en GitHub Packages |

---

## 2. Stack tecnológico

**Runtime track: ts-node.** Esta tabla nombra *decisiones*, no versiones — cada pin vive únicamente
en §11. Los pines vienen del informe de `stack-researcher` producido en esta sesión (verificado en
vivo el 2026-09-12), que es la autoridad; `knowledge/runtime-tracks/ts-node.md` es el respaldo para lo
que ese informe no resolvió.

| Capa | Elección | Por qué esto, sobre qué alternativa |
|---|---|---|
| Lenguaje / runtime | TypeScript 5.9.3 sobre Node 22 LTS | Confirmado por ejecución real (smoke test): TypeScript 6.0.3 rompe el build de Next.js 15.5.9 — falla el type-check de un import de efecto secundario de CSS (`import "./globals.css"`) que el tooling interno de Next maneja de forma especial y que 6.0.3 ya no soporta igual. 5.9.3 compila limpio tanto en `apps/template` como en `packages/web-kit`. TS7 (7.0.2) queda descartado por la misma razón original — no tiene API de compilador JS estable hasta 7.1. Node 22 porque vitest 5 exige `^22.12 \|\| ^24 \|\| >=26`. |
| Framework | Next.js 15.5.9 | Se evita 16.x deliberadamente: tiene una fricción activa de toolchain con TypeScript 7 (`experimental.useTypeScriptCli`) que no aporta nada a un kit interno que fija TS6. |
| Estilos | Tailwind CSS 4.3 (config CSS-first) | Config-en-CSS elimina un archivo `tailwind.config.js` que cada tema de cliente tendría que reescribir; las variables CSS de `theme.config.ts` bastan para re-temar. |
| Capa de componentes | `radix-ui` (paquete unificado) + `class-variance-authority`, siguiendo convenciones de shadcn pero vendorizado en el paquete | El ecosistema migró al paquete unificado en 2026-02; vendorizar (no el modelo copy-paste de la CLI de shadcn) es correcto aquí porque el paquete YA ES la librería compartida — no queremos que cada cliente tenga su propia copia divergente. |
| Base de datos | Firestore (Firebase), un proyecto por cliente | Sin servidor que administrar, reglas de seguridad declarativas, encaja con el perfil de "sitio pequeño de negocio" mejor que Postgres gestionado para este tamaño de equipo. |
| Acceso a datos | SDK cliente `firebase` + `firebase-admin` en el servidor | No hay ORM porque no hay SQL; el propio SDK tipado (con validación manual en los repositorios de cada módulo) es la capa de acceso. |
| Auth | Firebase Auth + Google OAuth | Un solo proveedor de identidad, sin fricción de dos sistemas de sesión (ver `knowledge/stack-compatibility.md`, fila "Dos proveedores de identidad"). |
| Trabajo en segundo plano | Ninguno (Route Handlers síncronos) | El volumen de negocio pequeño no justifica una cola; las notificaciones se disparan inline desde el Route Handler que crea/actualiza la Cita. |
| Pagos | Stripe (Node SDK 22.6 + `@stripe/stripe-js` 9.16) | Cobertura internacional con tarjetas, único proveedor con soporte real en Latinoamérica para v1; interfaz `PaymentProvider` deja espacio a Yappy/Pagüelo Fácil sin tocar el resto. |
| Almacenamiento de archivos | Firebase Storage (implícito por el proyecto de Firebase) | Viene incluido en el mismo proyecto de Firebase que Auth/Firestore — cero configuración adicional. |
| Email / notificaciones | Resend 6.28 | API simple, sin necesidad de gestionar SMTP; se dispara desde un Route Handler, no una Cloud Function, para mantener la infraestructura simple. |
| Hosting | Vercel (app plantilla) / GitHub Packages (paquete) | Next.js despliega en Vercel sin configuración; el paquete se distribuye vía GitHub Packages porque el repo ya vive en GitHub y no hay necesidad de un registro npm público. |
| Gestor de paquetes | pnpm 12.4.1 workspaces (sin Turborepo) | Equipo de 2 personas, build-caching no es un problema real todavía — ver No-objetivos. |

### Verificación de compatibilidad
Revisado contra `knowledge/stack-compatibility.md`:
- **Ninguna** de las combinaciones de la tabla "Known-bad combinations" aplica directamente, con una
  excepción parcial documentada: la fila "Linter/formatter que parsea CSS + motor de estilos CSS-first"
  es la razón por la que `eslint-config-next` (que usa el parser de `@eslint/eslintrc` vía compat, no
  un parser CSS propio) fue elegido sobre Biome para este proyecto — Biome habría requerido la
  configuración adicional `css.parser.tailwindDirectives` documentada en `runtime-tracks/ts-node.md`.
  Al usar ESLint (que no parsea CSS) el problema no aplica.
- Fila "Dos proveedores de identidad": evitada — solo Firebase Auth con Google OAuth, ningún otro SDK
  de auth se instala.
- Fila "Driver de base de datos raw-TCP en un runtime sin sockets": no aplica — el SDK de Firebase usa
  HTTP/WebSocket, no TCP crudo, y los Route Handlers de Next.js corren en runtime Node, no edge.
- Fila "ORM SQL + plataforma SDK-only (Firestore y similares)": no aplica — no se usa ningún ORM SQL
  en este proyecto; el acceso a datos es directamente vía el SDK de Firestore, consistente con la
  recomendación de esa misma fila ("usa el SDK de la plataforma").

---

## 3. Estructura de directorios

```
web-kit/                                  # raíz del repo (creado por Bootstrap, §10)
├── packages/
│   └── web-kit/                          # publica como @mgorrin/web-kit
│       ├── src/
│       │   ├── index.ts                  # NUEVO paso 1 — allowlist pública, congelada desde paso 2
│       │   ├── design-system/            # NUEVO paso 2 — tokens, Button/Card/Input/Dialog
│       │   ├── auth-rbac/                # NUEVO paso 3 — wrapper de Firebase Auth, RBAC
│       │   ├── multi-location/           # NUEVO paso 4 — entidad Sede
│       │   ├── scheduling/               # NUEVO paso 5 — embed Calendly + entidad Cita
│       │   ├── client-portal/            # NUEVO paso 6 — página de portal autenticada
│       │   ├── admin-panel/              # NUEVO paso 7 — dashboard + CRUD
│       │   ├── crm/                      # NUEVO paso 8 — entidad Lead + adapter HubSpot
│       │   ├── notifications/            # NUEVO paso 9 — envío de emails vía Resend
│       │   ├── seo-analytics/            # NUEVO paso 10 — sitemap/robots/JSON-LD/GA4
│       │   ├── payments/                 # NUEVO paso 11 — Stripe checkout + adapter
│       │   └── ecommerce/                # NUEVO paso 12 — Producto/Pedido + carrito
│       ├── firestore.rules               # EXISTE desde §19.6 — se extiende por módulo
│       ├── firestore.indexes.json        # EXISTE desde §19.6
│       ├── tsconfig.json / tsconfig.build.json
│       └── package.json
├── apps/
│   └── template/                         # la app Next.js desde la que se clonan proyectos de cliente
│       ├── src/app/...                   # rutas; edit: el scaffold de create-next-app + pasos 2-13
│       ├── modules.config.ts             # NUEVO paso 13 — qué módulos están activos
│       ├── theme.config.ts               # NUEVO paso 2 — variables CSS re-temables
│       └── package.json                  # AUTORADO por el scaffold de create-next-app, editado en paso 1
├── scripts/
│   └── setup.js                          # NUEVO paso 16 — scaffolder interactivo
├── docs/
│   ├── surface.md                        # NUEVO paso 1, congelado desde paso 2 — exports públicos
│   └── modules/*.md                      # NUEVO paso 17 — un doc por módulo
├── tests/
│   ├── setup.ts                          # EXISTE desde §19.6 — loader de env para vitest
│   └── rules/*.test.ts                   # NUEVO por módulo, empezando paso 3
├── .github/workflows/
│   ├── ci.yml                            # EXISTE desde §19.6, extendido en paso 14
│   └── release.yml                       # EXISTE desde §19.6, verificado en paso 15
├── .changeset/config.json                # EXISTE desde §19.6
├── .husky/pre-commit                     # EXISTE desde §19.6
├── pnpm-workspace.yaml                   # EXISTE desde §19.6
├── package.json                          # EXISTE desde §19.6 (raíz del workspace)
├── tsconfig.base.json                    # EXISTE desde §19.6
├── vitest.config.ts / playwright.config.ts / eslint.config.mjs / .prettierrc  # EXISTE desde §19.6
├── firebase.json                         # EXISTE desde §19.6
├── .nvmrc / .npmrc / .env.example / .gitignore   # EXISTE desde §19.6
└── blueprints/web-kit/                   # este propio bundle — commiteado, excluido de todo tooling
```

**Reglas de límite**
- `packages/web-kit/src/**` nunca importa de `apps/template/**` — la dependencia va en un solo
  sentido.
- Cada módulo de `packages/web-kit/src/<módulo>/` expone su superficie solo a través de su propio
  `index.ts`; nada fuera del módulo importa un archivo interno suyo.
- Archivos `"use client"` nunca importan `firebase-admin`, `resend`, ni `stripe` (server-only).

**Convención de resolución.** Este blueprint fija, para todo el repo: **especificadores relativos con
extensión `.ts`**, habilitados por `allowImportingTsExtensions` + `rewriteRelativeImportExtensions` en
`tsconfig.base.json` (ya emitido en §19.6). Esta es la convención documentada por
`knowledge/runtime-tracks/ts-node.md` para este track exacto y se reconcilia contra los 4 contextos
(fuente, tests, scripts standalone, build) en la matriz de §19.6.

**Cada ruta de salida dibujada en este árbol coincide con el valor que la emite** — ver la tabla de
reconciliación de valores cruzados en §19.6: `packages/web-kit/dist/` viene de
`packages/web-kit/tsconfig.build.json` → `outDir: "dist"`, y es el mismo valor que
`package.json` → `exports["."]` usa como base.

**Origen de cada archivo de este árbol:** todo archivo bajo `packages/web-kit/src/`, `apps/template/src/`,
`scripts/`, `docs/` y `tests/rules/` es autorado por el paso de §9 indicado arriba (y aparece en el
`files` de esa tarea en `tasks.json`). Todo lo demás en este árbol es emitido como archivo real bajo
`workspace/` (§19.6) y llega al proyecto por la única copia que corre antes del paso 1.

---

## 4. Modelo de datos

Firestore, sin esquema SQL. Cada entidad es una colección; los campos se validan en el repositorio de
su módulo antes de escribir (no hay validación declarativa a nivel de Firestore más allá de las
`firestore.rules`).

### Entidades

**`User`** (colección `users`, doc id = Firebase Auth `uid`) — perfil interno de un usuario autenticado
de la agencia o del cliente final.

| Campo | Tipo | Restricciones | Notas |
|---|---|---|---|
| `uid` | string | PK, igual al doc id | Viene de Firebase Auth |
| `email` | string | not null | Sincronizado desde el token de Google OAuth |
| `displayName` | string | not null | |
| `role` | `"super_admin" \| "admin" \| "specialist"` | not null, default `"specialist"` | Extensible — ver §8 |
| `sedeId` | string \| null | FK → `sedes` | null si el usuario no está atado a una sede fija |
| `createdAt` | Timestamp | not null | |

**`Sede`** (colección `sedes`) — ubicación física.

| Campo | Tipo | Restricciones | Notas |
|---|---|---|---|
| `id` | string | PK, autogenerado | |
| `name` | string | not null | |
| `address` | string | not null | |
| `hours` | string | not null | Texto libre, formato "Lun-Vie 9am-6pm" |
| `contact` | string | not null | Teléfono o email de la sede |
| `isDefault` | boolean | not null, default `false` | Exactamente una Sede tiene `isDefault: true` por cliente |

**`Especialista`** (colección `especialistas`) — profesional/personal atendible por cita.

| Campo | Tipo | Restricciones | Notas |
|---|---|---|---|
| `id` | string | PK | |
| `name` | string | not null | |
| `sedeId` | string | FK → `sedes`, not null | |
| `active` | boolean | not null, default `true` | |

**`Cita`** (colección `citas`) — cita agendada.

| Campo | Tipo | Restricciones | Notas |
|---|---|---|---|
| `id` | string | PK | |
| `clientUid` | string \| null | FK → `users` | null si vino de teléfono/WhatsApp y aún no tiene cuenta |
| `sedeId` | string | FK → `sedes`, not null | |
| `especialistaId` | string \| null | FK → `especialistas` | |
| `datetime` | Timestamp | not null | |
| `status` | `"scheduled" \| "confirmed" \| "cancelled" \| "completed"` | not null, default `"scheduled"` | |
| `source` | `"calendly" \| "manual"` | not null | |
| `notes` | string | default `""` | Texto libre del admin — nunca dato clínico |
| `createdAt` / `updatedAt` | Timestamp | not null | |

**`Lead`** (colección `leads`) — prospecto del pipeline de CRM.

| Campo | Tipo | Restricciones | Notas |
|---|---|---|---|
| `id` | string | PK | |
| `name` / `email` / `phone` | string | `name` y uno de `email`/`phone` not null | |
| `status` | `"new" \| "contacted" \| "scheduled" \| "client"` | not null, default `"new"` | |
| `notes` | string | default `""` | |
| `interactions` | array de `{ at: Timestamp, note: string }` | default `[]` | Historial de interacción |
| `hubspotContactId` | string \| null | null hasta que `crm.externalSync` sincroniza | |
| `createdAt` / `updatedAt` | Timestamp | not null | |

**`Producto`** (colección `productos`, solo si `ecommerce` activo).

| Campo | Tipo | Restricciones | Notas |
|---|---|---|---|
| `id` | string | PK | |
| `name` / `priceCents` | string / number | not null | Precio en centavos, moneda única (ver No-objetivos) |
| `images` | string[] | default `[]` | URLs de Firebase Storage |
| `sedeId` | string | FK → `sedes`, not null | Inventario por sede |
| `inventoryCount` | number | not null, default `0` | |

**`Pedido`** (colección `pedidos`, solo si `ecommerce` activo).

| Campo | Tipo | Restricciones | Notas |
|---|---|---|---|
| `id` | string | PK | |
| `clientUid` | string | FK → `users`, not null | |
| `items` | array de `{ productoId, quantity, priceCents }` | not null | Snapshot del precio al momento del pedido |
| `totalCents` | number | not null | |
| `shippingNote` | string | default `""` | Texto libre — nunca cálculo de tarifa (ver No-objetivos) |
| `status` | `"pending" \| "paid" \| "cancelled"` | not null, default `"pending"` | |
| `stripePaymentIntentId` | string \| null | | |
| `createdAt` | Timestamp | not null | |

### Relaciones
- `User` —(0..1)→ `Sede` (asignación fija opcional)
- `Sede` —(1..N)→ `Especialista`, `Cita`, `Producto` — borrar una Sede con hijos activos está
  bloqueado a nivel de aplicación (el repositorio de `multi-location` verifica que no existan
  `Especialista`/`Cita`/`Producto` con esa `sedeId` antes de permitir el borrado)
- `Cita` —(0..1)→ `User` (`clientUid` puede ser null)
- `Lead` no tiene relación directa con `Cita`; una Cita creada desde un `Lead` actualiza el `status`
  del Lead a `"scheduled"` pero no guarda una referencia inversa (evita acoplamiento entre módulos)
- `Pedido` —(N..1)→ `User`, contiene un snapshot de `Producto` en `items` (no una referencia viva)

### Índices
| Colección | Índice | Por qué |
|---|---|---|
| `citas` | `sedeId` asc + `datetime` asc | Listado de agenda por sede en el admin-panel |
| `leads` | `status` asc + `updatedAt` desc | Vista de pipeline del CRM ordenada por actividad reciente |
| `productos` | `sedeId` asc + `name` asc | Catálogo filtrado por sede |

### Esquema
No hay DDL SQL — el "esquema" son los tipos TypeScript exportados por cada módulo
(`packages/web-kit/src/<módulo>/types.ts`) más las reglas de seguridad en
`packages/web-kit/firestore.rules` (emitidas en §19.6, extendidas por módulo en cada paso de §9).

### Migraciones
No hay migraciones estructurales (Firestore es schemaless). Los "cambios de esquema" son cambios a los
tipos TypeScript + a las reglas de seguridad, versionados como cualquier otro cambio de
`@mgorrin/web-kit` vía Changesets. Los índices compuestos se despliegan con
`firebase deploy --only firestore:indexes` (paso manual de checklist de lanzamiento, §20.1).

### Datos semilla
El emulador local no lleva semilla automática en v1: `tests/rules/*.test.ts` crea sus propios
documentos de prueba por test (aislados por el emulador, reseteado en cada `firebase emulators:exec`).
No hay comando `db:seed` porque no hay entorno de desarrollo compartido — cada desarrollador corre el
emulador localmente y crea sus propios datos de prueba a mano al usar `pnpm dev`.

---

## 5. Diseño de API

### Convenciones
- Base path: `/api` (Route Handlers de Next.js, no hay versión de API — es interno, un solo consumidor: el propio frontend)
- Envelope de respuesta: éxito `{ ok: true, data: T }` · error `{ ok: false, error: { code: string, message: string } }`
- Códigos de error: `VALIDATION_ERROR` (400), `UNAUTHENTICATED` (401), `FORBIDDEN` (403), `NOT_FOUND` (404), `CONFLICT` (409), `INTERNAL` (500)
- Validación: cada Route Handler valida su body a mano con un parser de campo por campo (no se introduce una librería de esquemas adicional — ver Dependencias §11, "Deliberadamente no usado")
- Paginación: no aplica en v1 — los listados (citas, leads, productos) son de bajo volumen por cliente y se traen completos, ordenados por el índice correspondiente
- Idempotencia: el webhook de Stripe deduplica por `event.id` (ver §11 del build order, paso 11)
- Rate limiting: no aplica en v1 — tráfico de un solo negocio pequeño, sin exposición pública de escritura salvo el formulario de contacto/booking

### Rutas
| Método | Ruta | Descripción | Auth | Rate limit |
|---|---|---|---|---|
| `POST` | `/api/citas` | Crea una Cita (desde el portal o el admin) | user | — |
| `PATCH` | `/api/citas/[id]` | Actualiza estado/datos de una Cita | admin | — |
| `POST` | `/api/leads` | Crea/actualiza un Lead (formulario de contacto público) | public | — |
| `POST` | `/api/webhooks/stripe` | Webhook de Stripe, verificado por firma | firma Stripe | — |
| `POST` | `/api/checkout` | Crea una Checkout Session de Stripe | user | — |

### Endpoints críticos — detalle completo

**`POST /api/citas`** — crea una Cita.
- Request: `{ sedeId: string, especialistaId?: string, datetime: string (ISO), notes?: string }`
- Response éxito: `201 { ok: true, data: { id, status: "scheduled", ... } }`
- Errores: `sedeId` inexistente → `404 NOT_FOUND`; `datetime` no parseable → `400 VALIDATION_ERROR`;
  sin sesión → `401 UNAUTHENTICATED`
- Efectos: escribe un documento en `citas`; dispara `notifications.sendAppointmentEmail` (paso 9) al
  cliente y al admin de la Sede

**`POST /api/webhooks/stripe`** — recibe eventos de Stripe.
- Verifica `Stripe-Signature` contra `STRIPE_WEBHOOK_SECRET` antes de parsear el body (raw body, sin
  el parser JSON por defecto de Next.js)
- Firma inválida → `400`, cero escrituras
- `checkout.session.completed` con `event.id` ya visto → `200`, cero escrituras nuevas (idempotente)
- `checkout.session.completed` nuevo → upsert de un `Pedido` con `status: "paid"`
- Evento no manejado → `200` (nunca 5xx, o Stripe reintenta días)

---

## 6. Arquitectura frontend

`apps/template` es una app Next.js (App Router) — el frontend que cada proyecto de cliente clona.

### Rutas
| Ruta | Página | Fuente de datos | Auth |
|---|---|---|---|
| `/` | Marketing/home | Estático + `theme.config.ts` | público |
| `/agenda` | Booking público (embed Calendly) | Estático | público |
| `/portal` | Portal de cliente | Firestore (`citas` del `clientUid` actual) | user |
| `/admin` | Dashboard admin | Firestore (resumen de citas/leads) | admin |
| `/admin/citas`, `/admin/especialistas`, `/admin/sedes`, `/admin/usuarios` | CRUD admin | Firestore | admin |
| `/tienda` | Catálogo (solo si `ecommerce` activo) | Firestore (`productos`) | público |
| `/api/*` | Route Handlers (ver §5) | — | según ruta |

### Estrategia de renderizado
- `/` y `/agenda`: Server Components estáticos, `revalidate` largo (rara vez cambian).
- `/portal` y `/admin/**`: Server Components dinámicos (`export const dynamic = "force-dynamic"`),
  leen la sesión en cada request — nunca cacheados, contienen datos por usuario.
- `/tienda`: Server Component con `revalidate: 60` (catálogo cambia poco).

### Jerarquía de componentes (páginas más importantes)
```
/admin (layout)
  AdminShell (server)              # navegación filtrada por modules.config.ts
    AdminNav (client)              # necesita estado de sidebar colapsado
    {page content}                 # server, por ruta

/portal
  PortalShell (server)
    NextAppointmentCard (server)
    NotificationList (client)      # necesita marcar como leído (evento)
```

### Gestión de estado
Estado de servidor: leído directamente en Server Components vía los repositorios de
`@mgorrin/web-kit` — no hay capa de fetching en cliente (no hay `@tanstack/react-query`, ver
Dependencias §11). Estado de cliente: `useState`/`useReducer` local; el carrito de `ecommerce` usa un
único React Context (`CartProvider`), sin librería externa — justificado por el tamaño pequeño del
estado (lista de líneas de pedido).

### Estados de carga, vacío y error
- `/admin/citas`: vacío → "Aún no hay citas registradas" con CTA a "Agendar manualmente"; carga →
  skeleton de tabla; error → mensaje + botón de reintentar.
- `/portal`: vacío (sin próxima cita) → "No tienes citas programadas" + enlace a `/agenda`.
- `/tienda`: vacío (sin productos) → oculta la sección de catálogo completa (no un placeholder vacío).

---

## 7. Sistema de diseño

Brand-neutral de partida: base neutral/slate + un acento configurable por cliente vía `theme.config.ts`.

### Colores
| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `--color-primary` | `#0F172A` | `#E2E8F0` | Botones primarios, enlaces, anillo de foco |
| `--color-primary-fg` | `#FFFFFF` | `#0F172A` | Texto sobre primario |
| `--color-accent` | `#2563EB` | `#3B82F6` | CTAs, estados activos — variable re-temable por cliente |
| `--color-background` | `#FFFFFF` | `#0B1120` | Página |
| `--color-surface` | `#F8FAFC` | `#111827` | Tarjetas, paneles, modales |
| `--color-border` | `#E2E8F0` | `#1F2937` | Divisores, bordes de input |
| `--color-fg` | `#0F172A` | `#F1F5F9` | Texto de cuerpo |
| `--color-fg-muted` | `#64748B` | `#94A3B8` | Texto secundario |
| `--color-destructive` | `#DC2626` | `#F87171` | Errores, borrar |
| `--color-success` | `#16A34A` | `#4ADE80` | Confirmaciones |

**Contraste:** `--color-fg` (#0F172A) sobre `--color-background` (#FFFFFF) = 15.8:1. `--color-fg-muted`
(#64748B) sobre `--color-background` = 4.6:1 (cumple AA texto normal). `--color-primary-fg` (#FFFFFF)
sobre `--color-primary` (#0F172A) = 15.8:1. Los tres pares críticos cumplen AA (4.5:1 texto, 3:1 UI).

### Tipografía
| Rol | Familia | Tamaño / interlineado | Peso | Tracking |
|---|---|---|---|---|
| Display | Inter | 48px / 1.1 | 700 | -0.02em |
| Heading | Inter | 32px / 1.2 | 600 | -0.01em |
| Body | Inter | 16px / 1.5 | 400 | normal |
| Mono | ui-monospace | 14px / 1.5 | 400 | normal |

**Carga de fuente:** self-hosted vía `next/font/google` (Inter), subset latin, `display: "swap"`,
fallback `system-ui, sans-serif`.

### Espaciado, radio, elevación
- Escala de espaciado: base 4px — 4/8/12/16/24/32/48/64
- Radio: 8px inputs y botones, 12px tarjetas, `9999px` (full) para avatares
- Sombras: `0 1px 2px rgb(0 0 0 / 0.05)` (elevación 1, tarjetas), `0 4px 12px rgb(0 0 0 / 0.1)` (elevación 2, modales)
- Ancho máximo de contenido: 1200px · Breakpoints: 640/768/1024/1280px

### Movimiento
150ms `ease-out` para hover/focus, 200ms `ease-in-out` para apertura de modal/drawer. Todo respeta
`prefers-reduced-motion: reduce` (transiciones se vuelven instantáneas).

### Estilo de componente
Minimalista, bordes finos de 1px, esquinas suavemente redondeadas, sin sombras decorativas — el
mismo lenguaje visual que shadcn/ui, vendorizado dentro de `packages/web-kit/src/design-system/`
sobre `radix-ui` + `class-variance-authority` en vez de copiado por CLI a cada proyecto.

---

## 8. Autenticación y autorización

### Proveedor y justificación
Firebase Auth con Google OAuth como único proveedor de inicio de sesión (`knowledge/capabilities/auth.md`
recomienda un solo proveedor de identidad por la fila correspondiente en `stack-compatibility.md`).

### Flujos
- **Inicio de sesión:** botón "Continuar con Google" → popup/redirect de Firebase Auth → al completar,
  se crea (si no existe) el documento `users/{uid}` con `role: "specialist"` por defecto → redirige a
  `/portal` (cliente) o `/admin` (si su rol ya es admin/super_admin, asignado a mano por otro admin).
- **Cierre de sesión:** `signOut()` de Firebase Auth, limpia la sesión, redirige a `/`.
- **Expiración de sesión:** el SDK de Firebase refresca el ID token automáticamente; si el refresh
  falla (revocado), el middleware de rutas protegidas redirige a `/` con `?session=expired`.
- **Borrado de cuenta:** fuera de alcance de v1 — un admin borra manualmente el documento `users/{uid}`
  y revoca el usuario desde la consola de Firebase (no hay flujo self-service).

### Protección de rutas
| Superficie | Regla | Reforzado en |
|---|---|---|
| `/admin/**` | rol = `admin` o `super_admin` | `apps/template/src/proxy.ts` + verificación server-side en cada layout |
| `/portal` | usuario autenticado | `apps/template/src/proxy.ts` |
| `/api/citas` (POST) | usuario autenticado | dentro del Route Handler, verifica el ID token |
| `/api/citas/[id]` (PATCH) | rol = `admin` o `super_admin` | dentro del Route Handler |

**Regla de refuerzo:** la autorización se verifica del lado del servidor en cada request. Los guards
de UI (ocultar un botón) son cosméticos y nunca la única verificación.

### Roles y permisos
| Rol | Puede | No puede |
|---|---|---|
| `super_admin` | Todo lo de `admin`, más: gestionar usuarios y roles, gestionar Sedes | — |
| `admin` | CRUD de Citas/Especialistas/Productos/Leads, ver dashboard | Gestionar usuarios/roles, gestionar Sedes |
| `specialist` | Ver su propia agenda, ver su portal de cliente | CRUD de administración, ver leads de otros |

### Sesiones
Token: Firebase ID token (JWT), gestionado por el SDK cliente de Firebase, con cookie de sesión
server-side (`firebase-admin` verifica el ID token en cada Route Handler protegido). Cookie
`HttpOnly`, `Secure`, `SameSite=Lax`. CSRF: mitigado por `SameSite=Lax` + verificación de origen en
Route Handlers de mutación.

### Multi-tenencia / aislamiento por fila
No aplica en el sentido tradicional: no hay una sola base de datos con múltiples tenants. El mecanismo
de aislamiento es un **proyecto de Firebase por cliente** — cada proyecto de cliente generado por
`scripts/setup.js` tiene sus propias credenciales de Firebase en su propio `.env`, apuntando a un
proyecto de Firebase distinto. No existe ningún campo `tenantId` en ningún esquema (ver No-objetivos,
§1).

---

## 9. ORDEN DE CONSTRUCCIÓN

### Las reglas de un paso
Un paso por sesión de trabajo (máx. 5 archivos/globs, máx. 6 criterios de aceptación). Cada paso lleva
`Do`, `Done when` (EARS), `Verify` (shell literal), `Checkpoint` (`git add -A && git commit` + `git tag
step-NN-slug`). Ningún `Verify` depende de lo que su propio `Checkpoint` produce. Ningún paso rompe
retroactivamente el `Verify` de un paso anterior — la validación de variables de entorno se activa
gradualmente según la columna "Requerido desde el paso" de §10.

**Declaración vs. congelamiento de la superficie pública** (regla del shape `cli-library-mcp`): el
paso 1 **declara** `docs/surface.md` (secciones de exports de valor y exports de solo-tipo, sin
módulos reales todavía). El paso 2 **congela** la superficie: a partir de ahí, el chequeo de drift
corre como gate en cada paso que toca `packages/web-kit/src/index.ts`, y cualquier export nuevo pasa
por el mismo paso que añade el módulo correspondiente.

### Mapa de pasos

| # | Paso | Depende de | Toca | Gate |
|---|---|---|---|---|
| 1 | Bootstrap del monorepo | — | pnpm-workspace, package.json raíz, packages/web-kit skeleton, apps/template scaffold | `pnpm --filter template build` + arranca el server |
| 2 | design-system | 1 | packages/web-kit/src/design-system/**, theme.config.ts | `pnpm test` + smoke Playwright de home |
| 3 | auth-rbac | 2 | packages/web-kit/src/auth-rbac/**, firestore.rules | `pnpm test:rules` |
| 4 | multi-location | 3 | packages/web-kit/src/multi-location/** | `pnpm test` |
| 5 | scheduling | 4 | packages/web-kit/src/scheduling/**, /api/citas | `pnpm test` + `curl` a `/api/citas` |
| 6 | client-portal | 3, 5 | packages/web-kit/src/client-portal/**, /portal | `pnpm test:e2e` |
| 7 | admin-panel | 4, 5 | packages/web-kit/src/admin-panel/**, /admin/** | `pnpm test:e2e` |
| 8 | crm | 3 | packages/web-kit/src/crm/**, /api/leads | `pnpm test` |
| 9 | notifications | 5 | packages/web-kit/src/notifications/** | `pnpm test` |
| 10 | seo-analytics | 2 | packages/web-kit/src/seo-analytics/**, sitemap.ts/robots.ts | `pnpm build` + `curl` sitemap |
| 11 | payments | 3 | packages/web-kit/src/payments/**, /api/webhooks/stripe | `stripe trigger` |
| 12 | ecommerce | 11 | packages/web-kit/src/ecommerce/**, /tienda | `pnpm test:e2e` |
| 13 | modules.config.ts + nav condicional | 4-12 | apps/template/modules.config.ts, nav | `pnpm build` con módulos apagados |
| 14 | CI hardening | 1-13 | .github/workflows/ci.yml | dry-run del workflow local |
| 15 | Release automation | 1 | .changeset/config.json, release.yml | `pnpm changeset` + dry-run |
| 16 | scripts/setup.js | 13 | scripts/setup.js | `node scripts/setup.js --dry-run` |
| 17 | Documentación | 1-16 | README, docs/modules/*.md | script que compara docs vs. módulos reales |

---

#### Paso 1 — Bootstrap del monorepo

**Do**
Crear la raíz del repo (`web-kit/`, ya contiene `blueprints/web-kit/` de este blueprint) como
repositorio git. Los archivos de `workspace/` (§19.6: `pnpm-workspace.yaml`, `package.json` raíz,
`tsconfig.base.json`, `.nvmrc`, `.npmrc`, `.env.example`, `.gitignore`, `firebase.json`,
`vitest.config.ts`, `playwright.config.ts`, `eslint.config.mjs`, `.prettierrc`, `.github/workflows/*`,
`.husky/*`, `.changeset/*`) ya fueron copiados a la raíz del proyecto por el Bootstrap de §10 antes de
este paso. Este paso:
- Crea `packages/web-kit/src/index.ts` — allowlist vacía con comentario de allowlist explícita.
- Crea `docs/surface.md` — **declara** la superficie (sección "Exports de valor" y "Exports de tipo",
  ambas vacías por ahora, con la nota de que se llenan módulo por módulo).
- `mkdir -p apps` antes del scaffold — confirmado por ejecución real que `create-next-app` puede
  fallar con "application path is not writable" si el directorio padre no existe aún en Windows.
- Escanda `apps/template` con `pnpm create next-app@15.5.9 apps/template --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm --yes` (autorado por el scaffold, no por este blueprint — ver §10 "Quién autora cada manifiesto"). `pnpm-workspace.yaml`'s `allowBuilds`/`minimumReleaseAgeExclude` (§19.6) ya cubren los postinstalls conocidos (`sharp`, incluido por Next.js) — si el scaffold aborta igual con `ERR_PNPM_IGNORED_BUILDS` en un paquete nuevo no listado, correr `pnpm approve-builds --all` y luego `pnpm install` desde la raíz completa la instalación que el scaffold dejó a medias (confirmado por ejecución real: `create-next-app` no reintenta su propio install solo).
- Edita `apps/template/package.json` (ya escrito por el scaffold): añade `"@mgorrin/web-kit": "workspace:*"` como dependencia; fija `devDependencies.typescript` a `"5.9.3"` exacto (el scaffold trae `"^5"`, que resuelve a la misma versión, pero se fija explícito para que quede idéntico al pin de la raíz — NUNCA subir a 6.0.3 aquí, ver §11); alinea `eslint`, `eslint-config-next`, `tailwindcss`, `@tailwindcss/postcss`, `@eslint/eslintrc` a los mismos pines exactos que la raíz.
- Crea `packages/web-kit/package.json`, `tsconfig.json`, `tsconfig.build.json` (ya emitidos en §19.6 — este paso solo los confirma en su lugar tras el `pnpm install`).

**Done when**
- [ ] WHEN `pnpm install --frozen-lockfile` corre en la raíz THE SYSTEM SHALL salir con código 0.
- [ ] WHEN `pnpm --filter template build` corre THE SYSTEM SHALL producir un build de producción sin errores.
- [ ] WHEN `pnpm --filter template start` arranca y se hace `curl` a `/` THE SYSTEM SHALL responder `200`.
- [ ] WHEN `pnpm --filter @mgorrin/web-kit build` corre contra `src/index.ts` vacío THE SYSTEM SHALL salir con código 0 (paquete vacío mínimo viable).
- [ ] WHEN se lee `docs/surface.md` THE SYSTEM SHALL tener las dos secciones (valor / tipo) presentes, aunque vacías.

**Verify**
```bash
pnpm install --frozen-lockfile        # expect: exit 0
pnpm --filter @mgorrin/web-kit build  # expect: exit 0
pnpm --filter template build          # expect: exit 0
pnpm --filter template start &
sleep 2
test "$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/)" = "200"   # expect: exit 0
kill %1
test -f docs/surface.md               # expect: exit 0
```

**Checkpoint**
```bash
git add -A && git commit -m "step 1: monorepo bootstrap + template scaffold"
git tag step-01-monorepo-bootstrap
```

---

#### Paso 2 — design-system (congela la superficie pública)

**Do**
Crea `packages/web-kit/src/design-system/` con: `tokens.css` (las variables CSS de §7), `Button.tsx`,
`Card.tsx`, `Input.tsx`, `Dialog.tsx` (sobre `radix-ui` + `class-variance-authority`), e `index.ts`
(allowlist: `Button`, `Card`, `Input`, `Dialog`, y el tipo `ButtonVariant`). Crea
`apps/template/theme.config.ts` con las variables re-temables. Añade `design-system` a
`packages/web-kit/src/index.ts` (`export * from "./design-system/index.ts"` — única excepción a la
regla "sin barrels" porque es el propio archivo de allowlist raíz del paquete, no un barrel interno).
Actualiza `docs/surface.md`: añade las 4 filas de valor (`Button`, `Card`, `Input`, `Dialog`) y 1 fila
de tipo (`ButtonVariant`). **Este es el paso que congela la superficie** — a partir de aquí el chequeo
de drift corre como gate.

**Done when**
- [ ] WHEN `pnpm --filter @mgorrin/web-kit build` corre THE SYSTEM SHALL exportar `Button`, `Card`, `Input`, `Dialog` desde `dist/design-system/index.js`.
- [ ] WHEN el script de chequeo de drift (`tsx scripts/check-surface.ts`, ver Verify) corre THE SYSTEM SHALL comparar las 4 filas de valor de `docs/surface.md` contra el namespace runtime de `dist/design-system/index.js` y las filas de tipo contra la salida de `tsc --declaration` — y salir con código 0.
- [ ] WHEN la home de `apps/template` (`/`) renderiza un `<Button>` THE SYSTEM SHALL aplicar `--color-primary` de `theme.config.ts` sin hardcodear el hex en el componente.
- [ ] WHEN `pnpm exec playwright test apps/template/e2e/home.spec.ts` corre THE SYSTEM SHALL pasar, confirmando que el botón es visible y clickeable.
- [ ] WHEN se importa `@radix-ui/react-dialog` directamente en cualquier archivo fuera de `design-system/` THE SYSTEM SHALL fallar el lint (`no-restricted-imports`).

**Verify**
```bash
pnpm --filter @mgorrin/web-kit build                                    # expect: exit 0
node -e "const m = require('./packages/web-kit/dist/design-system/index.js'); \
  ['Button','Card','Input','Dialog'].forEach(n => { if (!(n in m)) { console.error('missing '+n); process.exit(1); } })"
                                                                          # expect: exit 0
pnpm exec vitest run packages/web-kit/src/design-system                 # expect: exit 0, 0 failed
pnpm --filter template build                                             # expect: exit 0 — el <Button> temado se agregó a page.tsx; playwright.config.ts sirve el build de producción (next start), así que debe reconstruirse antes de correr el e2e
pnpm exec playwright test apps/template/e2e/home.spec.ts                # expect: exit 0
pnpm lint                                                                 # expect: exit 0 (confirma no-restricted-imports activo)
```

**Checkpoint**
```bash
git add -A && git commit -m "step 2: design-system module, freeze public surface"
git tag step-02-design-system
```

---

#### Paso 3 — auth-rbac

**Do**
Corre `pnpm --filter template add firebase@^12.19.0` — `firebase` es un `peerDependency` de
`@mgorrin/web-kit` (§19.6), y `apps/template` es quien lo satisface como dependencia real; pnpm
resuelve el peer del paquete a partir de esta instalación. Crea `packages/web-kit/src/auth-rbac/`:
`firebase-client.ts` (inicializa el SDK cliente con las `NEXT_PUBLIC_FIREBASE_*` env vars),
`firebase-admin.ts` (inicializa `firebase-admin` server-only con `FIREBASE_ADMIN_*`), `session.ts`
(`getSession()`), `use-role-guard.ts` (hook + helper de middleware), `types.ts` (`Role`). Extiende
`packages/web-kit/firestore.rules` (ya tiene la sección `users` — este paso la confirma con tests).
Crea `tests/rules/users.test.ts` contra el emulador.

**Done when**
- [ ] WHEN un usuario sin sesión intenta leer `users/{otroUid}` en el emulador THE SYSTEM SHALL denegar el acceso.
- [ ] WHEN un usuario con `role: "admin"` lee cualquier documento de `users` THE SYSTEM SHALL permitirlo.
- [ ] WHEN un usuario intenta escribir su propio documento `users/{uid}` sin ser `super_admin` THE SYSTEM SHALL denegar la escritura.
- [ ] WHEN `getSession()` se llama sin cookie de sesión válida THE SYSTEM SHALL retornar `null`, nunca lanzar una excepción no capturada.
- [ ] WHEN `FIREBASE_ADMIN_PRIVATE_KEY` está ausente al importar `firebase-admin.ts` THE SYSTEM SHALL lanzar un error nombrado en el import, no fallar silenciosamente en el primer uso.
- [ ] WHEN `pnpm exec vitest run tests/rules/users.test.ts` corre contra el emulador THE SYSTEM SHALL pasar con 0 fallos.

**Verify**
```bash
grep -q '"firebase"' apps/template/package.json  # expect: match — real dep, not just a peer
pnpm --filter @mgorrin/web-kit build          # expect: exit 0
pnpm exec firebase emulators:exec --only firestore,auth "pnpm exec vitest run tests/rules/users.test.ts"
                                                # expect: exit 0, 0 failed
pnpm typecheck                                 # expect: exit 0
```

**Checkpoint**
```bash
git add -A && git commit -m "step 3: auth-rbac module + firestore rules for users"
git tag step-03-auth-rbac
```

---

#### Paso 4 — multi-location

**Do**
Crea `packages/web-kit/src/multi-location/`: `types.ts` (`Sede`), `repository.ts` (CRUD + guardia de
borrado que verifica hijos), `index.ts`. Añade sección `sedes` a `firestore.rules` (ya presente,
confirmada por test). Crea `tests/rules/sedes.test.ts` y `packages/web-kit/src/multi-location/repository.test.ts`.

**Done when**
- [ ] WHEN se crea la primera Sede de un proyecto THE SYSTEM SHALL marcarla `isDefault: true` automáticamente.
- [ ] WHEN se intenta borrar una Sede que tiene al menos un `Especialista` activo THE SYSTEM SHALL rechazar el borrado con un error tipado `CONFLICT`.
- [ ] WHEN un usuario sin rol admin intenta escribir en `sedes` vía el emulador THE SYSTEM SHALL denegarlo.
- [ ] WHEN solo existe una Sede THE SYSTEM SHALL permitir que la UI (paso 7) la oculte del selector sin romper ninguna consulta.

**Verify**
```bash
pnpm exec vitest run packages/web-kit/src/multi-location   # expect: exit 0, 0 failed
pnpm exec firebase emulators:exec --only firestore,auth "pnpm exec vitest run tests/rules/sedes.test.ts"
                                                              # expect: exit 0
pnpm typecheck                                               # expect: exit 0
```

**Checkpoint**
```bash
git add -A && git commit -m "step 4: multi-location module"
git tag step-04-multi-location
```

---

#### Paso 5 — scheduling

**Do**
Crea `packages/web-kit/src/scheduling/`: `types.ts` (`Cita`), `repository.ts` (único escritor de
`citas`), `CalendlyEmbed.tsx` (componente cliente), `index.ts`. Crea
`apps/template/src/app/api/citas/route.ts` (POST) y `apps/template/src/app/api/citas/[id]/route.ts`
(PATCH). Crea `tests/rules/citas.test.ts`.

**Done when**
- [ ] WHEN `POST /api/citas` recibe un body válido con sesión THE SYSTEM SHALL crear un documento en `citas` con `status: "scheduled"` y responder `201`.
- [ ] WHEN `POST /api/citas` recibe `sedeId` inexistente THE SYSTEM SHALL responder `404` con `{ ok: false, error: { code: "NOT_FOUND" } }` y no escribir ningún documento.
- [ ] WHEN `POST /api/citas` recibe una request sin sesión THE SYSTEM SHALL responder `401` y no escribir ningún documento.
- [ ] WHEN `PATCH /api/citas/[id]` es llamado por un usuario sin rol admin THE SYSTEM SHALL responder `403`.
- [ ] WHEN un cliente sin cuenta agenda vía Calendly (fuera de este API, manual) el admin registra la cita con `source: "manual"` THE SYSTEM SHALL aceptar `clientUid: null`.

**Verify**
```bash
pnpm exec vitest run packages/web-kit/src/scheduling        # expect: exit 0, 0 failed
pnpm --filter template build                                 # expect: exit 0
pnpm --filter template start &
sleep 2
test "$(curl -s -o /dev/null -w '%{http_code}' -X POST http://localhost:3000/api/citas -H 'Content-Type: application/json' -d '{}')" = "401"
                                                               # expect: exit 0 (sin sesión → 401)
kill %1
```

**Checkpoint**
```bash
git add -A && git commit -m "step 5: scheduling module + citas API routes"
git tag step-05-scheduling
```

---

#### Paso 6 — client-portal

**Do**
Crea `packages/web-kit/src/client-portal/`: `NextAppointmentCard.tsx`, `NotificationList.tsx`,
`index.ts`. Crea `apps/template/src/app/portal/page.tsx`. Crea `apps/template/e2e/portal.spec.ts`.

**Done when**
- [ ] WHEN un usuario autenticado con una Cita futura visita `/portal` THE SYSTEM SHALL mostrar fecha, hora y estado de esa Cita.
- [ ] WHEN un usuario autenticado sin citas futuras visita `/portal` THE SYSTEM SHALL mostrar el estado vacío "No tienes citas programadas" con un enlace a `/agenda`.
- [ ] WHEN un usuario no autenticado visita `/portal` THE SYSTEM SHALL redirigir a `/`.
- [ ] WHEN se inspecciona cualquier componente de `client-portal` THE SYSTEM SHALL no contener ningún campo de dato clínico (diagnóstico, foto médica, nota clínica) — verificado por que `Cita.notes` es el único campo de texto libre y el tipo `Cita` no declara ningún campo clínico.

**Verify**
```bash
pnpm exec vitest run packages/web-kit/src/client-portal   # expect: exit 0, 0 failed
pnpm --filter template build                                # expect: exit 0 — este paso crea la ruta /portal; el build anterior (paso 5) no la tiene, y playwright.config.ts sirve next start
pnpm exec playwright test apps/template/e2e/portal.spec.ts # expect: exit 0
pnpm typecheck                                              # expect: exit 0
```

**Checkpoint**
```bash
git add -A && git commit -m "step 6: client-portal module"
git tag step-06-client-portal
```

---

#### Paso 7 — admin-panel

**Do**
Crea `packages/web-kit/src/admin-panel/`: `Dashboard.tsx`, `CitasTable.tsx`, `EspecialistasCrud.tsx`,
`SedesCrud.tsx`, `index.ts`. Crea `apps/template/src/app/admin/{layout.tsx,page.tsx,citas/page.tsx,especialistas/page.tsx,sedes/page.tsx}`.

**Done when**
- [ ] WHEN un usuario con rol `admin` visita `/admin` THE SYSTEM SHALL mostrar el conteo de citas de los próximos 7 días.
- [ ] WHEN un usuario con rol `specialist` visita `/admin` THE SYSTEM SHALL redirigir a `/portal`.
- [ ] WHEN un admin crea una Cita manualmente desde `/admin/citas` THE SYSTEM SHALL usar el mismo `POST /api/citas` del paso 5 (sin un segundo escritor de la colección).
- [ ] WHEN solo existe una Sede THE SYSTEM SHALL ocultar el selector de sede en los formularios de `/admin/citas` y preseleccionar la única Sede.
- [ ] WHEN `pnpm exec playwright test apps/template/e2e/admin.spec.ts` corre THE SYSTEM SHALL pasar el flujo de crear y listar una Cita desde el admin.

**Verify**
```bash
pnpm exec vitest run packages/web-kit/src/admin-panel      # expect: exit 0, 0 failed
pnpm --filter template build                                 # expect: exit 0 — este paso crea /admin/**; el build anterior no lo tiene, y playwright.config.ts sirve next start
pnpm exec playwright test apps/template/e2e/admin.spec.ts  # expect: exit 0
pnpm typecheck                                               # expect: exit 0
```

**Checkpoint**
```bash
git add -A && git commit -m "step 7: admin-panel module"
git tag step-07-admin-panel
```

---

#### Paso 8 — crm

**Do**
Crea `packages/web-kit/src/crm/`: `types.ts` (`Lead`), `repository.ts`, `hubspot-adapter.ts`
(implementa `CrmAdapter`, gateado por `crm.externalSync`), `index.ts`. Crea
`apps/template/src/app/api/leads/route.ts`. Crea `packages/web-kit/src/crm/hubspot-adapter.test.ts`
(mock de la API de HubSpot, sin red real).

**Done when**
- [ ] WHEN `POST /api/leads` recibe un `email` o `phone` válido THE SYSTEM SHALL crear o actualizar un Lead con `status: "new"` si es nuevo.
- [ ] WHEN `crm.externalSync` está apagado (default) THE SYSTEM SHALL nunca llamar a la API de HubSpot, ni siquiera con `HUBSPOT_API_KEY` presente.
- [ ] WHEN `crm.externalSync` está encendido y se crea un Lead THE SYSTEM SHALL llamar al adapter de HubSpot con el mapeo de etapa `new → "lead"`.
- [ ] WHEN el `CrmAdapter` recibe un status no mapeado THE SYSTEM SHALL lanzar un error tipado en vez de sincronizar un valor arbitrario.
- [ ] WHEN una Cita se crea con `clientUid` que corresponde a un Lead existente (por email) THE SYSTEM SHALL actualizar ese Lead a `status: "scheduled"`.

**Verify**
```bash
pnpm exec vitest run packages/web-kit/src/crm   # expect: exit 0, 0 failed
pnpm typecheck                                    # expect: exit 0
```

**Checkpoint**
```bash
git add -A && git commit -m "step 8: crm module + HubSpot adapter"
git tag step-08-crm
```

---

#### Paso 9 — notifications

**Do**
Crea `packages/web-kit/src/notifications/`: `resend-client.ts`, `send-appointment-email.ts`
(confirmada/cambiada/cancelada, a cliente y admin), `templates.ts`, `index.ts`. Conecta la llamada
desde `apps/template/src/app/api/citas/route.ts` (edición, no archivo nuevo) y
`api/citas/[id]/route.ts`.

**Done when**
- [ ] WHEN se crea una Cita vía `POST /api/citas` THE SYSTEM SHALL llamar a `sendAppointmentEmail` con el template "confirmada", dirigido al cliente y al admin de la Sede.
- [ ] WHEN `PATCH /api/citas/[id]` cambia `status` a `"cancelled"` THE SYSTEM SHALL enviar el template "cancelada".
- [ ] WHEN `RESEND_API_KEY` está ausente al importar `resend-client.ts` THE SYSTEM SHALL lanzar un error nombrado, nunca enviar un email silenciosamente fallido.
- [ ] WHEN el envío de email falla (Resend responde error) THE SYSTEM SHALL registrar el error pero NO revertir la creación de la Cita — el email es un efecto secundario, no una transacción.
- [ ] WHEN `pnpm exec vitest run packages/web-kit/src/notifications` corre (con Resend mockeado) THE SYSTEM SHALL pasar con 0 fallos.

**Verify**
```bash
pnpm exec vitest run packages/web-kit/src/notifications   # expect: exit 0, 0 failed
pnpm typecheck                                              # expect: exit 0
```

**Checkpoint**
```bash
git add -A && git commit -m "step 9: notifications module (Resend)"
git tag step-09-notifications
```

---

#### Paso 10 — seo-analytics

**Do**
Crea `packages/web-kit/src/seo-analytics/`: `metadata-helper.ts`, `local-business-jsonld.ts`,
`ga4-script.tsx`, `index.ts`. Crea `apps/template/src/app/sitemap.ts` y
`apps/template/src/app/robots.ts`.

**Done when**
- [ ] WHEN `apps/template` se builda THE SYSTEM SHALL generar `/sitemap.xml` con al menos las rutas `/`, `/agenda`, `/portal`.
- [ ] WHEN se solicita `/robots.txt` THE SYSTEM SHALL responder con `Allow: /` y una referencia a `/sitemap.xml`.
- [ ] WHEN una página no define `title`/`description` vía `metadata-helper` THE SYSTEM SHALL fallar el build (helper lanza en tiempo de build, no en runtime).
- [ ] WHEN `NEXT_PUBLIC_GA_MEASUREMENT_ID` está ausente THE SYSTEM SHALL omitir el script de GA4 sin romper el render (nunca un script con `undefined` en la URL).
- [ ] WHEN se renderiza la home THE SYSTEM SHALL incluir un bloque JSON-LD `LocalBusiness` válido (parseable como JSON).

**Verify**
```bash
pnpm --filter template build   # expect: exit 0
pnpm --filter template start &
sleep 2
test "$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/sitemap.xml)" = "200"
test "$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/robots.txt)" = "200"
curl -s http://localhost:3000/ | grep -q "LocalBusiness"
kill %1
```

**Checkpoint**
```bash
git add -A && git commit -m "step 10: seo-analytics module"
git tag step-10-seo-analytics
```

---

#### Paso 11 — payments

**Do**
Crea `packages/web-kit/src/payments/`: `types.ts` (`PaymentProvider`), `stripe-provider.ts`
(implementa `PaymentProvider`), `index.ts`. Crea `apps/template/src/app/api/checkout/route.ts` y
`apps/template/src/app/api/webhooks/stripe/route.ts`. Crea `apps/template/src/app/api/webhooks/stripe/route.test.ts`.

**Done when**
- [ ] WHEN `POST /api/webhooks/stripe` recibe un `Stripe-Signature` inválido THE SYSTEM SHALL responder `400` y escribir cero documentos.
- [ ] WHEN `checkout.session.completed` llega con un `event.id` nuevo THE SYSTEM SHALL crear un `Pedido` (o marcarlo `paid` si viene de ecommerce, paso 12) exactamente una vez.
- [ ] WHEN el mismo `event.id` se entrega dos veces THE SYSTEM SHALL responder `200` ambas veces y dejar el conteo de documentos sin cambios.
- [ ] WHEN `STRIPE_WEBHOOK_SECRET` está ausente al importar el Route Handler THE SYSTEM SHALL fallar el arranque del build con un error nombrado, no servir tráfico sin verificación.
- [ ] WHEN un evento no manejado llega THE SYSTEM SHALL responder `200` (nunca 5xx).
- [ ] WHEN `pnpm exec vitest run apps/template/src/app/api/webhooks/stripe` corre THE SYSTEM SHALL reportar 0 fallos.

**Verify**
```bash
pnpm exec vitest run apps/template/src/app/api/webhooks/stripe   # expect: exit 0, 0 failed
pnpm typecheck                                                     # expect: exit 0
```
La aserción de `Stripe-Signature` inválido → `400` está cubierta por `route.test.ts` (mockeado);
no se repite contra un servidor real en este Verify porque ningún paso previo levanta uno.

**Checkpoint**
```bash
git add -A && git commit -m "step 11: payments module (Stripe)"
git tag step-11-payments
```

---

#### Paso 12 — ecommerce

**Do**
Crea `packages/web-kit/src/ecommerce/`: `types.ts` (`Producto`, `Pedido`), `repository.ts`,
`CartProvider.tsx`, `index.ts`. Crea `apps/template/src/app/tienda/page.tsx` y
`apps/template/e2e/tienda.spec.ts`.

**Done when**
- [ ] WHEN `/tienda` se visita con al menos un Producto activo THE SYSTEM SHALL listar sus productos filtrados por la Sede por defecto.
- [ ] WHEN un producto tiene `inventoryCount: 0` THE SYSTEM SHALL deshabilitar su botón de "Agregar al carrito".
- [ ] WHEN se agrega un producto al carrito y se hace checkout THE SYSTEM SHALL usar el `payments` module del paso 11 (mismo Route Handler `/api/checkout`, sin un segundo camino de pago).
- [ ] WHEN no hay ningún Producto activo THE SYSTEM SHALL ocultar la sección de catálogo completa en vez de mostrarla vacía.
- [ ] WHEN `pnpm exec playwright test apps/template/e2e/tienda.spec.ts` corre THE SYSTEM SHALL pasar el flujo de agregar un producto al carrito.

**Verify**
```bash
pnpm exec vitest run packages/web-kit/src/ecommerce        # expect: exit 0, 0 failed
pnpm --filter template build                                  # expect: exit 0 — este paso crea /tienda; el build anterior no lo tiene, y playwright.config.ts sirve next start
pnpm exec playwright test apps/template/e2e/tienda.spec.ts # expect: exit 0
pnpm typecheck                                                # expect: exit 0
```

**Checkpoint**
```bash
git add -A && git commit -m "step 12: ecommerce module"
git tag step-12-ecommerce
```

---

#### Paso 13 — modules.config.ts + navegación/rutas condicionales

**Do**
Crea `apps/template/modules.config.ts` (flags para los 10 módulos activables; `design-system` no
lleva flag). Edita `apps/template/src/components/nav/AdminNav.tsx` y la navegación pública (creados en
pasos 7/2) para leer los flags. Crea `apps/template/modules.config.test.ts`.

**Done when**
- [ ] WHEN `modules.config.ts` tiene `ecommerce: false` THE SYSTEM SHALL no incluir el enlace a `/tienda` en la navegación ni en el sitemap.
- [ ] WHEN `modules.config.ts` tiene `ecommerce: false` y se builda THE SYSTEM SHALL no incrementar el bundle de la ruta `/` con código de `ecommerce` (import dinámico condicionado al flag, verificado por el reporte de `next build`).
- [ ] WHEN todos los módulos activables están en `false` THE SYSTEM SHALL seguir buildando y arrancando sin error.
- [ ] WHEN `design-system` se busca en `modules.config.ts` THE SYSTEM SHALL no encontrar ningún flag para él (siempre activo, sin bandera).

**Verify**
```bash
pnpm exec vitest run apps/template/modules.config.test.ts   # expect: exit 0, 0 failed
pnpm --filter template build                                  # expect: exit 0
pnpm typecheck                                                 # expect: exit 0
```

**Checkpoint**
```bash
git add -A && git commit -m "step 13: modules.config.ts + conditional nav/routes"
git tag step-13-modules-config
```

---

#### Paso 14 — CI hardening

**Do**
Edita `.github/workflows/ci.yml` (ya emitido en §19.6): confirma que corre lint, format, typecheck,
unit, Firestore-rules contra el emulador, build, y Playwright e2e, en ese orden — el orden literal de
`ci.yml`. Añade `apps/template/e2e/ci-smoke.spec.ts` como smoke final del pipeline.

**Done when**
- [ ] WHEN se abre un PR THE SYSTEM SHALL correr `ci.yml` completo (lint → format → typecheck → unit → rules → build → e2e).
- [ ] WHEN cualquiera de esas etapas falla THE SYSTEM SHALL detener el pipeline sin ejecutar `release.yml`.
- [ ] WHEN `ci.yml` corre localmente vía `act` o simplemente ejecutando cada línea del job en orden THE SYSTEM SHALL salir con código 0 en un checkout limpio.

**Verify**
```bash
pnpm install --frozen-lockfile
pnpm exec playwright install --with-deps chromium
pnpm lint && pnpm format && pnpm typecheck && pnpm test
pnpm exec firebase emulators:exec --only firestore,auth "pnpm exec vitest run tests/rules"
pnpm build
pnpm test:e2e
# expect: cada comando exit 0, replicando ci.yml línea por línea
```

**Checkpoint**
```bash
git add -A && git commit -m "step 14: CI hardening"
git tag step-14-ci-hardening
```

---

#### Paso 15 — Release automation

**Do**
Confirma `.changeset/config.json` y `.github/workflows/release.yml` (ya emitidos en §19.6). Añade el
primer changeset real (`.changeset/initial-release.md`) documentando el estado inicial del paquete.

**Done when**
- [ ] WHEN `pnpm changeset status` corre con el changeset inicial presente THE SYSTEM SHALL reportar un bump pendiente para `@mgorrin/web-kit`.
- [ ] WHEN `pnpm --filter @mgorrin/web-kit build` corre antes de publicar THE SYSTEM SHALL salir con código 0 (precondición del job de release).
- [ ] WHEN se inspecciona `release.yml` THE SYSTEM SHALL declarar `permissions: packages: write` explícitamente (el `GITHUB_TOKEN` por defecto no lo tiene).

**Verify**
```bash
pnpm exec changeset status --since=step-01-monorepo-bootstrap   # expect: exit 0
pnpm --filter @mgorrin/web-kit build                              # expect: exit 0
grep -q "packages: write" .github/workflows/release.yml           # expect: exit 0
```

**Checkpoint**
```bash
git add -A && git commit -m "step 15: release automation + initial changeset"
git tag step-15-release-automation
```

---

#### Paso 16 — scripts/setup.js

**Do**
Crea `scripts/setup.js` (Node, sin dependencias nuevas — usa `node:readline` y `node:fs`):
prompts de nombre de cliente, directorio destino, y qué módulos activar; escribe
`modules.config.ts` con los flags elegidos y copia `apps/template` (sin `node_modules`/`.next`) al
destino. Soporta `--dry-run --name= --out=` no interactivo para tests. Crea `scripts/setup.test.ts`.

**Done when**
- [ ] WHEN `node scripts/setup.js --dry-run --name=demo --out=<tmp>` corre THE SYSTEM SHALL escribir `<tmp>/modules.config.ts` con los flags por defecto y salir con código 0.
- [ ] WHEN el directorio destino ya existe y no está vacío THE SYSTEM SHALL abortar con código 1 sin sobrescribir nada.
- [ ] WHEN el script copia `apps/template` THE SYSTEM SHALL excluir `node_modules/` y `.next/` del destino.
- [ ] WHEN `pnpm exec vitest run scripts/setup.test.ts` corre THE SYSTEM SHALL pasar con 0 fallos.

**Verify**
```bash
pnpm exec vitest run scripts/setup.test.ts   # expect: exit 0, 0 failed
TMP_OUT="$(mktemp -d)"
node scripts/setup.js --dry-run --name=demo --out="$TMP_OUT"   # expect: exit 0
test -f "$TMP_OUT/modules.config.ts"                              # expect: exit 0
rm -rf "$TMP_OUT"
```

**Checkpoint**
```bash
git add -A && git commit -m "step 16: scripts/setup.js scaffolder"
git tag step-16-setup-script
```

---

#### Paso 17 — Documentación

**Do**
Crea `README.md` (raíz): qué es esto, cómo generar un proyecto de cliente, configuración de
`.npmrc`/GitHub Packages. Crea `docs/modules/*.md` (uno por módulo, 11 archivos: qué hace, forma de su
config, colecciones Firestore que toca). Crea `docs/check-docs.ts`: script que confirma que cada
módulo listado en `docs/surface.md` tiene un archivo `docs/modules/<módulo>.md`.

**Done when**
- [ ] WHEN `node --experimental-strip-types docs/check-docs.ts` corre THE SYSTEM SHALL confirmar que existe un `docs/modules/<módulo>.md` por cada módulo exportado en `packages/web-kit/src/index.ts`, y salir con código 1 si falta alguno.
- [ ] WHEN se lee `README.md` THE SYSTEM SHALL incluir la sección exacta de configuración de `.npmrc` con los dos scopes de token (`write:packages` para publicar, `read:packages` para consumir).
- [ ] WHEN se cuentan los archivos en `docs/modules/` THE SYSTEM SHALL haber exactamente 11 (uno por cada uno de los 11 módulos listados en §1 de este blueprint).

**Verify**
```bash
node --experimental-strip-types docs/check-docs.ts   # expect: exit 0
test "$(ls docs/modules | wc -l)" = "11"              # expect: exit 0
grep -q "write:packages" README.md                    # expect: exit 0
```

**Checkpoint**
```bash
git add -A && git commit -m "step 17: documentation (README + docs/modules)"
git tag step-17-documentation
```

---

### 9.1 Paridad y cutover

NOT APPLICABLE — build greenfield, no se reemplaza ningún sistema existente. Web Kit es un starter kit
nuevo; no hay un sistema previo cuyo comportamiento deba preservarse.

---

## 10. Configuración del entorno

### Prerrequisitos
| Herramienta | Versión | Verificación |
|---|---|---|
| Node.js | 22 LTS (`>=22.12.0`) | `node -v` |
| pnpm | 12.4.1 | `pnpm -v` |
| Firebase CLI | vía `firebase-tools` del devDependencies (`pnpm exec firebase --version`) | `pnpm exec firebase --version` |
| Git | cualquiera reciente | `git --version` |
| rsync | opcional — el Bootstrap de §10 usa un fallback de copia sin rsync si no está presente (común en Git Bash/MSYS2 de Windows) | `command -v rsync` |

### Cuentas a crear primero
| Servicio | URL de registro | Requerido desde el paso |
|---|---|---|
| Firebase (proyecto por cliente) | https://console.firebase.google.com | 3 (para credenciales reales; el emulador no las necesita) |
| Resend | https://resend.com | 9 |
| Stripe | https://dashboard.stripe.com/register | 11 |
| HubSpot (solo si se activa `crm.externalSync`) | https://app.hubspot.com/signup | 8 (opcional) |
| Google Analytics 4 | https://analytics.google.com | 10 |
| GitHub (para GitHub Packages) | ya existente — token con `write:packages`/`read:packages` | 15 |

### Variables de entorno
| Variable | Propósito | Dónde obtenerla | Requerido desde el paso | ¿Secreta? |
|---|---|---|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Config cliente de Firebase | Consola Firebase > Config del proyecto | 3 | no |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Config cliente de Firebase | ídem | 3 | no |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Config cliente de Firebase | ídem | 3 | no |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Config cliente de Firebase | ídem | 3 | no |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Config cliente de Firebase | ídem | 3 | no |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Config cliente de Firebase | ídem | 3 | no |
| `FIREBASE_ADMIN_PROJECT_ID` | SDK admin server-side | Consola Firebase > Cuentas de servicio | 3 | no |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | SDK admin server-side | ídem | 3 | sí |
| `FIREBASE_ADMIN_PRIVATE_KEY` | SDK admin server-side | ídem | 3 | sí |
| `FIRESTORE_EMULATOR_HOST` | Apunta el SDK al emulador local (`127.0.0.1:8080`) | fijo, ver `.env.example` | 3 | no |
| `FIREBASE_AUTH_EMULATOR_HOST` | Apunta el SDK al emulador local (`127.0.0.1:9099`) | fijo, ver `.env.example` | 3 | no |
| `NEXT_PUBLIC_CALENDLY_URL` | URL del calendario público | Cuenta de Calendly del cliente | 5 | no |
| `RESEND_API_KEY` | Envío de emails | Resend > API Keys | 9 | sí |
| `NOTIFICATIONS_FROM_EMAIL` | Remitente de los emails transaccionales | Dominio verificado en Resend | 9 | no |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Analítica GA4 | Admin de GA4 > Flujos de datos | 10 | no |
| `STRIPE_SECRET_KEY` | Cobros server-side | Stripe > API keys | 11 | sí |
| `STRIPE_WEBHOOK_SECRET` | Verificación de firma del webhook | Stripe > Webhooks | 11 | sí |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Checkout client-side | Stripe > API keys | 11 | no |
| `HUBSPOT_API_KEY` | Sync opcional de leads | HubSpot > Private App | 8 (solo si `crm.externalSync: true`) | sí |

`.env.example` está commiteado con las 19 claves presentes y vacías. `.env`/`.env.*.local` están
ignorados por git. `apps/template/src/lib/env.ts` (creado en el paso 3, junto al primer módulo que
necesita env vars) valida al boot solo las variables requeridas hasta el paso actual — la columna
"Requerido desde el paso" de esta tabla es el contrato que evita que el paso 9 rompa el gate del paso
3 (regla 9 de §9): antes del paso 9, `RESEND_API_KEY` es opcional; desde el paso 9 en adelante, es
requerida.

**Listar una variable aquí no la carga.** El framework de Next.js lee `.env*` automáticamente para la
app; nada lo hace por Vitest fuera de Next — de ahí `tests/setup.ts` (§19.6), que carga el `.env` vía
`loadEnv` de Vite antes de que corra cualquier test.

### Archivos que deben commitearse
| Archivo | Por qué se commitea | Línea de excepción en el ignore |
|---|---|---|
| `.env.example` | Plantilla de las 19 variables, sin valores reales | `!.env.example` después del patrón `.env*` en `.gitignore` |
| `pnpm-workspace.yaml`, `package.json` raíz, `tsconfig.base.json` | Configuración del monorepo | no coinciden con ningún patrón de `.gitignore` |
| `packages/web-kit/firestore.rules`, `firestore.indexes.json` | Reglas de seguridad — deben ir en control de versiones | no coinciden con ningún patrón |
| `.github/workflows/*.yml`, `.husky/pre-commit`, `.changeset/config.json` | CI/CD y git hooks | no coinciden con ningún patrón |
| `vitest.config.ts`, `playwright.config.ts`, `eslint.config.mjs`, `.prettierrc`, `firebase.json` | Configs verify-críticas de §19.6 | no coinciden con ningún patrón |
| `blueprints/` (este bundle) | Referencia histórica del diseño del proyecto | línea `!blueprints/` explícita en `.gitignore`, después de cualquier patrón amplio |

### Bootstrap
```bash
# orden: ignore file + excepciones → init del repo → primer commit → install → servicios → (sin migraciones, Firestore es schemaless)
set -e

# 1. El repo aún no existe — este bundle asume que web-kit/ (el padre de blueprints/) es la raíz.
git rev-parse --git-dir >/dev/null 2>&1 || git init -b main   # idempotente: no-op si ya es un repo

# 2. Copiar el contenido de workspace/ a la raíz del proyecto — de forma NO destructiva.
#    rsync --ignore-existing exits 0 tanto si copia como si se salta un archivo ya existente
#    (a diferencia de `cp -Rn`, que en BSD/macOS sale con 1 al saltar un archivo — ver §19).
#    Archivos que esta copia NUNCA sobrescribe una vez el proyecto está bootstrapeado:
#    package.json (raíz y de packages/web-kit), pnpm-lock.yaml.
#    Ruta relativa al cwd, NUNCA a $0: este bloque se ejecuta pegado/verbatim por un agente,
#    no como un archivo de script guardado, así que $0 nunca apunta a una ruta real del proyecto
#    (resuelve al binario de bash, no al bundle) — ver hallazgo confirmado por ejecución real.
#    Este bloque SIEMPRE corre desde la raíz del proyecto (§7 del proceso de generación), así que
#    "./blueprints/web-kit/workspace/" es válido sin importar quién lo ejecute.
#    rsync no viene preinstalado en Git Bash / MSYS2 de Windows (confirmado por ejecución real en
#    esta máquina) y §10 no lo listaba como prerrequisito — de ahí el fallback: copia archivo por
#    archivo con `[ -e ]` como guarda explícita (nunca dependiendo del código de salida de `cp -n`,
#    que ya sabemos que varía entre BSD/macOS y GNU).
if command -v rsync >/dev/null 2>&1; then
  rsync -a --ignore-existing "./blueprints/web-kit/workspace/" ./
else
  ( cd "./blueprints/web-kit/workspace" && find . -type f ) | while IFS= read -r f; do
    dest="./${f#./}"
    mkdir -p "$(dirname "$dest")"
    [ -e "$dest" ] || cp "./blueprints/web-kit/workspace/${f#./}" "$dest"
  done
fi

# 3. .gitignore (con sus excepciones !.env.example y !blueprints/) ya llegó en el paso 2,
#    ANTES del primer commit — así ninguna ruta que debería ignorarse queda trackeada.
git add -A && git commit -m "chore: scaffold (workspace files from blueprint)" --allow-empty

# 4. Toolchain
corepack enable --install-directory "$HOME/.local/bin" || true
corepack prepare pnpm@12.4.1 --activate
node -v   # expect: v22.x

# 5. Instalación — el paso 1 de §9 continúa desde aquí con el scaffold de create-next-app.
#    pnpm 12+ hace fallar el install (ERR_PNPM_IGNORED_BUILDS) la PRIMERA vez que hay postinstalls
#    sin aprobar (@firebase/util, protobufjs, unrs-resolver) — confirmado por ejecución real. Bajo
#    `set -e`, un `pnpm install --frozen-lockfile || pnpm install` que también falla aborta el
#    script ANTES de llegar a `approve-builds`, así que ese error debe absorberse explícitamente
#    con `|| true` antes de aprobar, y solo entonces se reintenta el install de verdad (sin `|| true`,
#    para que un fallo real en el segundo intento sí detenga el Bootstrap).
pnpm install --frozen-lockfile || pnpm install || true   # primer intento: puede fallar por builds sin aprobar
pnpm approve-builds --all || true                         # aprueba los postinstalls de las 3 deps de arriba
pnpm install --frozen-lockfile || pnpm install            # reintento real: ahora sí debe salir 0

# 6. Herramientas que descargan binarios — necesarias antes de que cualquier Verify las use.
pnpm exec playwright install --with-deps chromium

# 7. Hooks de git.
pnpm exec husky
```

**Este bloque se ejecuta, verbatim, antes de presentar el blueprint** (el hilo principal lo corre en
un directorio de scratch). Es seguro de re-ejecutar: el `git init` es idempotente, la copia de
`workspace/` nunca sobrescribe lo ya presente, y `pnpm install --frozen-lockfile` seguido de
`pnpm install` cubre tanto la primera ejecución (sin lockfile) como las siguientes (con lockfile ya
generado).

---

## 11. Dependencias

Todas las versiones de esta tabla fueron verificadas en vivo en esta sesión (2026-09-12) contra el
registro de npm o la API de GitHub, salvo las marcadas explícitamente `UNVERIFIED`. Ningún pin viene
de memoria.

### Runtime
| Paquete | Versión | Fuente | Verificado | Instalado por | Propósito |
|---|---|---|---|---|---|
| next | 15.5.9 | https://registry.npmjs.org/-/package/next/dist-tags | 2026-09-12 | Paso 1 (`pnpm create next-app@15.5.9`) | Framework de `apps/template` |
| react, react-dom | ^19.3.0 | https://registry.npmjs.org/-/package/react/dist-tags | 2026-09-12 | Paso 1 (scaffold) | Runtime de UI |
| typescript | 5.9.3 (exacto, en la raíz Y en `apps/template/package.json`) | https://registry.npmjs.org/-/package/typescript/dist-tags | 2026-09-12 | §10 Bootstrap (root devDependency); paso 1 edita también el pin que trae el scaffold de `create-next-app` en `apps/template/package.json` para que coincida | Lenguaje — NO 6.0.3 (rompe el build de Next 15.5.9, confirmado por ejecución real), NO 7.0.2 (sin API de compilador JS estable) |
| tailwindcss | ^4.3.3 | https://registry.npmjs.org/-/package/tailwindcss/dist-tags | 2026-09-12 | Paso 1 (scaffold `--tailwind`) | Estilos |
| radix-ui | ^1.6.7 | https://registry.npmjs.org/-/package/radix-ui/dist-tags | 2026-09-12 | Paso 2 (`pnpm --filter @mgorrin/web-kit add radix-ui`, ya declarado en `packages/web-kit/package.json` §19.6) | Primitivas de UI accesibles |
| lucide-react | ^1.45.0 | https://registry.npmjs.org/-/package/lucide-react/dist-tags | 2026-09-12 | `packages/web-kit/package.json` (§19.6) | Iconos |
| firebase | ^12.19.0 | https://registry.npmjs.org/-/package/firebase/dist-tags | 2026-09-12 | Paso 3 (`pnpm --filter template add firebase`) | SDK cliente Auth/Firestore |
| firebase-admin | ^14.4.0 | https://registry.npmjs.org/-/package/firebase-admin/dist-tags | 2026-09-12 | `packages/web-kit/package.json` (§19.6) | SDK server-side |
| resend | ^6.28.0 | https://registry.npmjs.org/-/package/resend/dist-tags | 2026-09-12 | `packages/web-kit/package.json` (§19.6) | Envío de emails transaccionales |
| stripe | ^22.6.2 | https://registry.npmjs.org/-/package/stripe/dist-tags | 2026-09-12 | `packages/web-kit/package.json` (§19.6) | SDK de pagos server-side |
| @stripe/stripe-js | ^9.16.0 | https://registry.npmjs.org/-/package/@stripe/stripe-js/dist-tags | 2026-09-12 | `packages/web-kit/package.json` devDependencies (§19.6), consumido por `apps/template` | Checkout client-side |
| class-variance-authority | ^0.7.1 | https://registry.npmjs.org/-/package/class-variance-authority/dist-tags | 2026-09-12 | `packages/web-kit/package.json` (§19.6, ya declarado) | Variantes de componentes de `design-system` — última publicación 2024-11-26 (~22 meses); sin flag de deprecación, sigue siendo el estándar de facto para proyectos shadcn/Tailwind, pero mantenimiento ligero |

### Desarrollo
| Paquete | Versión | Fuente | Verificado | Instalado por | Propósito |
|---|---|---|---|---|---|
| pnpm | 12.4.1 | https://registry.npmjs.org/-/package/pnpm/dist-tags | 2026-09-12 | §10 Bootstrap (`corepack prepare pnpm@12.4.1`) | Gestor de paquetes, `packageManager` en `package.json` |
| vitest | ^5.0.0 | https://registry.npmjs.org/-/package/vitest/dist-tags | 2026-09-12 | `package.json` raíz (§19.6) | Test runner unitario |
| vite | ^8.0.0 | https://registry.npmjs.org/-/package/vite/dist-tags | 2026-09-12 | `package.json` raíz (§19.6) — requerido por vitest 5 y `@vitejs/plugin-react` 6 simultáneamente | Motor de vitest |
| @vitejs/plugin-react | ^6.1.1 | https://registry.npmjs.org/-/package/@vitejs/plugin-react/dist-tags | 2026-09-12 | `package.json` raíz (§19.6) | Soporte JSX en vitest |
| @testing-library/react | ^16.3.3 | https://registry.npmjs.org/-/package/@testing-library/react/dist-tags | 2026-09-12 | `package.json` raíz (§19.6) | Tests de componentes |
| @testing-library/jest-dom | ^7.0.1 | https://registry.npmjs.org/-/package/@testing-library/jest-dom/dist-tags | 2026-09-12 | `package.json` raíz (§19.6), cargado en `tests/setup.ts` | Matchers de DOM |
| @playwright/test | ^1.63.0 | https://registry.npmjs.org/-/package/@playwright/test/dist-tags | 2026-09-12 | `package.json` raíz (§19.6) | Tests E2E |
| eslint | ^9.39.5 (tag `maintenance`) | https://registry.npmjs.org/-/package/eslint/dist-tags | 2026-09-12 | `package.json` raíz (§19.6) — NO 10.10.0, excluido por el peerDependency de `eslint-config-next` | Lint |
| eslint-config-next | 15.5.9 (exacto) | manifiesto publicado de `eslint-config-next@15.5.9` | 2026-09-12 | `package.json` raíz (§19.6) | Reglas de Next.js, en lockstep con la versión de Next |
| @eslint/eslintrc | ^3.3.7 | https://registry.npmjs.org/-/package/@eslint/eslintrc/dist-tags | 2026-09-12 | `package.json` raíz (§19.6), usado por `eslint.config.mjs` (`FlatCompat`) | Puente entre `next/core-web-vitals` (formato legacy) y ESLint 9 flat config — sigue siendo el puente oficial mantenido por el equipo de ESLint, nada lo ha reemplazado |
| prettier | ^3.9.6 | https://registry.npmjs.org/-/package/prettier/dist-tags | 2026-09-12 | `package.json` raíz (§19.6) | Formato |
| @firebase/rules-unit-testing | ^5.0.2 | https://registry.npmjs.org/-/package/@firebase/rules-unit-testing/dist-tags | 2026-09-12 | `package.json` raíz (§19.6) — peer `firebase ^12.0.0` satisfecho por el pin de arriba | Tests de `firestore.rules` contra el emulador |
| firebase-tools | ^15.30.0 | https://registry.npmjs.org/-/package/firebase-tools/dist-tags | 2026-09-12 | `package.json` raíz (§19.6) | CLI + emuladores locales |
| husky | ^9.1.7 | https://registry.npmjs.org/-/package/husky/dist-tags | 2026-09-12 | `package.json` raíz (§19.6), activado por `pnpm prepare` en §10 Bootstrap | Git hooks |
| lint-staged | ^17.5.1 | https://registry.npmjs.org/-/package/lint-staged/dist-tags | 2026-09-12 | `package.json` raíz (§19.6) | Lint/format en pre-commit |
| @changesets/cli | ^3.0.2 | https://registry.npmjs.org/-/package/@changesets/cli/dist-tags | 2026-09-12 | `package.json` raíz (§19.6) | Versionado + changelog |
| pnpm/action-setup | v6 (v6.1.0) | https://api.github.com/repos/pnpm/action-setup/releases/latest | 2026-09-12 | `.github/workflows/ci.yml` y `release.yml` (§19.6) | Setup de pnpm en CI |
| actions/setup-node | v7 (v7.0.0) | https://api.github.com/repos/actions/setup-node/releases/latest | 2026-09-12 | `.github/workflows/ci.yml` y `release.yml` (§19.6) | Setup de Node en CI |
| changesets/action | v2 (v2.1.2) | https://api.github.com/repos/changesets/action/releases/latest | 2026-09-12 | `.github/workflows/release.yml` (§19.6) | Automatiza el PR de versión + publish de Changesets — pin al tag flotante de major `@v2` |

### Deliberadamente no usado
| Rechazado | En su lugar | Por qué |
|---|---|---|
| Turborepo / Nx | pnpm workspaces plano | Equipo de 2 personas — build-caching no es un problema real todavía (ver No-objetivos §1) |
| Un ORM SQL (Drizzle/Prisma) | SDK directo de Firestore | No hay base de datos SQL en este stack; Firestore es schemaless |
| Zod / cualquier librería de validación de esquemas | Validación manual campo por campo en cada Route Handler | El volumen de endpoints (5) y su forma simple no justifican la dependencia adicional; se revisará si el número de endpoints crece |
| Biome | ESLint + Prettier | `eslint-config-next` es el linter oficial de Next.js con las reglas de framework más completas; Biome habría exigido configuración adicional de parser CSS para Tailwind v4 (ver §2, Verificación de compatibilidad) |
| @tanstack/react-query | Lectura directa en Server Components | No hay estado de servidor que necesite cache/revalidación del lado del cliente en v1 — todas las páginas dinámicas son Server Components |

---

## 12. Estrategia de despliegue

### Hosting
`apps/template` (y cada proyecto de cliente generado desde él) se despliega en **Vercel** — build
command `pnpm --filter template build` (o el equivalente dentro del repo standalone del cliente),
output gestionado por el adaptador de Next.js, runtime Node 22. `@mgorrin/web-kit` no se despliega —
se publica como paquete a **GitHub Packages**.

### Entornos
| Entorno | Rama | URL | Firebase | Modo de terceros |
|---|---|---|---|---|
| Local | — | localhost:3000 | Emulador (Firestore + Auth) | Claves de test (Stripe test mode, Resend en modo sandbox si aplica) |
| Preview | cualquier PR | auto-generada por Vercel | Proyecto de Firebase del cliente (mismo que producción — no hay proyecto de staging separado en v1, dado el tamaño del equipo) | Claves de test |
| Producción | `main` | dominio del cliente | Proyecto de Firebase del cliente | Claves live |

### CI/CD
Ver `.github/workflows/ci.yml` (§19.6): en cada push/PR — install → playwright install → lint →
format → typecheck → unit tests → tests de reglas Firestore contra el emulador → build → e2e. Es el
mismo conjunto que el gate global de §20.1, sin excepciones.

`release.yml` corre solo en push a `main`: buildea `@mgorrin/web-kit`, abre (o actualiza) el PR de
"Version Packages" de Changesets, y publica a GitHub Packages al mergear ese PR.

### Release y rollback
El proyecto de cliente se promueve por deploy normal de Vercel (cada push a `main` es producción). Un
deploy malo se revierte con "Redeploy" del deployment anterior en el dashboard de Vercel (instantáneo,
sin rebuild). No hay migraciones de base de datos que ordenar respecto al deploy — Firestore no tiene
schema que migrar.

### Dominio, DNS, TLS
Configurado por proyecto de cliente en Vercel (registro CNAME/A según el dominio del cliente,
certificado TLS automático de Vercel). No aplica a `@mgorrin/web-kit` en sí.

---

## 13. Estrategia de pruebas

| Capa | Framework | Qué cubre | Dónde | Corre |
|---|---|---|---|---|
| Unitaria | Vitest | Repositorios de cada módulo, helpers puros, adapters (mockeados) | `packages/web-kit/src/**/*.test.ts`, `apps/template/src/**/*.test.ts` | cada commit |
| Reglas de seguridad | Vitest + `@firebase/rules-unit-testing` contra el emulador | `firestore.rules` — lectura/escritura permitida y denegada por rol | `tests/rules/*.test.ts` | cada commit (job separado en CI, requiere el emulador) |
| E2E | Playwright | Los flujos críticos abajo | `apps/template/e2e/*.spec.ts` | pre-deploy (y en cada PR vía CI) |

### Flujos críticos a cubrir E2E
1. Un visitante agenda una cita pública y el admin la ve en `/admin/citas`.
2. Un cliente autenticado visita `/portal` y ve su próxima cita.
3. Un admin cambia el estado de una cita y se dispara el email correspondiente (verificado por mock de Resend, no envío real).
4. (Solo si `ecommerce` activo) Un visitante agrega un producto al carrito y completa el checkout de Stripe en modo test.

### Datos de prueba
El emulador de Firestore/Auth se levanta con `firebase emulators:start`/`emulators:exec`, sin estado
persistente entre ejecuciones (cada `emulators:exec` arranca limpio). Los tests de reglas y de
repositorio crean sus propios documentos por test — ningún test depende del orden de ejecución ni de
estado dejado por otro test. La variable `FIRESTORE_EMULATOR_HOST`/`FIREBASE_AUTH_EMULATOR_HOST` (ver
§10) es lo que apunta el SDK al emulador en vez de a un proyecto real.

### Qué deliberadamente no está probado
- Envío real de emails vía Resend (se mockea siempre) — probar contra la API real de Resend en CI
  consumiría cuota y añadiría dependencia de red a un gate que debe ser determinista.
- La sincronización real con la API de HubSpot (se mockea) — mismo motivo, y `crm.externalSync` está
  apagado por defecto.
- Cobros reales de Stripe fuera de modo test — el flujo de checkout se prueba con claves de test y
  eventos simulados/replayed, nunca contra Stripe en modo live.

---

## 14. Seguridad y secretos

| Concern | Control | Implementado en |
|---|---|---|
| Almacenamiento de secretos | Variables de entorno de la plataforma (Vercel), nunca en el repo | Todos los `.env.*` reales, gitignored |
| Rotación de secretos | Manual, al sospechar compromiso — rotar en la consola del proveedor y actualizar Vercel | Procedimiento documentado en `docs/modules/` del módulo correspondiente |
| Validación de input | Validación manual campo por campo en cada Route Handler (ver §11, "Deliberadamente no usado") | `apps/template/src/app/api/**/route.ts` |
| Codificación de salida / XSS | Escape automático de React/JSX; ningún `dangerouslySetInnerHTML` en el kit | Toda la UI |
| Inyección | No aplica en el sentido SQL — Firestore no tiene lenguaje de consulta inyectable; las reglas de seguridad son la única superficie de control de acceso | `firestore.rules` |
| AuthN / AuthZ | Ver §8 — verificado server-side en cada request | `packages/web-kit/src/auth-rbac/**` |
| CSRF | `SameSite=Lax` en la cookie de sesión + verificación de origen en Route Handlers de mutación | `packages/web-kit/src/auth-rbac/session.ts` |
| Rate limiting / abuso | No aplica en v1 (ver §5) | — |
| Verificación de webhooks | Firma de Stripe verificada antes de parsear el body | `apps/template/src/app/api/webhooks/stripe/route.ts` |
| Auditoría de dependencias | `pnpm audit` manual antes de cada release | `release.yml` (paso manual, no bloqueante en v1) |
| Headers de seguridad | CSP, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` vía `next.config.ts` `headers()` | `apps/template/next.config.ts` |
| Manejo de PII | Email, teléfono, nombre — retenidos mientras la cuenta/lead exista, borrados manualmente por un admin al solicitud del titular | `packages/web-kit/src/auth-rbac/**`, `crm/**` |
| Higiene de logs | Nunca loguear `FIREBASE_ADMIN_PRIVATE_KEY`, `STRIPE_SECRET_KEY`, `RESEND_API_KEY`, ni tokens de sesión completos | Toda la app — verificado por revisión de código, no por herramienta automatizada en v1 |

**Reglas duras**
- Ningún secreto se commitea, se imprime en un log, se envía a un tracker de errores, ni se embebe en
  el bundle del cliente.
- Toda verificación de autorización server-side corre antes del trabajo, no después.
- Los webhooks de terceros se verifican por firma antes de parsear su body como confiable.

**Registro de GitHub Packages — el punto de fricción documentado.** El `.npmrc` con
`@mgorrin:registry=https://npm.pkg.github.com` + `always-auth=true` (emitido en §19.6) es obligatorio
en la raíz de este repo y de cada proyecto de cliente. Publicar requiere un token con
`write:packages` (+ `repo`, porque el repo es privado); consumir requiere `read:packages`. El
`GITHUB_TOKEN` por defecto de Actions **no** tiene `packages: write` a menos que `release.yml` lo
declare explícitamente en su bloque `permissions` (ya lo hace, §19.6). Documentado con detalle en
`.claude/skills/publish-web-kit/SKILL.md`.

Este proyecto no maneja datos regulados (salud, financieros, de menores, o de residentes de la UE) en
v1 — `client-portal` está explícitamente prohibido de almacenar datos clínicos (ver No-objetivos, §1).

---

## 15. Accesibilidad

**Objetivo: WCAG 2.2 nivel AA.**

### Requisitos base
| Requisito | Regla |
|---|---|
| HTML semántico | Landmarks (`header`/`nav`/`main`/`footer`), un `h1` por página |
| Teclado | Todo elemento interactivo alcanzable y operable por teclado, sin trampas |
| Foco visible | Indicador de foco visible, ≥3:1 contra su fondo (Radix ya provee esto por defecto en sus primitivas) |
| Contraste | Texto 4.5:1, texto grande y bordes de UI 3:1 — la paleta de §7 ya lo cumple |
| Formularios | Todo input con label programático; errores como texto, nunca solo color |
| Imágenes | Imágenes con significado llevan `alt`; decorativas llevan `alt=""` |
| Movimiento | Todo lo animado respeta `prefers-reduced-motion: reduce` |
| Zoom / reflow | Usable a 200% de zoom y a 320px de ancho sin scroll horizontal |

### Verificación

**No hay gate automatizado de accesibilidad en v1** — ningún paso de §9 crea `a11y.spec.ts` ni
instala `@axe-core/playwright`; ninguno de los dos aparece en `tasks.json`, en `permissions.allow`,
ni en el §20.1 gate. Si el equipo decide automatizarlo más adelante, es un paso nuevo que declara
`@axe-core/playwright` con su propia fila `UNVERIFIED`/verificada en §11 antes de escribirse.

En v1, la verificación es manual, parte del checklist de lanzamiento (§20.1), antes de publicar cada
proyecto de cliente: navegación completa solo con teclado del flujo de agendar cita, un pase con
lector de pantalla sobre `/portal`, y un pase a 200% de zoom en el breakpoint más angosto.

---

## 16. Observabilidad y costo

### Instrumentación
| Señal | Herramienta | Qué captura | Quién lo revisa |
|---|---|---|---|
| Errores | Logs de Vercel (sin Sentry en v1 — equipo de 2 personas) | Excepciones no manejadas en Route Handlers | Mauro / el desarrollador de turno |
| Logs | Logs de Vercel + `console.error` estructurado con contexto de request | Errores de escritura a Firestore, fallos de envío de email | Mauro |
| Métricas | Analytics de GA4 (por cliente) | Tráfico, conversión del embed de Calendly | Mauro / el cliente |
| Uptime | Ninguna herramienta dedicada en v1 — Vercel reporta caídas de deploy | — | Mauro |

### Las métricas que importan para este proyecto
| Métrica | Objetivo | Alertar en |
|---|---|---|
| Tasa de error de `/api/citas` (POST) | < 1% | > 5% en 1 hora |
| Tasa de error del webhook de Stripe | 0% de firmas inválidas legítimas | cualquier `500` (nunca debería ocurrir) |
| Citas creadas por semana (métrica de negocio) | según el cliente | caída > 50% semana sobre semana |

### Health check
No hay un endpoint `/health` dedicado en v1 — Vercel considera el deploy saludable si el build y el
primer request a `/` responden `200`. Se añadirá un `/api/health` real si un cliente lo requiere
contractualmente.

### Modelo de costo
| Servicio | Free tier | Costo a escala v1 (negocio pequeño) | Costo a 10× | Salto a vigilar |
|---|---|---|---|---|
| Firebase (Spark → Blaze) | Generoso para Firestore/Auth a bajo volumen | ~$0-5/mes | ~$20-50/mes | Lecturas de Firestore si el catálogo de `ecommerce` crece mucho |
| Vercel | Hobby gratis por proyecto | $0 (o Pro $20/mes si se necesita dominio de equipo) | $20/mes | Ancho de banda si el tráfico crece fuerte |
| Resend | 3,000 emails/mes gratis | $0 | ~$20/mes | Volumen de notificaciones transaccionales |
| Stripe | Sin costo fijo, % por transacción | variable | variable | Volumen de ventas de `ecommerce` |
| GitHub Packages | Incluido en el plan de GitHub del equipo | $0 | $0 | Ancho de banda de descarga si el equipo crece mucho |

**Costo mensual estimado al lanzar un cliente típico: $0-25/mes.** La partida más grande es Vercel Pro
si se necesita; la palanca más barata es quedarse en el plan Hobby mientras el tráfico del cliente lo
permita.

---

## 17. Enrutamiento de modelos

NOT APPLICABLE — este proyecto no llama a ningún LLM en runtime. Web Kit es un starter kit de
infraestructura de negocio (agendamiento, CRM, pagos, e-commerce); ningún módulo de v1 integra IA
generativa.

---

## 18. Skills a usar durante la construcción

| Skill | Pasos de build | Por qué | Instalación |
|---|---|---|---|
| frontend-design | Pasos 2, 6, 7, 12 (design-system, portal, admin, tienda) | UI de producción distintiva, no genérica | `/plugin marketplace add anthropics/skills` luego `/plugin install example-skills@anthropic-agent-skills` |
| ui-ux-pro-max | Paso 2 (design-system) | Paleta, escala tipográfica y estilo de componente concretos | `/plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill` luego `/plugin install ui-ux-pro-max@ui-ux-pro-max-skill` |
| playwright-cli | Pasos 2, 6, 7, 12, 14 (todos los que añaden E2E) | Generación y depuración de tests Playwright | `npm install -g @playwright/cli@latest` luego `playwright-cli install --skills` |
| pdf | Paso 17 (documentación) — si algún cliente entrega un brief en PDF que hay que incorporar a `docs/` | Extracción de contenido de PDFs | `/plugin marketplace add anthropics/skills` luego `/plugin install document-skills@anthropic-agent-skills` |

Ninguna de estas skills es una dependencia dura: si no está instalada, el builder sigue la guía propia
de este blueprint, anota la ausencia en una línea, y continúa.

---

## 19. Espacio de trabajo del agente

Ver el árbol completo en la introducción de este documento y en `workspace/` del bundle. Todo archivo
de esta sección es un **archivo real** bajo `blueprints/web-kit/workspace/`, copiado a la raíz del
proyecto por el Bootstrap de §10 con `rsync -a --ignore-existing` (no destructivo — nunca sobrescribe
`package.json` ni `pnpm-lock.yaml` una vez que el proyecto está bootstrapeado).

### 19.1 `CLAUDE.md`
Ver `workspace/CLAUDE.md` — contenido completo, 117 líneas (bajo el límite de 200).

### 19.2 `AGENTS.md`
Ver `workspace/AGENTS.md` — stub de 28 líneas.

### 19.3 `.claude/settings.json`
Ver `workspace/.claude/settings.json` — cada comando de `Verify` de §9 y cada línea del gate global de
§20.1 está en `permissions.allow`.

### 19.4 Skills del proyecto
| Skill | Se activa con | Qué automatiza |
|---|---|---|
| `add-a-module` | "añade un módulo a web-kit", "agrega una función a design-system" | Checklist de crear/extender un módulo de `packages/web-kit/src/`, exponerlo en `index.ts`, y verificarlo antes de un changeset |
| `generate-client-project` | "genera un proyecto de cliente nuevo", "crea el sitio de [cliente]" | El flujo completo de `scripts/setup.js` y la creación del proyecto de Firebase dedicado |
| `publish-web-kit` | "publica una versión nueva", "falla la instalación del paquete privado" | Configuración de `.npmrc`/scopes de token de GitHub Packages, y el flujo de Changesets |

Ver contenido completo en `workspace/.claude/skills/<nombre>/SKILL.md`.

### 19.5 `.claude/rules/*.md`
| Archivo | Globs de `paths` | Cubre |
|---|---|---|
| `.claude/rules/firestore.md` | `packages/web-kit/src/**`, `**/*.rules` | Convenciones de colecciones y reglas de seguridad |
| `.claude/rules/modules.md` | `apps/template/modules.config.ts`, `apps/template/src/app/**` | Convenciones de activación de módulos |
| `.claude/rules/publishing.md` | `packages/web-kit/**`, `.changeset/**`, `.github/workflows/release.yml` | Versionado y publicación |

### 19.6 Configuración verify-crítica e infraestructura local

| Archivo | Ruta en el proyecto | Qué `Verify` lo necesita | Manejo de resolución/env que lleva | Exclusión de la ruta del bundle |
|---|---|---|---|---|
| `pnpm-workspace.yaml` | `/pnpm-workspace.yaml` | Todos (define el workspace) | — | n/a — no es un glob de archivos de tooling |
| `package.json` (raíz) | `/package.json` | Todos | `engines.node`, `packageManager` | n/a |
| `packages/web-kit/package.json` | `/packages/web-kit/package.json` | Pasos 1-12, 15 | `exports` map con condición `types`/`import` | n/a |
| `tsconfig.base.json` | `/tsconfig.base.json` | Pasos 1-13 (`typecheck`) | `allowImportingTsExtensions` + `rewriteRelativeImportExtensions` (convención `.ts` relativa) | `exclude: ["blueprints"]` |
| `.nvmrc` | `/.nvmrc` | §10 Bootstrap, CI | — | n/a |
| `.npmrc` | `/.npmrc` | Paso 15, `publish-web-kit` | scope `@mgorrin` + `always-auth` | n/a |
| `.env.example` | `/.env.example` | Pasos 3, 5, 9, 10, 11, 8 | — | n/a |
| `.gitignore` | `/.gitignore` | §10 Bootstrap (antes del primer commit) | — | línea `!blueprints/` explícita |
| `vitest.config.ts` | `/vitest.config.ts` | Todos los pasos con `pnpm test`/`vitest run` | alias `@` → `apps/template/src`; `setupFiles: tests/setup.ts` | `test.exclude: ["blueprints/**"]`, `coverage.exclude` |
| `tests/setup.ts` | `/tests/setup.ts` | Todos los pasos con `vitest` | Loader explícito de `.env` vía `loadEnv` de Vite — Vitest no carga `.env` por sí solo | n/a |
| `playwright.config.ts` | `/playwright.config.ts` | Pasos 2, 6, 7, 12, 14 | `webServer` arranca `pnpm --filter template start` | `testDir: apps/template/e2e` (no glob amplio) |
| `eslint.config.mjs` | `/eslint.config.mjs` | `pnpm lint`, paso 14 | `no-restricted-imports` contra `@radix-ui/react-*`; `FlatCompat` para `next/core-web-vitals` | `ignores: ["blueprints/**", ...]` explícito |
| `.prettierrc` / `.prettierignore` | `/` | `pnpm format` | — | `.prettierignore` incluye `blueprints/` |
| `firebase.json` | `/firebase.json` | Pasos 3, 4, 5, 8, 11, 12 (tests de reglas) | Puertos fijos de emulador: Firestore 8080, Auth 9099 | n/a |
| `packages/web-kit/firestore.rules` | `/packages/web-kit/firestore.rules` | Pasos 3, 4, 5, 8, 11, 12 | — | n/a |
| `packages/web-kit/firestore.indexes.json` | `/packages/web-kit/firestore.indexes.json` | Paso 7 (consultas ordenadas) | — | n/a |
| `.github/workflows/ci.yml` | `/.github/workflows/ci.yml` | Paso 14 | `NODE_AUTH_TOKEN` no requerido en CI (solo lectura de deps públicas + workspace) | n/a |
| `.github/workflows/release.yml` | `/.github/workflows/release.yml` | Paso 15 | `permissions: packages: write` explícito; `NODE_AUTH_TOKEN`/`GITHUB_TOKEN` para publicar | n/a |
| `.husky/pre-commit` | `/.husky/pre-commit` | §10 Bootstrap (`pnpm exec husky`) | — | n/a |
| `.lintstagedrc.json` | `/.lintstagedrc.json` | pre-commit | Excluye `blueprints/**` de los patrones de lint-staged | patrón `!(blueprints/**/*)` en cada regla |
| `.changeset/config.json` | `/.changeset/config.json` | Paso 15 | — | n/a |

Toda ruta que aparece en un comando `Verify` de §9 fue extraída y confirmada contra el `files`/glob de
la tarea que la crea o contra esta tabla — sin excepciones pendientes.

#### Matriz de convención de resolución

**La convención, una sola vez:** especificadores relativos con extensión `.ts` (`./repository.ts`, no
`./repository.js` ni `./repository`), habilitada por `allowImportingTsExtensions` +
`rewriteRelativeImportExtensions` en `tsconfig.base.json`.

| Contexto | Comando que lo ejercita | Forma de la convención ahí | Config + ajuste literal que lo hace funcionar |
|---|---|---|---|
| Fuente de la app / paquete | `pnpm --filter template build`, `pnpm --filter @mgorrin/web-kit build` | `.ts` relativo | `tsconfig.base.json` — `allowImportingTsExtensions: true`, `rewriteRelativeImportExtensions: true` |
| Archivos de test | `pnpm exec vitest run` | `.ts` relativo | Vitest usa esbuild internamente y resuelve ambas formas; sin config adicional — resuelto por el resolver de Vite, que ignora la extensión declarada y busca el archivo real |
| Scripts standalone | `node --experimental-strip-types scripts/setup.js` (paso 16), `node --experimental-strip-types docs/check-docs.ts` (paso 17) | `.ts` relativo | Node 22 con `--experimental-strip-types` resuelve `.ts` literalmente porque el archivo invocado ya tiene esa extensión; los imports internos de estos dos scripts usan rutas `.ts` explícitas, consistente con la convención — no requieren el flag de compilador porque no pasan por `tsc` |
| Build de `@mgorrin/web-kit` | `pnpm --filter @mgorrin/web-kit build` (→ `tsc -p tsconfig.build.json`) | `.ts` relativo en la fuente, reescrito a `.js` en `dist/` | `tsconfig.build.json` hereda `rewriteRelativeImportExtensions` de `tsconfig.base.json` — el output en `dist/` corre en Node plano sin loader |

#### Reconciliación de valores entre artefactos

| Valor compartido | Fuente única — el archivo que lo decide | Valor literal | Dónde más aparece | Comparado |
|---|---|---|---|---|
| Directorio de salida del paquete | `packages/web-kit/tsconfig.build.json` (hereda `outDir` de `tsconfig.json`) | `dist` | `packages/web-kit/package.json` → `exports["."].import: "./dist/index.js"`, `files: ["dist", ...]`, §3 (árbol) | sí |
| Nombre del paquete publicado | `packages/web-kit/package.json` → `name` | `@mgorrin/web-kit` | `.npmrc` (scope `@mgorrin`), `apps/template/package.json` (`"@mgorrin/web-kit": "workspace:*"`), `eslint.config.mjs` (mensaje de regla), §1/§2/§11/§14 de este documento | sí |
| Puerto del emulador de Firestore | `firebase.json` → `emulators.firestore.port` | `8080` | `.env.example` → `FIRESTORE_EMULATOR_HOST=127.0.0.1:8080`, `tests/setup.ts` (default) | sí |
| Puerto del emulador de Auth | `firebase.json` → `emulators.auth.port` | `9099` | `.env.example` → `FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099`, `tests/setup.ts` (default) | sí |
| Nombre del paquete manager pin | `package.json` raíz → `packageManager` | `pnpm@12.4.1` | `.github/workflows/ci.yml` y `release.yml` (`pnpm/action-setup@v6` con `version: 12.4.1`), §10 Bootstrap (`corepack prepare pnpm@12.4.1`) | sí |
| Ruta del bundle del blueprint | — (convención de ubicación) | `blueprints/` | `.gitignore` (`!blueprints/`), `eslint.config.mjs` (`ignores`), `.prettierignore`, `vitest.config.ts` (`test.exclude`), `.lintstagedrc.json` | sí |

#### Reconciliación de artefactos byte-exactos

NOT APPLICABLE — este blueprint no autora ningún golden file, fixture de salida esperada, ni snapshot
que un `Verify` compare byte a byte. Los `Verify` de §9 comparan códigos de estado HTTP, conteos de
documentos, y presencia/ausencia de exports — todo ello propiedades observables en el momento de
ejecutar el test, nunca literales de texto pre-escritos que otro paso deba reproducir exactamente.

---

## 20. Puerta de aceptación, riesgos y bitácora de decisiones

### 20.1 Puerta de aceptación global

El proyecto está **terminado** cuando cada comando de abajo sale con código 0 en un checkout limpio.

```bash
pnpm install --frozen-lockfile
pnpm lint                # expect: exit 0, cero errores
pnpm format               # expect: exit 0 — prettier --check, ningún archivo con drift de formato
pnpm typecheck            # expect: exit 0, cero errores
pnpm test                 # expect: exit 0, 0 failed, 0 skipped
pnpm exec firebase emulators:exec --only firestore,auth "pnpm exec vitest run tests/rules"
                           # expect: exit 0, 0 failed
pnpm build                # expect: exit 0 — DEBE correr antes de test:e2e: playwright.config.ts
                           # arranca `pnpm --filter template start` (next start), que exige un build
                           # de producción previo. Mismo orden que ci.yml y que los pasos 6/7/12/14.
pnpm test:e2e             # expect: exit 0, 0 failed
pnpm --filter template start &
sleep 2
test "$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/)" = "200"
                           # expect: exit 0 — prueba que el artefacto buildeado realmente arranca
kill %1
```

Más estas puertas manuales, cada una revisada una vez antes de lanzar:

- [ ] Cada paso de §9 tiene su tag de checkpoint en git (`git tag -l 'step-*'` lista 17).
- [ ] Cada archivo de la tabla "Archivos que deben commitearse" (§10) está presente en un checkout
      limpio (`git ls-files --error-unmatch <ruta>` sale 0 para cada uno, invocado por ruta) y no
      coincide con ningún patrón de `.gitignore` (`git check-ignore -q <ruta>; test $? -eq 1` para
      cada uno).
- [ ] El `.gitignore` fue añadido en el commit de Bootstrap de §10, antes del primer commit — no en
      un paso de §9 (`git log --diff-filter=A --format=%H -- .gitignore` muestra el commit de scaffold).
- [ ] `§10 Bootstrap` fue re-ejecutado una vez sobre un árbol ya bootstrapeado, salió con código 0, y
      no revirtió `package.json` ni `pnpm-lock.yaml` (confirma que la copia `rsync --ignore-existing`
      es segura de re-ejecutar).
- [ ] Cada fila de la tabla de reconciliación de valores cruzados (§19.6) está marcada "sí".
- [ ] §9.1 no aplica (greenfield) — nada que verificar aquí.
- [ ] Cada no-objetivo de §1 sigue sin construirse.
- [ ] Cada variable de entorno de §10 está configurada en Vercel para el primer proyecto de cliente
      real y ausente del repo.
- [ ] Los 4 flujos críticos E2E de §13 pasan contra un despliegue de preview real.
- [ ] Pase manual de teclado + un pase de lector de pantalla sobre `/portal` (§15).
- [ ] Se publicó al menos una versión de prueba de `@mgorrin/web-kit` a GitHub Packages y se instaló
      en un proyecto de cliente de prueba usando solo `read:packages` (confirma la configuración de
      `.npmrc` documentada en §14).

**Ninguna advertencia se ignora.** Una advertencia tolerada se vuelve permanente, y la siguiente
advertencia real se esconde dentro de ella.

### 20.2 Registro de riesgos

| Riesgo | Probabilidad | Impacto | Señal temprana | Mitigación |
|---|---|---|---|---|
| Salto de versión mayor de Firebase (cliente 11.x→12.x, admin 13.x→14.x) adoptado en frío | M | A | Errores de tipos o de inicialización al escribir `firebase-client.ts`/`firebase-admin.ts` en el paso 3 | El paso 3 incluye leer las notas de migración v12/v14 de Firebase antes de escribir el código de Auth/Firestore — tarea explícita, no asumida compatible con la forma de API de v11/v13 |
| Fricción de `.npmrc`/scope de token de GitHub Packages en el primer consumo | A | M | `pnpm install` falla con 401/404 al instalar `@mgorrin/web-kit` en un proyecto de cliente nuevo | Documentado con el shape exacto de `.npmrc` y los scopes de token requeridos en el README y en `.claude/skills/publish-web-kit/SKILL.md` (§14, §19.4) |
| Vitest 5 exige Node `^22.12 \|\| ^24 \|\| >=26` — desarrollador con Node viejo | M | M | `pnpm install` o `vitest run` fallan con un error de versión de Node poco claro | `.nvmrc` fija `22`, `actions/setup-node@v7` lo lee en CI, y el Bootstrap de §10 imprime la versión de Node explícitamente para que el fallo sea visible temprano |
| Migración de Radix al paquete unificado (2026-02) — código generado que importa `@radix-ui/react-*` legacy | M | B | El lint falla con `no-restricted-imports` | Regla de ESLint activa desde el paso 2; `design-system` es el único lugar autorizado a importar de Radix |
| `class-variance-authority` sin publicación nueva desde 2024-11-26 (~22 meses) — mantenimiento ligero | B | B | Una versión futura de Tailwind/React rompe su API y no hay parche | Es el estándar de facto del ecosistema shadcn/Tailwind sin alternativa mejor mantenida; si deja de resolver, migrar a `tailwind-variants` es el reemplazo documentado |
| Equipo de 2 personas — bus factor en el mantenimiento del paquete compartido | B | A | Un solo desarrollador conoce el 100% de un módulo | Cada módulo lleva su propio doc en `docs/modules/`, escrito en el paso 17, como forma de mitigar la dependencia de memoria de una sola persona |

### 20.3 Bitácora de decisiones

| # | Decisión | Alternativa rechazada | Por qué | Se revertiría si |
|---|---|---|---|---|
| 1 | pnpm workspaces plano, sin Turborepo | Turborepo con build-caching | Equipo de 2 personas; el caching de build no resuelve ningún dolor real hoy | Los tiempos de build del monorepo superan varios minutos de forma consistente |
| 2 | Firestore (un proyecto por cliente) sobre Postgres gestionado | Postgres + Drizzle/Prisma multi-tenant | Cero servidor que administrar, reglas de seguridad declarativas encajan con el perfil de negocio pequeño; un proyecto por cliente evita el riesgo de fuga de datos entre clientes | Un cliente necesita consultas relacionales complejas que Firestore no modela bien (joins profundos, agregaciones SQL) |
| 3 | ESLint + `eslint-config-next` sobre Biome | Biome | `eslint-config-next` es el linter first-party de Next.js; Biome habría requerido configuración adicional de parser CSS para Tailwind v4 (ver `stack-compatibility.md`) sin beneficio claro para este proyecto | El equipo mide una mejora de velocidad de lint significativa y decide absorber la configuración extra |
| 4 | Radix `radix-ui` (paquete unificado) vendorizado dentro de `@mgorrin/web-kit`, no el modelo copy-paste de la CLI de shadcn | CLI de shadcn (copiar componentes a cada proyecto de cliente) | El kit ES la librería compartida; vendorizar permite que un fix de accesibilidad en `Dialog` llegue a todos los clientes con un bump de versión, en vez de reaplicarse manualmente en cada repo de cliente | El equipo decide que cada cliente necesita personalización tan profunda de los componentes que compartir el código deja de ahorrar tiempo |
| 5 | HubSpot como único adapter de CRM en v1, interfaz `CrmAdapter` lista para más | Construir Pipedrive también | Ningún cliente actual usa Pipedrive; construirlo ahora es trabajo sin validación de demanda | Un cliente real pide Pipedrive |
| 6 | Sin ventana de deprecación formal — rompimientos son un major | Política de deprecación con ventana de N meses | Con 1-2 consumidores internos, coordinar una actualización es una conversación de Slack, no un proceso | La agencia empieza a vender el kit a terceros con expectativas de SLA |

### 20.4 Qué construir después

1. Adapter de CRM Pipedrive (dispara: un cliente real lo pide) — implementa `CrmAdapter`, ya definido en el paso 8.
2. Adapters de pago Yappy / Pagüelo Fácil (dispara: un cliente panameño lo requiere) — implementa `PaymentProvider`, ya definido en el paso 11.
3. Multi-almacén y cálculo de tarifas de envío en `ecommerce` (dispara: un cliente con e-commerce de múltiples bodegas).
4. Integración WhatsApp/SMS como módulo nuevo (dispara: dos o más clientes lo piden).
5. Publicación pública del kit a otras agencias (dispara: decisión de negocio de venderlo como producto).

---

*Fin del blueprint. El orden de construcción es §9. Detente cuando §20.1 esté en verde.*
