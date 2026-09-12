# web-kit — instrucciones para agentes

Monorepo interno pnpm: la librería privada `@mgorrin/web-kit` y `apps/template`, la app Next.js base
para nuevos proyectos de cliente.

## Comandos

| Tarea                       | Comando                          |
| --------------------------- | -------------------------------- |
| Instalar                    | `pnpm install --frozen-lockfile` |
| Dev                         | `pnpm dev`                       |
| Build                       | `pnpm build`                     |
| Typecheck                   | `pnpm typecheck`                 |
| Lint                        | `pnpm lint`                      |
| Tests                       | `pnpm test`                      |
| E2E                         | `pnpm test:e2e`                  |
| Generar proyecto de cliente | `pnpm setup:client`              |

## No negociable

1. Nunca commitear `.env`, credenciales de Firebase, ni tokens del registro de GitHub Packages.
2. Nunca importar `@radix-ui/react-*` — solo el paquete unificado `radix-ui`.
3. Ninguna colección Firestore se lee/escribe sin una regla explícita en `firestore.rules`.
4. Nunca marcar una tarea como terminada con el gate (`lint && typecheck && test && build`) en rojo.
5. Cada cliente tiene su propio proyecto de Firebase — nunca compartir uno entre clientes.

Arquitectura completa, límites de importación y tokens de diseño: ver `CLAUDE.md` en este directorio.
