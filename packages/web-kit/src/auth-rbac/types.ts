// Ver blueprint §8 — el perfil interno de `users/{uid}` y sus roles.
export type Role = "super_admin" | "admin" | "specialist";

export interface SessionUser {
  uid: string;
  email: string;
  displayName: string;
  role: Role;
  sedeId: string | null;
}
