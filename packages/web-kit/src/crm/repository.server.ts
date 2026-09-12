// Único escritor server-side de la colección `leads` — ver
// `.claude/rules/firestore.md`. SDK admin: el único llamador de este archivo
// es `apps/template/src/app/api/leads/route.ts` (Route Handler) y el propio
// `apps/template/src/app/api/citas/route.ts` (para `markLeadScheduledByEmail`)
// — mismo motivo que `scheduling/repository.server.ts`.
import "server-only";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { adminDb } from "../auth-rbac/firebase-admin.server.ts";
import { HubspotAdapter } from "./hubspot-adapter.ts";
import type { CreateLeadInput, CrmAdapter, Lead } from "./types.ts";

const LEADS = "leads";

function toDate(value: unknown): Date {
  return value instanceof Timestamp ? value.toDate() : new Date(value as string);
}

function toLead(id: string, data: Record<string, unknown>): Lead {
  return {
    id,
    name: data.name as string,
    email: (data.email as string | null) ?? null,
    phone: (data.phone as string | null) ?? null,
    status: data.status as Lead["status"],
    notes: (data.notes as string) ?? "",
    interactions: ((data.interactions as Array<{ at: unknown; note: string }>) ?? []).map((i) => ({
      at: toDate(i.at),
      note: i.note,
    })),
    hubspotContactId: (data.hubspotContactId as string | null) ?? null,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

async function findLeadDocByEmail(email: string) {
  const snapshot = await adminDb.collection(LEADS).where("email", "==", email).limit(1).get();
  return snapshot.docs[0] ?? null;
}

export interface CreateOrUpdateLeadOptions {
  /**
   * Gatea la llamada real a HubSpot. Normalmente viene de
   * `modules.config.ts` → `crm.externalSync` (E3-T1 conecta el flag real) —
   * default `false`: cero llamadas de red, incluso con `HUBSPOT_API_KEY`
   * presente. Ver acceptance #2 de E2-T2.
   */
  externalSync?: boolean;
  /** Inyectable para tests — por defecto `HubspotAdapter`. */
  adapter?: CrmAdapter;
}

/** `POST /api/leads` — crea con `status: "new"` si es nuevo, o actualiza los datos de contacto si ya existía. */
export async function createOrUpdateLead(
  input: CreateLeadInput,
  options: CreateOrUpdateLeadOptions = {},
): Promise<Lead> {
  const email = input.email ?? null;
  const existingDoc = email ? await findLeadDocByEmail(email) : null;

  let lead: Lead;
  if (existingDoc) {
    const patch = {
      name: input.name,
      phone: input.phone ?? null,
      updatedAt: FieldValue.serverTimestamp(),
    };
    await existingDoc.ref.update(patch);
    lead = toLead(existingDoc.id, {
      ...existingDoc.data(),
      name: input.name,
      phone: input.phone ?? null,
    });
  } else {
    const ref = adminDb.collection(LEADS).doc();
    const data = {
      name: input.name,
      email,
      phone: input.phone ?? null,
      status: "new" as const,
      notes: input.notes ?? "",
      interactions: [],
      hubspotContactId: null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };
    await ref.set(data);
    lead = toLead(ref.id, { ...data, createdAt: new Date(), updatedAt: new Date() });
  }

  if (options.externalSync) {
    const adapter = options.adapter ?? new HubspotAdapter();
    await adapter.syncLead(lead);
  }

  return lead;
}

/**
 * Usada desde `apps/template/src/app/api/citas/route.ts`: una Cita creada por
 * un cliente con sesión que coincide por email con un Lead existente mueve
 * ese Lead a `status: "scheduled"` — ver blueprint §8, relación Lead/Cita
 * ("sin referencia inversa, evita acoplamiento entre módulos").
 */
export async function markLeadScheduledByEmail(email: string): Promise<void> {
  const existingDoc = await findLeadDocByEmail(email);
  if (!existingDoc) return;
  await existingDoc.ref.update({ status: "scheduled", updatedAt: FieldValue.serverTimestamp() });
}
