// Allowlist del módulo crm — no un barrel.
export type { CreateLeadInput, CrmAdapter, Lead, LeadInteraction, LeadStatus } from "./types.ts";
export { UnmappedLeadStatusError } from "./errors.ts";
export { HubspotAdapter } from "./hubspot-adapter.ts";
export {
  createOrUpdateLead,
  markLeadScheduledByEmail,
  type CreateOrUpdateLeadOptions,
} from "./repository.server.ts";
