// Único escritor de la colección `especialistas` — ver `.claude/rules/firestore.md`.
import { collection, deleteDoc, doc, getDocs, setDoc, updateDoc } from "firebase/firestore";
import { getFirebaseDb } from "../auth-rbac/firebase-client.ts";
import type { CreateEspecialistaInput, Especialista, UpdateEspecialistaInput } from "./types.ts";

const ESPECIALISTAS = "especialistas";

function toEspecialista(id: string, data: Record<string, unknown>): Especialista {
  return {
    id,
    name: data.name as string,
    sedeId: data.sedeId as string,
    active: Boolean(data.active),
  };
}

export async function listEspecialistas(): Promise<Especialista[]> {
  const snapshot = await getDocs(collection(getFirebaseDb(), ESPECIALISTAS));
  return snapshot.docs.map((d) => toEspecialista(d.id, d.data()));
}

export async function createEspecialista(input: CreateEspecialistaInput): Promise<Especialista> {
  const ref = doc(collection(getFirebaseDb(), ESPECIALISTAS));
  const data = { name: input.name, sedeId: input.sedeId, active: input.active ?? true };
  await setDoc(ref, data);
  return toEspecialista(ref.id, data);
}

export async function updateEspecialista(
  id: string,
  patch: UpdateEspecialistaInput,
): Promise<void> {
  const fields = Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined));
  await updateDoc(doc(getFirebaseDb(), ESPECIALISTAS, id), fields);
}

export async function deleteEspecialista(id: string): Promise<void> {
  await deleteDoc(doc(getFirebaseDb(), ESPECIALISTAS, id));
}
