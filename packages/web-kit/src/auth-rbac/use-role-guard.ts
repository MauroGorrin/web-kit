import type { Role } from "./types.ts";

/**
 * Verificación pura de rol. La usan tanto el hook de UI de abajo (cosmético)
 * como cualquier guard server-side (Route Handler, middleware) — la única
 * fuente de verdad real es siempre el servidor, ver CLAUDE.md "Regla de
 * refuerzo": ocultar un botón nunca sustituye la verificación server-side.
 */
export function hasRequiredRole(role: Role | null | undefined, allowed: readonly Role[]): boolean {
  return role != null && allowed.includes(role);
}

/**
 * Hook de conveniencia para mostrar/ocultar UI según el rol del usuario
 * actual. Puramente derivado — no dispara ningún efecto ni red — así que es
 * seguro de usar en cualquier componente sin ataduras a un provider concreto.
 */
export function useRoleGuard(role: Role | null | undefined, allowed: readonly Role[]): boolean {
  return hasRequiredRole(role, allowed);
}
