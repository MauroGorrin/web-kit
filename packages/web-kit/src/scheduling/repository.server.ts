// Único escritor/lector server-side de la colección `citas` — ver
// `.claude/rules/firestore.md`. Usa el SDK admin (bypassa `firestore.rules`)
// porque TODOS los llamadores de este archivo son Route Handlers/Server
// Components — el SDK cliente ahí nunca queda autenticado como el usuario
// del request (no hay traspaso automático de cookie a sesión del SDK), así
// que las reglas (`isSignedIn()`, `isAdminOrAbove()`) siempre le negarían el
// paso. La autorización real la hace el caller en código, con
// `session.role`/`session.uid` ya verificados — ver CLAUDE.md, "Regla de
// refuerzo". Las reglas de Firestore siguen siendo la barrera real contra
// escrituras directas desde el navegador (ver `tests/rules/citas.test.ts`).
import "server-only";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { adminDb } from "../auth-rbac/firebase-admin.server.ts";
import { normalizeCreateCitaInput } from "./normalize.ts";
import type { Cita, CreateCitaInput, UpdateCitaInput } from "./types.ts";

const CITAS = "citas";

function toDate(value: unknown): Date {
  return value instanceof Timestamp ? value.toDate() : new Date(value as string);
}

function toCita(id: string, data: Record<string, unknown>): Cita {
  return {
    id,
    clientUid: (data.clientUid as string | null) ?? null,
    sedeId: data.sedeId as string,
    especialistaId: (data.especialistaId as string | null) ?? null,
    datetime: toDate(data.datetime),
    status: data.status as Cita["status"],
    source: data.source as Cita["source"],
    notes: (data.notes as string) ?? "",
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

export async function getCita(id: string): Promise<Cita | null> {
  const snapshot = await adminDb.collection(CITAS).doc(id).get();
  if (!snapshot.exists) return null;
  return toCita(snapshot.id, snapshot.data()!);
}

/**
 * No valida que `sedeId` exista — eso es responsabilidad de quien llama (el
 * Route Handler, que ya necesita el 404 tipado de la Sede antes de escribir).
 * Ver `apps/template/src/app/api/citas/route.ts`.
 */
export async function createCita(input: CreateCitaInput): Promise<Cita> {
  const normalized = normalizeCreateCitaInput(input);
  const ref = adminDb.collection(CITAS).doc();

  await ref.set({
    ...normalized,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  // `serverTimestamp()` es un sentinel — se relee el doc para devolver los
  // Timestamps reales que Firestore resolvió al escribir.
  const written = await ref.get();
  return toCita(ref.id, written.data()!);
}

/**
 * Usada por `client-portal` (E1-T6) para el "próxima cita" de `/portal`.
 * Requiere un índice compuesto (`clientUid` == , `datetime` >=, orderBy
 * `datetime`) en Firestore real — `packages/web-kit/firestore.indexes.json`
 * es de §19.6, fuera del alcance de archivos de las tareas que tocan este
 * archivo; Firestore señala el índice faltante con un link directo a la
 * consola si hace falta antes de que alguien lo declare.
 */
export async function listUpcomingCitasForClient(
  clientUid: string,
  options?: { limit?: number },
): Promise<Cita[]> {
  let q = adminDb
    .collection(CITAS)
    .where("clientUid", "==", clientUid)
    .where("datetime", ">=", Timestamp.fromDate(new Date()))
    .orderBy("datetime", "asc");
  if (options?.limit) q = q.limit(options.limit);

  const snapshot = await q.get();
  return snapshot.docs.map((d) => toCita(d.id, d.data()));
}

/**
 * Usada por `admin-panel` (E2-T1) para el dashboard ("citas próximos 7 días")
 * y el listado de `/admin/citas`. Sin filtro por `sedeId` a propósito — el
 * dashboard cuenta todas las sedes; ver mismo comentario de índice arriba.
 */
export async function listCitasBetween(start: Date, end: Date): Promise<Cita[]> {
  const snapshot = await adminDb
    .collection(CITAS)
    .where("datetime", ">=", Timestamp.fromDate(start))
    .where("datetime", "<=", Timestamp.fromDate(end))
    .orderBy("datetime", "asc")
    .get();
  return snapshot.docs.map((d) => toCita(d.id, d.data()));
}

export async function updateCita(id: string, patch: UpdateCitaInput): Promise<void> {
  // Firestore rechaza `undefined` como valor de campo — un patch parcial
  // desde el borde (Route Handler) trae claves ausentes como `undefined`,
  // nunca como ausentes de verdad.
  const fields = Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined));

  await adminDb
    .collection(CITAS)
    .doc(id)
    .update({
      ...fields,
      updatedAt: FieldValue.serverTimestamp(),
    });
}
