"use client";

import { signOut } from "firebase/auth";
import { Button } from "../design-system/index.ts";
import { getFirebaseAuth } from "./firebase-client.ts";

/**
 * Cierra la sesión del SDK cliente Y la cookie de sesión server-side, en ese
 * orden — ver blueprint §8, "Cierre de sesión".
 */
export function SignOutButton() {
  async function handleSignOut() {
    await signOut(getFirebaseAuth());
    await fetch("/api/auth/session", { method: "DELETE" });
    window.location.href = "/";
  }

  return (
    <Button variant="outline" onClick={handleSignOut}>
      Cerrar sesión
    </Button>
  );
}
