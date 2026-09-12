// Ver blueprint §8 (modelo de datos) — colección `especialistas`. Ningún otro
// módulo reclama esta colección, así que `admin-panel` es su único escritor.
export interface Especialista {
  id: string;
  name: string;
  sedeId: string;
  active: boolean;
}

export type CreateEspecialistaInput = Omit<Especialista, "id" | "active"> & { active?: boolean };
export type UpdateEspecialistaInput = Partial<Omit<Especialista, "id">>;
