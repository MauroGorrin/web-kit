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

Login: `auth-rbac` → `GoogleSignInButton` (ver `docs/modules/auth-rbac.md`) — un cliente sin cuenta
llega aquí después de "Continuar con Google" en la nav pública.
