"use client";

import * as React from "react";
import { Button, Card, Input } from "../design-system/index.ts";
import {
  createSede,
  deleteSede,
  SedeDeletionConflictError,
  type Sede,
} from "../multi-location/index.ts";

export interface SedesCrudProps {
  sedes: Sede[];
}

export function SedesCrud({ sedes }: SedesCrudProps) {
  const [items, setItems] = React.useState(sedes);
  const [name, setName] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    if (!name || !address) return;
    const created = await createSede({ name, address, hours: "", contact: "" });
    setItems((prev) => [...prev, created]);
    setName("");
    setAddress("");
  }

  async function handleDelete(id: string) {
    setError(null);
    try {
      await deleteSede(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      // `SedeDeletionConflictError` (code "CONFLICT") — hay
      // especialistas/citas/productos activos ligados a esta Sede.
      if (err instanceof SedeDeletionConflictError) {
        setError(err.message);
      } else {
        throw err;
      }
    }
  }

  return (
    <Card>
      <form onSubmit={handleCreate} className="mb-6 flex flex-wrap items-end gap-3">
        <label>
          Nombre
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          Dirección
          <Input value={address} onChange={(e) => setAddress(e.target.value)} required />
        </label>
        <Button type="submit">Agregar sede</Button>
      </form>

      {error ? <p role="alert">{error}</p> : null}

      <ul>
        {items.map((sede) => (
          <li key={sede.id} className="flex items-center justify-between gap-3">
            <span>
              {sede.name} {sede.isDefault ? "(default)" : ""}
            </span>
            <Button variant="outline" size="sm" onClick={() => handleDelete(sede.id)}>
              Borrar
            </Button>
          </li>
        ))}
      </ul>
    </Card>
  );
}
