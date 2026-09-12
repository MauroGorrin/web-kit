// Único escritor de la colección `sedes` — ver `.claude/rules/firestore.md`.
// Usa el SDK cliente: la autorización real la hace `firestore.rules`
// (`isAdminOrAbove()`), no este archivo — ver CLAUDE.md, "Regla de refuerzo".
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { getFirebaseDb } from "../auth-rbac/firebase-client.ts";
import { assertNoActiveChildren, isFirstSede } from "./guards.ts";
import type { CreateSedeInput, Sede, UpdateSedeInput } from "./types.ts";

const SEDES = "sedes";

function toSede(id: string, data: Record<string, unknown>): Sede {
  return {
    id,
    name: data.name as string,
    address: data.address as string,
    hours: data.hours as string,
    contact: data.contact as string,
    isDefault: Boolean(data.isDefault),
  };
}

export async function listSedes(): Promise<Sede[]> {
  const snapshot = await getDocs(collection(getFirebaseDb(), SEDES));
  return snapshot.docs.map((d) => toSede(d.id, d.data()));
}

export async function getSede(id: string): Promise<Sede | null> {
  const snapshot = await getDoc(doc(getFirebaseDb(), SEDES, id));
  if (!snapshot.exists()) return null;
  return toSede(snapshot.id, snapshot.data());
}

/** La primera Sede de un proyecto se marca `isDefault: true` automáticamente. */
export async function createSede(input: CreateSedeInput): Promise<Sede> {
  const db = getFirebaseDb();
  const existing = await getDocs(collection(db, SEDES));
  const isDefault = isFirstSede(existing.size) || Boolean(input.isDefault);

  const ref = doc(collection(db, SEDES));
  const data = {
    name: input.name,
    address: input.address,
    hours: input.hours,
    contact: input.contact,
    isDefault,
  };

  if (isDefault && existing.size > 0) {
    // Invariante del modelo de datos: exactamente una Sede `isDefault: true`
    // por cliente — al promover una nueva, se despromueve la anterior.
    await Promise.all(
      existing.docs
        .filter((d) => d.data().isDefault)
        .map((d) => updateDoc(d.ref, { isDefault: false })),
    );
  }

  await setDoc(ref, data);
  return toSede(ref.id, data);
}

export async function updateSede(id: string, patch: UpdateSedeInput): Promise<void> {
  await updateDoc(doc(getFirebaseDb(), SEDES, id), patch);
}

async function countActiveChildren(sedeId: string) {
  const db = getFirebaseDb();

  // Un `where("sedeId", "==", sedeId)` simple por colección — filtrar el
  // estado "activo" en memoria evita depender de un índice compuesto que
  // este módulo no es quien declara (`packages/web-kit/firestore.indexes.json`
  // pertenece a §19.6, fuera del alcance de archivos de esta tarea).
  const [especialistas, citas, productos] = await Promise.all([
    getDocs(query(collection(db, "especialistas"), where("sedeId", "==", sedeId))),
    getDocs(query(collection(db, "citas"), where("sedeId", "==", sedeId))),
    getDocs(query(collection(db, "productos"), where("sedeId", "==", sedeId))),
  ]);

  const activeCitasStatuses = new Set(["scheduled", "confirmed"]);

  return [
    {
      collection: "especialistas",
      count: especialistas.docs.filter((d) => d.data().active === true).length,
    },
    {
      collection: "citas",
      count: citas.docs.filter((d) => activeCitasStatuses.has(d.data().status)).length,
    },
    // Producto no tiene un flag "activo" propio (ver blueprint §8) — cualquier
    // Producto ligado a la Sede cuenta como hijo activo.
    { collection: "productos", count: productos.size },
  ];
}

/** Rechaza el borrado con `SedeDeletionConflictError` si hay hijos activos. */
export async function deleteSede(id: string): Promise<void> {
  const blockers = await countActiveChildren(id);
  assertNoActiveChildren(blockers);
  await deleteDoc(doc(getFirebaseDb(), SEDES, id));
}
