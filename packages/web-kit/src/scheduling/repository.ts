// Único escritor de la colección `citas` — ver `.claude/rules/firestore.md` y
// CLAUDE.md "Ruta de una cita creada por Calendly". Usa el SDK cliente; la
// autorización real la hace `firestore.rules`.
import {
  Timestamp,
  collection,
  doc,
  getDoc,
  getDocs,
  limit as fsLimit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type QueryConstraint,
} from "firebase/firestore";
import { getFirebaseDb } from "../auth-rbac/firebase-client.ts";
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
  const snapshot = await getDoc(doc(getFirebaseDb(), CITAS, id));
  if (!snapshot.exists()) return null;
  return toCita(snapshot.id, snapshot.data());
}

/**
 * No valida que `sedeId` exista — eso es responsabilidad de quien llama (el
 * Route Handler, que ya necesita el 404 tipado de la Sede antes de escribir).
 * Ver `apps/template/src/app/api/citas/route.ts`.
 */
export async function createCita(input: CreateCitaInput): Promise<Cita> {
  const db = getFirebaseDb();
  const normalized = normalizeCreateCitaInput(input);
  const ref = doc(collection(db, CITAS));

  await setDoc(ref, {
    ...normalized,
    datetime: normalized.datetime,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // `serverTimestamp()` es un sentinel — se relee el doc para devolver los
  // Timestamps reales que Firestore resolvió al escribir.
  const written = await getDoc(ref);
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
  const constraints: QueryConstraint[] = [
    where("clientUid", "==", clientUid),
    where("datetime", ">=", Timestamp.fromDate(new Date())),
    orderBy("datetime", "asc"),
  ];
  if (options?.limit) constraints.push(fsLimit(options.limit));

  const snapshot = await getDocs(query(collection(getFirebaseDb(), CITAS), ...constraints));
  return snapshot.docs.map((d) => toCita(d.id, d.data()));
}

export async function updateCita(id: string, patch: UpdateCitaInput): Promise<void> {
  // Firestore rechaza `undefined` como valor de campo — un patch parcial
  // desde el borde (Route Handler) trae claves ausentes como `undefined`,
  // nunca como ausentes de verdad.
  const fields = Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined));

  await updateDoc(doc(getFirebaseDb(), CITAS, id), {
    ...fields,
    updatedAt: serverTimestamp(),
  });
}
