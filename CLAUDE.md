# web-kit

Monorepo interno pnpm de la agencia: la librería `@mgorrin/web-kit` (paquete privado en GitHub
Packages) y `apps/template`, la app Next.js desde la que se clonan los proyectos de cliente.

## Comandos

| Tarea                                | Comando                                                   |
| ------------------------------------ | --------------------------------------------------------- |
| Instalar                             | `pnpm install --frozen-lockfile`                          |
| Dev (app plantilla)                  | `pnpm dev` — http://localhost:3000                        |
| Build (todo el monorepo)             | `pnpm build`                                              |
| Typecheck                            | `pnpm typecheck`                                          |
| Lint / format                        | `pnpm lint` · `pnpm format` (check) · `pnpm format:write` |
| Tests unitarios                      | `pnpm test` · un archivo: `pnpm exec vitest run {ruta}`   |
| Tests de reglas Firestore            | `pnpm test:rules` (usa el emulador)                       |
| E2E                                  | `pnpm test:e2e`                                           |
| Emuladores Firebase (manual)         | `pnpm emulators:up`                                       |
| Changeset (nuevo cambio versionable) | `pnpm changeset`                                          |
| Publicar `@mgorrin/web-kit`          | `pnpm release` (normalmente vía `release.yml` en CI)      |
| Generar proyecto de cliente          | `pnpm setup:client`                                       |

**Gate:** `pnpm lint && pnpm typecheck && pnpm test && pnpm build` debe pasar antes de dar por
terminada cualquier tarea.

Versión de Node fijada en `.nvmrc` (22). Versiones de dependencias viven en `pnpm-lock.yaml` — léelo,
nunca las adivines.

## Stack

Next.js 15.5.9 · React 19.3 · TypeScript 5.9.3 · Tailwind 4.3 · `radix-ui` (paquete unificado) ·
Firebase (client 12.19 / admin 14.4) · Resend · Stripe · pnpm workspaces (sin Turborepo) ·
GitHub Packages como registro privado.

## Arquitectura

**Dos paquetes, una relación de dependencia.** `apps/template` depende de `@mgorrin/web-kit` vía
`workspace:*`. Todo lo reutilizable entre clientes vive en `packages/web-kit/src/<módulo>/`; todo lo
específico de un cliente (branding vía `theme.config.ts`, qué módulos están activos vía
`modules.config.ts`) vive en `apps/template`.

**Ruta de una cita creada por Calendly:** navegador → embed de Calendly (`scheduling`) → webhook de
Calendly no se usa en v1 (booking se sincroniza manualmente por el admin) → `apps/template/src/app/api/citas/route.ts`
(Route Handler) → `packages/web-kit/src/scheduling/repository.ts` (único escritor de la colección
`citas`) → Firestore → `packages/web-kit/src/notifications/send-appointment-email.ts` (Resend).

**Aislamiento de datos.** Un proyecto de Firebase por cliente — nunca una base de datos compartida.
No existe ningún campo `tenantId` en ningún esquema: el aislamiento es de infraestructura, no de datos.

**Límites**

| Capa                                       | Puede importar de                                                                                 | Nunca                                                                               |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `packages/web-kit/src/<módulo>/`           | otros módulos de `web-kit` vía su export público, `firebase-admin` solo en archivos `*.server.ts` | importar código de `apps/template`                                                  |
| `apps/template/src/app/**`                 | `@mgorrin/web-kit/*`, `apps/template/src/components`, `theme.config.ts`, `modules.config.ts`      | importar `packages/web-kit/src/**` directamente (siempre vía el export del paquete) |
| Cualquier archivo cliente (`"use client"`) | —                                                                                                 | importar `firebase-admin`, `resend`, `stripe` (server-only)                         |

**Dónde vive cada cosa**

