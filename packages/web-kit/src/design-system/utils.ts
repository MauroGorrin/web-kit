// Helper interno del módulo — no forma parte de la superficie pública (no se
// exporta desde index.ts). Une nombres de clase condicionales sin depender de
// una librería externa.
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
