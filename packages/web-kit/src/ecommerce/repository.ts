// Único escritor de la colección `productos` — ver `.claude/rules/firestore.md`.
// `pedidos` NO se escribe aquí: el único escritor es
// `payments/repository.server.ts`, disparado por el webhook de Stripe — ver
// acceptance #3 de E2-T6 ("usa el módulo payments sin un segundo camino de
// pago").
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
import type { CreateProductoInput, Producto, UpdateProductoInput } from "./types.ts";

const PRODUCTOS = "productos";

function toProducto(id: string, data: Record<string, unknown>): Producto {
  return {
    id,
    name: data.name as string,
    priceCents: data.priceCents as number,
    images: (data.images as string[]) ?? [],
    sedeId: data.sedeId as string,
    inventoryCount: (data.inventoryCount as number) ?? 0,
  };
}

/** Lectura pública (`firestore.rules`: `allow read: if true`) — filtra por Sede. */
export async function listProductosBySede(sedeId: string): Promise<Producto[]> {
  const snapshot = await getDocs(
    query(collection(getFirebaseDb(), PRODUCTOS), where("sedeId", "==", sedeId)),
  );
  return snapshot.docs.map((d) => toProducto(d.id, d.data()));
}

/**
 * Lectura pública de un solo Producto por id. Fuente de verdad server-side
 * para resolver precios reales — nunca confiar en un `priceCents` que llegue
 * desde el cliente (ver `apps/template/src/app/api/checkout/route.ts`).
 */
export async function getProductoById(id: string): Promise<Producto | null> {
  const snapshot = await getDoc(doc(getFirebaseDb(), PRODUCTOS, id));
  if (!snapshot.exists()) return null;
  return toProducto(snapshot.id, snapshot.data());
}

export async function createProducto(input: CreateProductoInput): Promise<Producto> {
  const ref = doc(collection(getFirebaseDb(), PRODUCTOS));
  await setDoc(ref, input);
  return toProducto(ref.id, input);
}

export async function updateProducto(id: string, patch: UpdateProductoInput): Promise<void> {
  const fields = Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined));
  await updateDoc(doc(getFirebaseDb(), PRODUCTOS, id), fields);
}

export async function deleteProducto(id: string): Promise<void> {
  await deleteDoc(doc(getFirebaseDb(), PRODUCTOS, id));
}