| Concern                         | Fuente única                                                                     |
| ------------------------------- | -------------------------------------------------------------------------------- |
| Exports públicos de la librería | `packages/web-kit/src/index.ts` — allowlist explícita, congelada desde el paso 2 |
| Reglas Firestore                | `packages/web-kit/firestore.rules` — un solo archivo para todos los módulos      |
| Qué módulos están activos       | `apps/template/modules.config.ts`                                                |
| Tema visual del cliente         | `apps/template/theme.config.ts`                                                  |
| Acceso a env                    | `apps/template/src/lib/env.ts` — validado al boot, nunca `process.env` suelto    |
| Sesión / rol                    | `packages/web-kit/src/auth-rbac/session.ts` — un único `getSession()`            |

## Reglas de código

1. **Radix solo desde `design-system`.** Prohibido importar `@radix-ui/react-*` (legacy) en cualquier
   parte — regla de ESLint `no-restricted-imports`, ver `eslint.config.mjs`.
2. **Un módulo, un directorio, un `index.ts`.** `packages/web-kit/src/<módulo>/index.ts` es el único
   punto de entrada de ese módulo; nada fuera del módulo importa un archivo interno suyo.
3. **Server-first.** Componentes de `apps/template` son Server Components por defecto; `"use client"`
   solo en la hoja que necesita estado/eventos.
4. **Sin barrels que re-exporten todo.** `index.ts` de cada módulo es una allowlist explícita, no
   `export *`.
5. **Validar en el borde.** Todo Route Handler valida su body antes de tocar Firestore.
6. **Sin `tenantId`.** El aislamiento entre clientes es un proyecto de Firebase por cliente, nunca un
   campo de datos — no lo reintroduzcas "por si acaso".
7. **`client-portal` nunca almacena datos clínicos.** Ni diagnósticos, ni fotos, ni notas médicas —
   solo cita, estado y datos de cuenta.

## Sistema de diseño

Tokens en `packages/web-kit/src/design-system/tokens.css`, re-temables por
`apps/template/theme.config.ts` vía variables CSS.

| Rol        | Valor                                                              | Uso                    |
| ---------- | ------------------------------------------------------------------ | ---------------------- |
| Primario   | `--color-primary` (por defecto `#0F172A`)                          | Botones, enlaces, foco |
| Acento     | `--color-accent` (configurable por cliente, por defecto `#2563EB`) | CTAs, estados activos  |
| Fondo      | `--color-background` (`#FFFFFF` / `#0B1120` oscuro)                | Página                 |
| Superficie | `--color-surface` (`#F8FAFC` / `#111827`)                          | Tarjetas, paneles      |
| Borde      | `--color-border` (`#E2E8F0` / `#1F2937`)                           | Divisores, inputs      |

Tipografía: Inter, cargada self-hosted vía `next/font`. Escala: 12/14/16/20/24/32/48px. Radio: 8px
inputs/botones, 12px tarjetas. Espaciado base 4px (4/8/12/16/24/32/48/64).

## Reglas diferidas

| Archivo                       | Aplica a                                                                |
| ----------------------------- | ----------------------------------------------------------------------- |
| `.claude/rules/firestore.md`  | `packages/web-kit/src/**`, `**/*.rules`                                 |
| `.claude/rules/modules.md`    | `apps/template/modules.config.ts`, `apps/template/src/app/**`           |
| `.claude/rules/publishing.md` | `packages/web-kit/**`, `.changeset/**`, `.github/workflows/release.yml` |

## No negociable

1. Nunca commitear `.env`, credenciales de Firebase, ni tokens del registro de GitHub Packages.
2. `packages/web-kit/src/index.ts` no gana exports nuevos sin pasar por `.claude/skills/add-a-module`.
3. Ninguna colección Firestore se lee/escribe sin una regla explícita en `firestore.rules`.
4. Nunca importar `@radix-ui/react-*` — solo el paquete unificado `radix-ui`.
5. Nunca marcar una tarea como terminada con el gate (`lint && typecheck && test && build`) en rojo.
6. Cada cliente tiene su propio proyecto de Firebase — nunca compartir uno entre clientes.
