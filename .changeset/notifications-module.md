---
"@mgorrin/web-kit": minor
---

Añade el módulo `notifications`: `sendAppointmentEmail` (server-only, Resend) con templates
"confirmada"/"cancelada", nunca transaccional (un fallo se registra pero no revierte la Cita).
`POST /api/citas` y `PATCH /api/citas/[id]` en `apps/template` disparan el email correspondiente.
