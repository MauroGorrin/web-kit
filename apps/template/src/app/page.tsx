import { headers } from "next/headers";
import Link from "next/link";
import {
  Award,
  CalendarCheck,
  Droplet,
  HeartPulse,
  Layers,
  PenTool,
  Scissors,
  ShieldCheck,
  Smile,
  Star,
  Users,
} from "lucide-react";
import {
  Button,
  Card,
  buildLocalBusinessJsonLd,
  buildMetadata,
  Ga4Script,
  toJsonLdScript,
} from "@mgorrin/web-kit";

export const metadata = buildMetadata({
  title: "Vitalis Capilar — Injerto capilar FUE en Buenos Aires",
  description:
    "Recupera tu cabello con la técnica de injerto capilar FUE de última generación. Evaluación inicial gratuita y resultados de aspecto natural.",
});

// Datos de ejemplo del cliente — cada proyecto real los reemplaza con los
// suyos, igual que theme.config.ts con la paleta visual.
const localBusiness = buildLocalBusinessJsonLd({
  name: "Vitalis Capilar",
  address: "Av. Santa Fe 1500, CABA, Argentina",
  telephone: "+54 11 4000-0000",
});

const STATS = [
  { valor: "+12 años", etiqueta: "de experiencia", icon: Award },
  { valor: "+3.000", etiqueta: "procedimientos realizados", icon: Users },
  { valor: "Técnica FUE", etiqueta: "de última generación", icon: Droplet },
  { valor: "100%", etiqueta: "especialistas certificados", icon: ShieldCheck },
];

const SERVICIOS = [
  {
    nombre: "Injerto FUE",
    detalle:
      "Extracción folicular unidad por unidad, sin cicatriz lineal ni puntos de sutura. El estándar actual para resultados de aspecto natural.",
    icon: Scissors,
  },
  {
    nombre: "Injerto FUT",
    detalle: "Técnica de tira clásica para casos que requieren alta densidad en una sola sesión.",
    icon: Layers,
  },
  {
    nombre: "PRP capilar",
    detalle:
      "Plasma rico en plaquetas para fortalecer el folículo y frenar la caída, antes o después del injerto.",
    icon: Droplet,
  },
  {
    nombre: "Barba y cejas",
    detalle: "Diseño de barba y cejas con vello propio, con el mismo criterio de densidad natural.",
    icon: Smile,
  },
];

const PROCESO = [
  {
    titulo: "Evaluación gratuita",
    detalle: "Analizamos el tipo de calvicie y la zona donante, presencial o por videollamada.",
    icon: CalendarCheck,
  },
  {
    titulo: "Diseño personalizado",
    detalle: "Trazamos la línea capilar según el rostro, junto al especialista a cargo.",
    icon: PenTool,
  },
  {
    titulo: "Procedimiento ambulatorio",
    detalle: "Con anestesia local, en el día. El paciente vuelve a casa la misma tarde.",
    icon: Scissors,
  },
  {
    titulo: "Seguimiento post-operatorio",
    detalle: "Controles incluidos hasta ver el resultado final, entre 8 y 12 meses después.",
    icon: HeartPulse,
  },
];

