// Ver blueprint §8 (modelo de datos) — colección `leads`.
export type LeadStatus = "new" | "contacted" | "scheduled" | "client";

export interface LeadInteraction {
  at: Date;
  note: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: LeadStatus;
  notes: string;
  interactions: LeadInteraction[];
  hubspotContactId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLeadInput {
  name: string;
  email?: string | null;
  phone?: string | null;
  notes?: string;
}

/**
 * Base para futuros adapters (Pipedrive, etc.) — ver blueprint §11 y
 * `docs/modules/crm.md` (epic 03).
 */
export interface CrmAdapter {
  syncLead(lead: Lead): Promise<void>;
}
