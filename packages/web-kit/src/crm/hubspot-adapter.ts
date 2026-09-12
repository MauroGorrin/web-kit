// Server-only — sostiene `HUBSPOT_API_KEY`. Ver CLAUDE.md, límites de capas.
import "server-only";
import { mapStatusToStage } from "./stage-mapping.ts";
import type { CrmAdapter, Lead } from "./types.ts";

export class HubspotAdapter implements CrmAdapter {
  async syncLead(lead: Lead): Promise<void> {
    const stage = mapStatusToStage(lead.status);

    const apiKey = process.env.HUBSPOT_API_KEY;
    if (!apiKey) return;

    await fetch("https://api.hubapi.com/crm/v3/objects/contacts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        properties: {
          email: lead.email,
          firstname: lead.name,
          hs_lead_status: stage,
        },
      }),
    });
  }
}
