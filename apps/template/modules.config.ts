// Única fuente de verdad sobre qué módulos activables están encendidos para
// ESTE proyecto de cliente — ver `.claude/rules/modules.md`. Ningún
// componente decide por su cuenta si renderizarse; siempre lee el flag
// correspondiente de aquí, vía import dinámico si el módulo pesa en el
// bundle (nunca un `if` alrededor de un import estático de nivel superior).
//
// `design-system` NUNCA se apaga — a propósito no tiene flag en este objeto
// (ver acceptance #4 de E3-T1).
export interface CrmModuleConfig {
  enabled: boolean;
  /**
   * Al encenderlo, `HUBSPOT_API_KEY` pasa de opcional a requerido — ver
   * `.env.example` y `.claude/rules/modules.md`.
   */
  externalSync: boolean;
}

export interface ModulesConfig {
  authRbac: boolean;
  multiLocation: boolean;
  scheduling: boolean;
  clientPortal: boolean;
  adminPanel: boolean;
  crm: CrmModuleConfig;
  notifications: boolean;
  seoAnalytics: boolean;
  payments: boolean;
  ecommerce: boolean;
}

export const modulesConfig: ModulesConfig = {
  authRbac: true,
  multiLocation: true,
  scheduling: true,
  clientPortal: true,
  adminPanel: true,
  crm: { enabled: true, externalSync: false },
  notifications: true,
  seoAnalytics: true,
  payments: true,
  ecommerce: true,
};
