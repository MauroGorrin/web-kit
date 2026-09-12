// Server-only — verifica una cookie de sesión y resuelve el perfil de
// `users/{uid}`. Deliberadamente NO lee la cookie por sí mismo (evita acoplar
// esta librería a `next/headers`): el caller (un Route Handler o Server
// Component de `apps/template`) se la pasa ya extraída.
import "server-only";
import { adminAuth, adminDb } from "./firebase-admin.server.ts";
import type { Role, SessionUser } from "./types.ts";

/**
 * Nunca lanza — cualquier cookie ausente, inválida, expirada o revocada
 * resuelve a `null`. Ver acceptance #4 de E1-T3.
 */
export async function getSession(
  sessionCookie: string | null | undefined,
): Promise<SessionUser | null> {
  if (!sessionCookie) return null;

  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    const snapshot = await adminDb.collection("users").doc(decoded.uid).get();
    if (!snapshot.exists) return null;

    const data = snapshot.data() as {
      email: string;
      displayName: string;
      role: Role;
      sedeId: string | null;
    };

    return {
      uid: decoded.uid,
      email: data.email,
      displayName: data.displayName,
      role: data.role,
      sedeId: data.sedeId ?? null,
    };
  } catch {
    return null;
  }
}
