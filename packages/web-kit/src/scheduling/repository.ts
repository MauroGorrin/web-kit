// Único escritor de la colección `citas` — ver `.claude/rules/firestore.md` y
// CLAUDE.md "Ruta de una cita creada por Calendly". Usa el SDK cliente; la
// autorización real la hace `firestore.rules`.
import {
  Timestamp,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
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
