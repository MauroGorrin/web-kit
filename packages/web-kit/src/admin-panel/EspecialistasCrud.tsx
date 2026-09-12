"use client";

import * as React from "react";
import { Button, Card, Input } from "../design-system/index.ts";
import { createEspecialista, deleteEspecialista } from "./especialistas-repository.ts";
import type { Especialista } from "./types.ts";
import type { Sede } from "../multi-location/index.ts";

export interface EspecialistasCrudProps {
  especialistas: Especialista[];
  sedes: Sede[];
}

export function EspecialistasCrud({ especialistas, sedes }: EspecialistasCrudProps) {
  const [items, setItems] = React.useState(especialistas);
  const [name, setName] = React.useState("");
  const [sedeId, setSedeId] = React.useState(sedes[0]?.id ?? "");

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    if (!name || !sedeId) return;
    const created = await createEspecialista({ name, sedeId });
    setItems((prev) => [...prev, created]);
    setName("");
  }

  async function handleDelete(id: string) {
    await deleteEspecialista(id);
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  return (
    <Card>
      <form onSubmit={handleCreate} className="mb-6 flex flex-wrap items-end gap-3">
        <label>
          Nombre
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          Sede
          <select value={sedeId} onChange={(e) => setSedeId(e.target.value)}>
            {sedes.map((sede) => (
              <option key={sede.id} value={sede.id}>
                {sede.name}
              </option>
            ))}
          </select>
        </label>
        <Button type="submit">Agregar especialista</Button>
      </form>

      <ul>
        {items.map((especialista) => (
          <li key={especialista.id} className="flex items-center justify-between gap-3">
            <span>
              {especialista.name} — {especialista.active ? "activo" : "inactivo"}
            </span>
            <Button variant="outline" size="sm" onClick={() => handleDelete(especialista.id)}>
              Borrar
            </Button>
          </li>
        ))}
      </ul>
    </Card>
  );
}
