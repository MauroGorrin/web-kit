export class UnmappedLeadStatusError extends Error {
  readonly code = "UNMAPPED_STATUS" as const;
  readonly status: string;

  constructor(status: string) {
    super(`El status de Lead "${status}" no tiene mapeo a una etapa de HubSpot.`);
    this.name = "UnmappedLeadStatusError";
    this.status = status;
  }
}
