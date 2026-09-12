# notifications

Emails transaccionales de citas vía Resend. Flag: `modulesConfig.notifications`.

## Exports — raíz y subpath

| Export                                                                | Tipo  | Notas                                                                  |
| --------------------------------------------------------------------- | ----- | ---------------------------------------------------------------------- |
| `renderAppointmentEmail(template, data)`                              | valor | Pura — genera `{ subject, html }` para `"confirmada"` o `"cancelada"`. |
| `MissingResendApiKeyError`                                            | valor | Lanzado al importar el cliente de Resend si falta `RESEND_API_KEY`.    |
| `AppointmentEmailTemplate` / `AppointmentEmailData` / `RenderedEmail` | tipo  | —                                                                      |

## Exports — **solo subpath**, server-only

| Export                        | Notas                                                                                                                                                                                                           |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sendAppointmentEmail(input)` | Efecto secundario, **nunca transaccional** — un fallo de envío se registra (`console.error`) pero nunca revierte la Cita ya creada/actualizada. `input.to` puede ser una lista vacía (no envía nada, no lanza). |

## Disparadores

- `POST /api/citas` → template `"confirmada"`, dirigido al cliente (si agendó con su propia cuenta) y
  al contacto de la Sede (`sede.contact`, si parece un email).
- `PATCH /api/citas/[id]` con `status: "cancelled"` → template `"cancelada"`, dirigido al contacto de
  la Sede (no hay todavía una forma de resolver el email del cliente dueño de la cita a partir de su
  `uid` únicamente).
