import { Info } from "lucide-react";
import {
  buildMetadata,
  Dashboard,
  CitasTable,
  EspecialistasCrud,
  SedesCrud,
  type Cita,
  type Especialista,
  type Sede,
} from "@mgorrin/web-kit";

export const metadata = buildMetadata({
  title: "Demo del panel de administración — Vitalis Capilar",
  description:
    "Vista de demostración del CRM interno: agenda, sedes y especialistas, con datos de ejemplo.",
});

// Página de DEMOSTRACIÓN, deliberadamente fuera de /admin/** — no pasa por
// `admin/layout.tsx` (auth-rbac real) porque este ambiente de ejemplo no
// tiene un proyecto de Firebase real detrás, así que ningún login real es
// posible. Nunca usar este patrón en un cliente con backend real: el CRM
// real vive en /admin, protegido por sesión + rol (ver CLAUDE.md, "Regla de
// refuerzo"). Los datos de acá son fijos — crear/borrar en los formularios
// intenta escribir a Firestore de verdad y va a fallar sin backend real.
const HOY = new Date();

function enDias(dias: number, hora: number): Date {
  const fecha = new Date(HOY);
  fecha.setDate(fecha.getDate() + dias);
  fecha.setHours(hora, 0, 0, 0);
  return fecha;
}

const SEDES: Sede[] = [
  {
    id: "sede-caba",
    name: "Vitalis Capilar — CABA",
    address: "Av. Santa Fe 1500, CABA",
    hours: "Lun a Vie 9:00–19:00",
    contact: "+54 11 4000-0000",
    isDefault: true,
  },
  {
    id: "sede-cordoba",
    name: "Vitalis Capilar — Córdoba",
    address: "Av. Colón 500, Córdoba",
    hours: "Lun a Vie 9:00–18:00",
    contact: "+54 351 400-0000",
    isDefault: false,
  },
];

const ESPECIALISTAS: Especialista[] = [
  { id: "esp-1", name: "Dra. Valentina Ríos", sedeId: "sede-caba", active: true },
  { id: "esp-2", name: "Dr. Ignacio Duarte", sedeId: "sede-caba", active: true },
  { id: "esp-3", name: "Dra. Carla Núñez", sedeId: "sede-cordoba", active: true },
  { id: "esp-4", name: "Dr. Bruno Silva", sedeId: "sede-cordoba", active: false },
];

const CITAS: Cita[] = [
  {
    id: "cita-1",
    clientUid: null,
    sedeId: "sede-caba",
    especialistaId: "esp-1",
    datetime: enDias(1, 10),
    status: "confirmed",
    source: "calendly",
    notes: "Evaluación inicial — candidato a FUE",
    createdAt: enDias(-3, 9),
    updatedAt: enDias(-1, 9),
  },
  {
    id: "cita-2",
    clientUid: null,
    sedeId: "sede-caba",
    especialistaId: "esp-2",
    datetime: enDias(1, 15),
    status: "scheduled",
    source: "manual",
    notes: "Seguimiento post-operatorio, mes 3",
    createdAt: enDias(-5, 11),
    updatedAt: enDias(-5, 11),
  },
  {
    id: "cita-3",
    clientUid: null,
    sedeId: "sede-caba",
    especialistaId: "esp-1",
    datetime: enDias(2, 9),
    status: "confirmed",
    source: "calendly",
    notes: "Procedimiento FUE — 2.500 injertos",
    createdAt: enDias(-10, 14),
    updatedAt: enDias(-2, 10),
  },
  {
    id: "cita-4",
    clientUid: null,
    sedeId: "sede-cordoba",
    especialistaId: "esp-3",
    datetime: enDias(3, 11),
    status: "scheduled",
    source: "manual",
    notes: "Evaluación PRP",
    createdAt: enDias(-1, 16),
    updatedAt: enDias(-1, 16),
  },
  {
    id: "cita-5",
    clientUid: null,
    sedeId: "sede-caba",
    especialistaId: "esp-2",
    datetime: enDias(4, 14),
    status: "cancelled",
    source: "calendly",
    notes: "Reprogramar — el paciente pidió otra fecha",
    createdAt: enDias(-8, 10),
    updatedAt: enDias(-1, 12),
  },
  {
    id: "cita-6",
    clientUid: null,
    sedeId: "sede-cordoba",
    especialistaId: "esp-3",
    datetime: enDias(5, 10),
    status: "scheduled",
    source: "manual",
    notes: "Diseño de línea capilar",
    createdAt: enDias(-2, 9),
    updatedAt: enDias(-2, 9),
  },
  {
    id: "cita-7",
    clientUid: null,
    sedeId: "sede-caba",
    especialistaId: "esp-1",
    datetime: enDias(-2, 10),
    status: "completed",
    source: "calendly",
    notes: "Control post-operatorio, mes 8 — alta densidad confirmada",
    createdAt: enDias(-20, 9),
    updatedAt: enDias(-2, 12),
  },
  {
    id: "cita-8",
    clientUid: null,
    sedeId: "sede-caba",
    especialistaId: "esp-2",
    datetime: enDias(7, 16),
    status: "scheduled",
    source: "manual",
    notes: "Injerto de barba",
    createdAt: enDias(0, 8),
    updatedAt: enDias(0, 8),
  },
];

const CITAS_PROXIMOS_7_DIAS = CITAS.filter(
  (cita) => cita.datetime >= HOY && cita.datetime <= enDias(7, 23),
);

export default function DemoCrmPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 p-8">
      <div className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10 p-4 text-sm">
        <Info size={18} className="mt-0.5 shrink-0 text-[var(--color-accent)]" />
        <p className="opacity-80">
          <strong>Vista de demostración.</strong> Esta página muestra el panel de administración con
          datos de ejemplo, sin pasar por el login real (este ambiente no tiene un proyecto de
          Firebase real conectado). El panel real y protegido por sesión vive en <code>/admin</code>
          . Crear o borrar filas acá intenta escribir a Firestore de verdad y va a fallar sin un
          backend conectado.
        </p>
      </div>

      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-primary)]">
          Panel de administración — Vitalis Capilar
        </h1>
        <p className="mt-1 opacity-70">
          Así se ve el CRM interno: agenda de citas, sedes y especialistas.
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Resumen</h2>
        <Dashboard citasProximos7Dias={CITAS_PROXIMOS_7_DIAS} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Agenda</h2>
        <CitasTable citas={CITAS} sedes={SEDES} />
      </section>

      <section className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-[var(--color-primary)]">Sedes</h2>
          <SedesCrud sedes={SEDES} />
        </div>
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-[var(--color-primary)]">Especialistas</h2>
          <EspecialistasCrud especialistas={ESPECIALISTAS} sedes={SEDES} />
        </div>
      </section>
    </main>
  );
}
