// Ver blueprint §8 (modelo de datos) — colección `sedes`.
export interface Sede {
  id: string;
  name: string;
  address: string;
  hours: string;
  contact: string;
  isDefault: boolean;
}

export type CreateSedeInput = Omit<Sede, "id" | "isDefault"> & { isDefault?: boolean };
export type UpdateSedeInput = Partial<Omit<Sede, "id">>;
