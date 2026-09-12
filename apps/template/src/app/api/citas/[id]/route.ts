import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@mgorrin/web-kit/auth-rbac";
import { getSede, hasRequiredRole, type CitaStatus } from "@mgorrin/web-kit";
import { getCita, updateCita } from "@mgorrin/web-kit/scheduling";
import { sendAppointmentEmail } from "@mgorrin/web-kit/notifications";

function looksLikeEmail(value: string): boolean {
  return value.includes("@");
}

interface UpdateCitaBody {
  status?: CitaStatus;
  especialistaId?: string | null;
  datetime?: string;
  notes?: string;
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const sessionCookie = (await cookies()).get("session")?.value;
  const session = await getSession(sessionCookie);
  if (!session) {
    return NextResponse.json({ ok: false, error: { code: "UNAUTHORIZED" } }, { status: 401 });
  }
  // Solo admin/super_admin edita citas por esta ruta — ver blueprint §8,
  // "Protección de rutas". El cliente dueño de la cita se maneja aparte
  // (client-portal, E1-T6), no aquí.
  if (!hasRequiredRole(session.role, ["admin", "super_admin"])) {
    return NextResponse.json({ ok: false, error: { code: "FORBIDDEN" } }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as UpdateCitaBody | null;
  if (!body) {
    return NextResponse.json({ ok: false, error: { code: "BAD_REQUEST" } }, { status: 400 });
  }

  await updateCita(id, {
    status: body.status,
    especialistaId: body.especialistaId,
    datetime: body.datetime ? new Date(body.datetime) : undefined,
    notes: body.notes,
  });

  // Efecto secundario, nunca transaccional — ver acceptance #2 de E2-T3.
  // Nota: solo notifica al admin de la Sede (`sede.contact`) — no existe
  // todavía una función que resuelva el email del cliente dueño de la Cita
  // a partir de su `uid` (`auth-rbac` solo expone la sesión del usuario
  // ACTUAL, que aquí es el admin haciendo el PATCH, no el cliente).
  if (body.status === "cancelled") {
    const cita = await getCita(id);
    if (cita) {
      const sede = await getSede(cita.sedeId);
      if (sede && looksLikeEmail(sede.contact)) {
        sendAppointmentEmail({
          template: "cancelada",
          to: [sede.contact],
          clienteName: "Cliente",
          sedeName: sede.name,
          datetime: cita.datetime,
        }).catch((err: unknown) => {
          console.error("Fallo enviando el email de cancelación de la cita:", err);
        });
      }
    }
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
