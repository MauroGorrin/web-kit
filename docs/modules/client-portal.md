# client-portal

Portal del cliente autenticado — ruta `/portal`. Flag: `modulesConfig.clientPortal`.

## Exports

| Export                                                                      | Tipo  | Notas                                                                                                                     |
| --------------------------------------------------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------- |
| `NextAppointmentCard`                                                       | valor | Dado un `Cita \| null`, muestra fecha/hora/estado o el estado vacío ("No tienes citas programadas" + enlace a `/agenda`). |
| `NotificationList`                                                          | valor | Lista de notificaciones de cuenta/cita con "marcar como leído" (client-side, sin persistencia todavía).                   |
| `NextAppointmentCardProps` / `NotificationListProps` / `PortalNotification` | tipo  | —                                                                                                                         |

## No negociable

**`client-portal` nunca almacena datos clínicos** — ni diagnósticos, ni fotos, ni notas médicas. Solo
cita, estado y datos de cuenta. Ver `CLAUDE.md`, regla de código #7, y blueprint, no-objetivos v1.

## Página

`apps/template/src/app/portal/page.tsx` — Server Component dinámico (`force-dynamic`): sin sesión
válida redirige a `/`; con sesión, resuelve la próxima cita vía `scheduling.listUpcomingCitasForClient`.

## Limitación conocida

No existe todavía una ruta que emita la cookie de sesión a partir de un login real de Google — el
flujo de login está descrito narrativamente en el blueprint pero ninguna tarea lo construye. Los
tests de `/portal` cubren el caso "sin sesión → redirige"; los estados autenticados se prueban a
nivel de componente (`NextAppointmentCard.test.tsx`), no end-to-end.
