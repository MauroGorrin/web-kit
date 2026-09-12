// Server-only — intercambia un ID token de Firebase Auth (recién obtenido en
// el navegador vía signInWithPopup) por una cookie de sesión httpOnly de
// larga duración, y crea `users/{uid}` con `role: "specialist"` por defecto
// si es el primer login. Ver blueprint §8, "Inicio de sesión".
import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "./firebase-admin.server.ts";
import type { Role } from "./types.ts";

const DEFAULT_EXPIRES_IN_MS = 1000 * 60 * 60 * 24 * 14; // 14 días

export class InvalidIdTokenError extends Error {
  constructor() {
    super("El ID token de Firebase Auth es inválido, expiró, o fue revocado.");
    this.name = "InvalidIdTokenError";
  }
}

export interface EstablishedSession {
  sessionCookie: string;
  uid: string;
  role: Role;
}

/**
 * Único punto que crea `users/{uid}` — nunca se llama fuera de este flujo de
 * login. No confundir con `session.ts` → `getSession()`, que solo LEE una
 * cookie ya existente y nunca lanza; esta función SÍ puede lanzar
 * `InvalidIdTokenError`, porque el caller (la ruta de login) necesita
 * distinguir "credencial inválida" de "todo bien".
 */
export async function establishSession(idToken: string): Promise<EstablishedSession> {
  let decoded;
  try {
    decoded = await adminAuth.verifyIdToken(idToken);
  } catch {
    throw new InvalidIdTokenError();
  }

  const userRef = adminDb.collection("users").doc(decoded.uid);
  const existing = await userRef.get();

  let role: Role;
  if (existing.exists) {
    role = (existing.data()?.role as Role | undefined) ?? "specialist";
  } else {
    role = "specialist";
    await userRef.set({
      uid: decoded.uid,
      email: decoded.email ?? "",
      displayName: decoded.name ?? decoded.email ?? "Usuario",
      role,
      sedeId: null,
      createdAt: FieldValue.serverTimestamp(),
    });
  }

  let sessionCookie: string;
  try {
    sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: DEFAULT_EXPIRES_IN_MS,
    });
  } catch {
    throw new InvalidIdTokenError();
  }

  return { sessionCookie, uid: decoded.uid, role };
}
