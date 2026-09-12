# Web Kit

Starter kit interno y privado de la agencia (Mauro Gorrín) para levantar rápido sitios de cliente en
Next.js + Firebase, reutilizando una librería compartida de módulos (`@mgorrin/web-kit`) en vez de
reconstruir cada sitio desde cero.

Este monorepo contiene:

- **`packages/web-kit/`** — el paquete privado `@mgorrin/web-kit`, publicado en GitHub Packages. 11
  módulos (`design-system` siempre activo, 10 activables). Ver [docs/modules/](./docs/modules/) para
  la referencia de cada uno, y [docs/surface.md](./docs/surface.md) para la superficie pública exacta.
- **`apps/template/`** — la app Next.js plantilla desde la que se clonan proyectos de cliente nuevos.
- **`scripts/setup.js`** — el scaffolder que genera un proyecto de cliente nuevo a partir de la
  plantilla.

## Requisitos

- Node 22 (fijado en `.nvmrc`).
- pnpm 12.4.1 (`packageManager` en `package.json`).
- Java (JRE 17+) para los emuladores de Firebase (`pnpm test:rules`, `pnpm test:e2e` completo).

## Comandos

| Tarea                                | Comando                                                   |
| ------------------------------------ | --------------------------------------------------------- |
| Instalar                             | `pnpm install --frozen-lockfile`                          |
| Dev (app plantilla)                  | `pnpm dev` — http://localhost:3000                        |
| Build (todo el monorepo)             | `pnpm build`                                              |
| Typecheck                            | `pnpm typecheck`                                          |
| Lint / format                        | `pnpm lint` · `pnpm format` (check) · `pnpm format:write` |
| Tests unitarios                      | `pnpm test` · un archivo: `pnpm exec vitest run {ruta}`   |
| Tests de reglas Firestore (emulador) | `pnpm test:rules`                                         |
| E2E (Playwright, emulador)           | `pnpm test:e2e`                                           |
| Emuladores Firebase (manual)         | `pnpm emulators:up`                                       |
| Changeset (nuevo cambio versionable) | `pnpm changeset`                                          |
| Publicar `@mgorrin/web-kit`          | `pnpm release` (normalmente vía `release.yml` en CI)      |
| Generar un proyecto de cliente nuevo | `pnpm setup:client` — ver abajo                           |

**Gate antes de cualquier PR:** `pnpm lint && pnpm typecheck && pnpm test && pnpm build` — CI
(`.github/workflows/ci.yml`) corre esto más los tests de reglas y e2e contra el emulador de Firebase.

## Generar un proyecto de cliente nuevo

```bash
pnpm setup:client
# equivalente no interactivo, para scripting/CI:
node scripts/setup.js --name=<cliente> --out=<directorio>
```

El scaffolder copia `apps/template` (sin `node_modules/` ni `.next/`) al directorio destino y escribe
`modules.config.ts` con los módulos activables que elijas. **El proyecto generado nunca copia
`packages/web-kit/src/`** — consume `@mgorrin/web-kit` como una dependencia normal publicada en
GitHub Packages, igual que cualquier paquete privado de npm.

Después de generarlo:

```bash
cd <directorio>
pnpm install
cp .env.example .env.local   # y completa las credenciales del proyecto de Firebase del cliente
pnpm dev
```

## Configuración de GitHub Packages (`.npmrc`)

`@mgorrin/web-kit` se publica y se consume vía GitHub Packages, nunca npm público (ver blueprint,
no-objetivos v1). Cada repo que lo publica o lo consume (este monorepo, y cada proyecto de cliente
generado) necesita un `.npmrc` en su raíz con exactamente esto:

```
@mgorrin:registry=https://npm.pkg.github.com
always-auth=true
```

Esto requiere un token de GitHub con uno de estos dos scopes, según lo que vayas a hacer:

- **`write:packages`** (además de `repo`, porque el repositorio es privado) — para **publicar** una
  versión nueva. Solo lo usa `release.yml` en CI; nunca publiques manualmente desde tu máquina.
- **`read:packages`** — para **consumir** el paquete (`pnpm install` en un proyecto de cliente, o en
  este mismo monorepo si alguna vez se instala desde el registro en vez de vía `workspace:*`).

El token nunca se commitea en `.npmrc` — vive en la variable de entorno `NODE_AUTH_TOKEN`
(localmente) o en `secrets.GITHUB_TOKEN`/un PAT dedicado (en CI). Ver
`.claude/skills/publish-web-kit/SKILL.md` para el flujo completo de release.

## Módulos

| Módulo           | Qué hace                                                                                   |
| ---------------- | ------------------------------------------------------------------------------------------ |
| `design-system`  | Componentes base (`Button`, `Card`, `Input`, `Dialog`) — siempre activo, nunca lleva flag. |
| `auth-rbac`      | Firebase Auth + roles (`super_admin`/`admin`/`specialist`), sesión server-side.            |
| `multi-location` | Sedes físicas del negocio.                                                                 |
| `scheduling`     | Citas (embed de Calendly + API de agendamiento).                                           |
| `client-portal`  | Portal del cliente autenticado — su próxima cita, notificaciones.                          |
| `admin-panel`    | Dashboard y CRUD de citas/especialistas/sedes para el admin.                               |
| `crm`            | Pipeline de leads + adapter opcional de HubSpot.                                           |
| `notifications`  | Emails transaccionales de citas (Resend).                                                  |
| `seo-analytics`  | Metadata, sitemap/robots, JSON-LD, GA4.                                                    |
| `payments`       | Checkout y webhook de Stripe.                                                              |
| `ecommerce`      | Catálogo de productos + carrito, sobre `payments`.                                         |

Cada uno tiene su propia referencia en [`docs/modules/<módulo>.md`](./docs/modules/), verificada
contra el código real por `docs/check-docs.ts`.

## Arquitectura

Ver `CLAUDE.md` para las reglas completas de código, límites entre capas, y el modelo de qué módulo
es dueño de qué colección de Firestore. Resumen rápido:

- **Aislamiento total de datos entre clientes** — un proyecto de Firebase por cliente, nunca
  compartido. No hay campo `tenantId` en ningún esquema.
- **`modules.config.ts`** es la única fuente de verdad de qué módulos están activos por proyecto de
  cliente — ver `.claude/rules/modules.md`.
- **Server-side con permisos usa el SDK admin**, nunca el SDK cliente — el SDK cliente en un Route
  Handler/Server Component nunca queda autenticado como el usuario del request, así que
  `firestore.rules` le negaría el paso. Las reglas de Firestore son la barrera real solo contra
  escrituras directas desde el navegador.
