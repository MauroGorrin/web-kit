# scheduling

Citas (colección `citas`) y el embed de Calendly. Flag: `modulesConfig.scheduling`.

## Exports — raíz y subpath

| Export                                | Tipo  | Notas                                                                                                                                                                                                                                             |
| ------------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CalendlyEmbed`                       | valor | Componente cliente — inyecta el widget de Calendly manualmente (`useEffect` + `document.createElement`), no usa `next/script` (no resuelve desde este paquete en modo ESM estricto — ver nota abajo). Lee `NEXT_PUBLIC_CALENDLY_URL` por defecto. |
| `Cita` / `CitaStatus` / `CitaSource`  | tipo  | `CitaStatus`: `"scheduled" \| "confirmed" \| "cancelled" \| "completed"`.                                                                                                                                                                         |
| `CreateCitaInput` / `UpdateCitaInput` | tipo  | —                                                                                                                                                                                                                                                 |
| `CalendlyEmbedProps`                  | tipo  | —                                                                                                                                                                                                                                                 |

## Exports — **solo subpath** (`@mgorrin/web-kit/scheduling`), server-only

| Export                                  | Notas                                                                                                                                                                    |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `createCita`                            | Único escritor de `citas` — siempre fuerza `status: "scheduled"`, ignora cualquier `status` recibido. No valida que `sedeId` exista (responsabilidad del Route Handler). |
| `getCita`                               | Lectura por id.                                                                                                                                                          |
| `updateCita`                            | Update parcial.                                                                                                                                                          |
| `listUpcomingCitasForClient(clientUid)` | Próxima(s) cita(s) de un cliente — usada por `client-portal`.                                                                                                            |
| `listCitasBetween(start, end)`          | Rango de fechas, todas las sedes — usada por `admin-panel` (dashboard + listado).                                                                                        |

**Por qué son server-only:** el único llamador de estas funciones son Route Handlers/Server
Components (`POST /api/citas`, `/portal`, `/admin`), que usan el SDK admin — el SDK cliente ahí nunca
queda autenticado como el usuario del request, así que `firestore.rules` (`isSignedIn()`) le negaría
el paso.

**Por qué `CalendlyEmbed` no usa `next/script`:** el paquete `next` no declara un mapa `exports` en
su `package.json`; bajo resolución ESM estricta (`packages/web-kit` es `"type": "module"`), TypeScript
no resuelve `next/script` como subpath. Confirmado por ejecución real.

## Ruta de una cita

navegador → `CalendlyEmbed` → (booking se sincroniza a mano por el admin en v1, sin webhook de
Calendly) → `POST /api/citas` (Route Handler) → `createCita` → Firestore → `sendAppointmentEmail`
(`notifications`, si el módulo está activo).
