import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@mgorrin/web-kit/auth-rbac";
import { getSede } from "@mgorrin/web-kit";
import { createCita } from "@mgorrin/web-kit/scheduling";
import { markLeadScheduledByEmail } from "@mgorrin/web-kit/crm";

interface CreateCitaBody {
  clientUid?: string | null;
  sedeId?: unknown;
  especialistaId?: string | null;
  datetime?: unknown;
  source?: unknown;
  notes?: string;
}

export async function POST(request: NextRequest) {
  // Validar en el borde — ver CLAUDE.md, regla de código #5.
  const sessionCookie = (await cookies()).get("session")?.value;
  const session = await getSession(sessionCookie);
  if (!session) {
    return NextResponse.json({ ok: false, error: { code: "UNAUTHORIZED" } }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as CreateCitaBody | null;
  if (!body || typeof body.sedeId !== "string" || typeof body.datetime !== "string") {
    return NextResponse.json({ ok: false, error: { code: "BAD_REQUEST" } }, { status: 400 });
  }

  const sede = await getSede(body.sedeId);
  if (!sede) {
    return NextResponse.json({ ok: false, error: { code: "NOT_FOUND" } }, { status: 404 });
  }

  const cita = await createCita({
    // `clientUid: null` es válido a propósito — un cliente sin cuenta
    // agendado a mano por el admin (acceptance #5 de E1-T5).
    clientUid: body.clientUid ?? null,
    sedeId: body.sedeId,
    especialistaId: body.especialistaId ?? null,
    datetime: new Date(body.datetime),
    source: body.source === "manual" ? "manual" : "calendly",
    notes: typeof body.notes === "string" ? body.notes : "",
  });

  // Efecto secundario, nunca transaccional — si el cliente que agenda tiene
  // un Lead existente por email, se mueve a "scheduled". Un fallo aquí no
  // revierte la Cita ya creada. Ver blueprint §8 (relación Lead/Cita) y
  // acceptance #5 de E2-T2.
  if (cita.clientUid && session.email) {
    markLeadScheduledByEmail(session.email).catch((err: unknown) => {
      console.error("No se pudo actualizar el Lead asociado a la cita:", err);
    });
  }

  return NextResponse.json({ ok: true, data: cita }, { status: 201 });
}
