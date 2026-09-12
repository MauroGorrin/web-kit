---
"@mgorrin/web-kit": minor
---

Añade el módulo `client-portal`: `NextAppointmentCard` (fecha/hora/estado de la próxima cita, o el
estado vacío con enlace a `/agenda`) y `NotificationList`. Añade `listUpcomingCitasForClient` a
`scheduling`. Añade la ruta `/portal` en `apps/template`, dinámica, que redirige a `/` sin sesión.