const TESTIMONIOS = [
  {
    cita: "Llegué con muchas dudas y el equipo explicó cada paso con calma. El resultado se ve completamente natural.",
    nombre: "Martín G.",
  },
  {
    cita: "Lo que más se valora es el seguimiento post-operatorio — en ningún momento se sintió un proceso solitario.",
    nombre: "Gonzalo R.",
  },
  {
    cita: "La evaluación gratuita despejó todas las dudas sobre si era candidato o no. Muy transparentes con los tiempos.",
    nombre: "Federico A.",
  },
];

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default async function Home() {
  // Nonce por request de la CSP (`src/middleware.ts`).
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <main className="flex min-h-screen flex-col">
      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: toJsonLdScript(localBusiness) }}
      />
      <Ga4Script nonce={nonce} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-[var(--color-primary)] px-8 py-20 text-white sm:py-28">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--color-accent) 0%, transparent 70%)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full opacity-10 blur-3xl"
          style={{ background: "radial-gradient(circle, #ffffff 0%, transparent 70%)" }}
        />

        <div className="relative mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="flex flex-col items-start gap-6 text-left">
            <span className="rounded-full border border-white/25 px-4 py-1 text-sm opacity-80">
              Evaluación inicial sin cargo
            </span>
            <h1 className="text-3xl leading-tight font-semibold sm:text-4xl md:text-5xl">
              Recupera tu cabello. Recupera tu confianza.
            </h1>
            <p className="max-w-xl text-base opacity-80 sm:text-lg">
              Injerto capilar FUE de alta densidad, sin cirugía a cielo abierto y con resultados de
              aspecto natural, en un equipo especializado exclusivamente en restauración capilar.
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-4">
              <Link href="/agenda">
                <Button variant="accent" size="lg">
                  Reserva tu evaluación gratuita
                </Button>
              </Link>
              <a href="#proceso">
                <Button
                  variant="outline"
                  size="lg"
                  className="!border-white/40 !text-white hover:!bg-white/10"
                >
                  Ver cómo funciona
                </Button>
              </a>
            </div>
          </div>

          <div className="hidden lg:block">
            <Card className="!border-white/15 !bg-white/10 backdrop-blur-sm">
              <div className="mb-5 flex gap-1 text-[var(--color-accent)]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={18} fill="currentColor" strokeWidth={0} />
                ))}
              </div>
              <p className="mb-6 text-sm text-white/80">
                Calificación promedio de pacientes tratados en los últimos 12 meses.
              </p>
              <div className="flex flex-col gap-4 border-t border-white/15 pt-5">
                {STATS.slice(0, 3).map((stat) => (
                  <div key={stat.etiqueta} className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10">
                      <stat.icon size={18} />
                    </span>
                    <div>
                      <p className="font-semibold">{stat.valor}</p>
                      <p className="text-xs text-white/70">{stat.etiqueta}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Barra de confianza */}
      <section className="border-b border-[var(--color-border)] bg-[var(--color-surface)] px-8 py-10">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 text-center sm:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.etiqueta} className="flex flex-col items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                <stat.icon size={20} />
              </span>
              <p className="text-xl font-semibold text-[var(--color-primary)] sm:text-2xl">
                {stat.valor}
              </p>
              <p className="text-sm opacity-70">{stat.etiqueta}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Servicios */}
      <section className="px-8 py-20">
        <div className="mx-auto max-w-5xl">
          <p className="mb-2 text-center text-sm font-semibold tracking-wide text-[var(--color-accent)] uppercase">
            Tratamientos
          </p>
          <h2 className="mb-3 text-center text-2xl font-semibold text-[var(--color-primary)] sm:text-3xl">
            Un procedimiento para cada tipo de calvicie
          </h2>
          <p className="mx-auto mb-12 max-w-xl text-center opacity-70">
            Cada tratamiento se define en la evaluación inicial según el tipo de calvicie y el
            objetivo de densidad.
          </p>
          <div className="grid gap-6 sm:grid-cols-2">
            {SERVICIOS.map((servicio) => (
              <Card key={servicio.nombre} className="!shadow-sm transition hover:!shadow-md">
                <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-primary)] text-white">
                  <servicio.icon size={20} />
                </span>
                <h3 className="mb-2 text-lg font-semibold text-[var(--color-primary)]">
                  {servicio.nombre}
                </h3>
                <p className="opacity-70">{servicio.detalle}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="proceso" className="bg-[var(--color-surface)] px-8 py-20">
        <div className="mx-auto max-w-5xl">
          <p className="mb-2 text-center text-sm font-semibold tracking-wide text-[var(--color-accent)] uppercase">
            El proceso
          </p>
          <h2 className="mb-12 text-center text-2xl font-semibold text-[var(--color-primary)] sm:text-3xl">
            Cómo funciona, de principio a fin
          </h2>
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESO.map((item, index) => (
              <div key={item.titulo} className="relative flex flex-col items-start gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-full text-white shadow-sm bg-[var(--color-accent)]">
                  <item.icon size={22} />
                </span>
                <span className="text-xs font-semibold tracking-wide text-[var(--color-accent)] uppercase">
                  Paso {index + 1}
                </span>
                <h3 className="font-semibold text-[var(--color-primary)]">{item.titulo}</h3>
                <p className="text-sm opacity-70">{item.detalle}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section className="px-8 py-20">
        <div className="mx-auto max-w-5xl">
          <p className="mb-2 text-center text-sm font-semibold tracking-wide text-[var(--color-accent)] uppercase">
            Testimonios
          </p>
          <h2 className="mb-12 text-center text-2xl font-semibold text-[var(--color-primary)] sm:text-3xl">
            Pacientes que ya iniciaron su proceso
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {TESTIMONIOS.map((testimonio) => (
              <Card key={testimonio.nombre} className="flex flex-col !shadow-sm">
                <div className="mb-4 flex gap-1 text-[var(--color-accent)]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" strokeWidth={0} />
                  ))}
                </div>
                <p className="mb-6 flex-1 italic opacity-80">&ldquo;{testimonio.cita}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-primary)] text-xs font-semibold text-white">
                    {initials(testimonio.nombre)}
                  </span>
                  <p className="text-sm font-semibold text-[var(--color-primary)]">
                    {testimonio.nombre}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="px-8 py-20" style={{ background: "var(--color-accent)" }}>
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center text-white">
          <h2 className="text-2xl font-semibold sm:text-3xl">
            Empieza tu transformación capilar hoy
          </h2>
          <p className="opacity-90">
            Agenda tu evaluación sin cargo y obtén un diagnóstico y presupuesto personalizado.
          </p>
          <Link href="/agenda">
            <Button variant="primary" size="lg" className="!bg-white !text-[var(--color-primary)]">
              Reserva tu lugar
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
