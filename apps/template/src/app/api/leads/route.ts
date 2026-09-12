import { NextResponse, type NextRequest } from "next/server";
import { createOrUpdateLead } from "@mgorrin/web-kit/crm";
import { checkRateLimit, clientIpFrom } from "../../../lib/rate-limit";

interface CreateLeadBody {
  name?: unknown;
  email?: string | null;
  phone?: string | null;
  notes?: string;
}

// Endpoint público sin auth por diseño (formulario de contacto) — ver
// CN-012 del reporte Cyber Neo: sin límite de tasa, era un vector de
// spam/flood sobre la colección `leads`.
const LEADS_RATE_LIMIT = { limit: 5, windowMs: 60_000 };

export async function POST(request: NextRequest) {
  const rate = checkRateLimit(`leads:${clientIpFrom(request)}`, LEADS_RATE_LIMIT);
  if (!rate.allowed) {
    return NextResponse.json({ ok: false, error: { code: "RATE_LIMITED" } }, { status: 429 });
  }

  const body = (await request.json().catch(() => null)) as CreateLeadBody | null;

  // Validar en el borde — nombre siempre, y al menos uno de email/phone (ver
  // blueprint §8, restricciones de Lead).
  if (!body || typeof body.name !== "string" || !body.name || (!body.email && !body.phone)) {
    return NextResponse.json({ ok: false, error: { code: "BAD_REQUEST" } }, { status: 400 });
  }

  // `externalSync: false` — el flag real vive en `modules.config.ts`
  // (`crm.externalSync`), que E3-T1 todavía no ha construido. Hasta que ese
  // paso conecte el flag real, esta ruta nunca llama a HubSpot.
  const lead = await createOrUpdateLead(
    { name: body.name, email: body.email ?? null, phone: body.phone ?? null, notes: body.notes },
    { externalSync: false },
  );

  return NextResponse.json({ ok: true, data: lead }, { status: 201 });
}
