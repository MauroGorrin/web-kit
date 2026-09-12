import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@mgorrin/web-kit/auth-rbac";
import { hasRequiredRole, type CitaStatus } from "@mgorrin/web-kit";
import { updateCita } from "@mgorrin/web-kit/scheduling";

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

  return NextResponse.json({ ok: true }, { status: 200 });
}
