"use client";

import * as React from "react";
import { Button, Card, Input } from "../design-system/index.ts";
import type { Cita } from "../scheduling/index.ts";
import type { Sede } from "../multi-location/index.ts";

export interface CitasTableProps {
  citas: Cita[];
  sedes: Sede[];
  onCreated?: (cita: Cita) => void;
}

/**
 * El admin NUNCA escribe `citas` directamente — este formulario llama al
 * mismo `POST /api/citas` que ya construyó `scheduling` (E1-T5). Un segundo
 * escritor rompería la garantía de "único escritor por colección". Ver
 * CLAUDE.md, "Convenciones que muerden", epic 02.
 */
export function CitasTable({ citas, sedes, onCreated }: CitasTableProps) {
  const [items, setItems] = React.useState(citas);
  const [datetime, setDatetime] = React.useState("");
  const [sedeId, setSedeId] = React.useState(sedes[0]?.id ?? "");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Con una sola Sede, el selector se oculta y esa Sede queda preseleccionada
  // — ver acceptance #4 de E2-T1.
  const showSedeSelector = sedes.length > 1;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/citas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sedeId, datetime, source: "manual", clientUid: null }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(body?.error?.code ?? "ERROR");
      }
      setItems((prev) => [...prev, body.data]);
      onCreated?.(body.data);
      setDatetime("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "ERROR");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="mb-6 flex flex-wrap items-end gap-3">
        {showSedeSelector ? (
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
        ) : (
          <input type="hidden" value={sedeId} readOnly />
        )}
        <label>
          Fecha y hora
          <Input
            type="datetime-local"
            value={datetime}
            onChange={(e) => setDatetime(e.target.value)}
            required
          />
        </label>
        <Button type="submit" disabled={submitting}>
          Agendar
        </Button>
        {error ? <p role="alert">{error}</p> : null}
      </form>

      <table className="w-full text-left text-sm">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Sede</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {items.map((cita) => (
            <tr key={cita.id}>
              <td>{cita.datetime.toLocaleString()}</td>
              <td>{cita.sedeId}</td>
              <td>{cita.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
