import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { establishSession } from "@mgorrin/web-kit/auth-rbac";

const SESSION_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 14; // 14 días — igual a create-session.server.ts

interface CreateSessionBody {
  idToken?: string;
}

/**
 * Intercambia un ID token de Firebase Auth (recién obtenido en el navegador
 * con `signInWithPopup`) por la cookie httpOnly `session` que el resto de la
 * app (`getSession()`) ya sabe leer. Crea `users/{uid}` con
 * `role: "specialist"` si es el primer login — ver blueprint §8.
 */
export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as CreateSessionBody | null;

  if (!body || typeof body.idToken !== "string" || !body.idToken) {
    return NextResponse.json({ ok: false, error: { code: "BAD_REQUEST" } }, { status: 400 });
  }

  let result;
  try {
    result = await establishSession(body.idToken);
  } catch (error) {
    // Evento de seguridad — ver CN-013 del reporte Cyber Neo (fallos de auth
    // no se registraban en ningún lado). Nunca loguear `idToken`/la cookie.
    console.warn("[auth] token de sesión inválido o expirado", {
      ip: request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "unknown",
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ ok: false, error: { code: "INVALID_ID_TOKEN" } }, { status: 401 });
  }

  (await cookies()).set("session", result.sessionCookie, {
    httpOnly: true,
    // Por defecto `true` — depender de `NODE_ENV === "production"` falla
    // abierto en cualquier despliegue que no fije esa variable exactamente
    // (ver CN-010 del reporte Cyber Neo). `env.isProduction` queda disponible
    // si algún entorno de desarrollo necesita relajarlo explícitamente.
    secure: true,
    sameSite: "lax",
    maxAge: SESSION_COOKIE_MAX_AGE_SECONDS,
    path: "/",
  });

  return NextResponse.json({ ok: true, data: { role: result.role } }, { status: 200 });
}

/** Cierre de sesión — borra la cookie httpOnly. Ver blueprint §8. */
export async function DELETE() {
  (await cookies()).delete("session");
  return NextResponse.json({ ok: true }, { status: 200 });
}
