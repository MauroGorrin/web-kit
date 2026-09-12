// Único punto de acceso a env para `apps/template` — ver CLAUDE.md, "Dónde
// vive cada cosa" y CN-005/CN-011 del reporte Cyber Neo. Nunca `process.env`
// suelto fuera de este archivo dentro de `apps/template/src/**`; los módulos
// de `packages/web-kit/src/**` mantienen sus propios resolvers de credenciales
// (`stripe-credentials.ts`, `resend-credentials.ts`, `admin-credentials.ts`)
// y quedan fuera del alcance de este archivo.
import { modulesConfig } from "../../modules.config";

export class MissingEnvVarError extends Error {
  constructor(name: string) {
    super(`Falta la variable de entorno ${name}. Ver .env.example.`);
    this.name = "MissingEnvVarError";
  }
}

function optional(name: string, fallback: string): string {
  return process.env[name] ?? fallback;
}

function requiredWhen(name: string, condition: boolean): string | undefined {
  const value = process.env[name];
  if (condition && !value) throw new MissingEnvVarError(name);
  return value;
}

/**
 * Validado al importar este módulo (falla el boot, no la primera request que
 * lo necesita) — importado una sola vez desde `app/layout.tsx`.
 */
function loadEnv() {
  return {
    isProduction: process.env.NODE_ENV === "production",
    siteUrl: optional("NEXT_PUBLIC_SITE_URL", "http://localhost:3000"),
    // Al activar `crm.externalSync`, `HUBSPOT_API_KEY` pasa de opcional a
    // requerido — ver `.claude/rules/modules.md`.
    hubspotApiKey: requiredWhen("HUBSPOT_API_KEY", modulesConfig.crm.externalSync),
  } as const;
}

export const env = loadEnv();
