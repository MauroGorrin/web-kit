"use client";

import * as React from "react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { Button } from "../design-system/index.ts";
import { getFirebaseAuth } from "./firebase-client.ts";

export interface GoogleSignInButtonProps {
  /** Adónde ir tras un login exitoso si el rol es `specialist` — `admin`/`super_admin` siempre va a `/admin`. */
  redirectTo?: string;
}

/**
 * Botón "Continuar con Google" — ver blueprint §8, "Inicio de sesión".
 * `signInWithPopup` → ID token → `POST /api/auth/session` (intercambia el ID
 * token por la cookie httpOnly de sesión, y crea `users/{uid}` si es el
 * primer login) → redirige según el rol devuelto.
 */
export function GoogleSignInButton({ redirectTo = "/portal" }: GoogleSignInButtonProps) {
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSignIn() {
    setPending(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const credential = await signInWithPopup(getFirebaseAuth(), provider);
      const idToken = await credential.user.getIdToken();

      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      const body = await response.json();
      if (!body.ok) {
        throw new Error(body.error?.code ?? "ERROR");
      }

      const role = body.data?.role as string | undefined;
      window.location.href = role === "admin" || role === "super_admin" ? "/admin" : redirectTo;
    } catch (err) {
      setError(err instanceof Error ? err.message : "ERROR");
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button onClick={handleSignIn} disabled={pending} variant="outline">
        Continuar con Google
      </Button>
      {error ? <p role="alert">{error}</p> : null}
    </div>
  );
}
