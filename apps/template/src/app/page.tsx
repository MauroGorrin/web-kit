import { headers } from "next/headers";
import Link from "next/link";
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
    "Recuperá tu cabello con la técnica de injerto capilar FUE de última generación. Evaluación inicial gratuita y resultados de aspecto natural.",
});

// Datos de ejemplo del cliente — cada proyecto real los reemplaza con los
// suyos, igual que theme.config.ts con la paleta visual.
const localBusiness = buildLocalBusinessJsonLd({
  name: "Vitalis Capilar",
  address: "Av. Santa Fe 1500, CABA, Argentina",
  telephone: "+54 11 4000-0000",
});

const SERVICIOS = [
  {
    nombre: "Injerto FUE",
    detalle:
      "Extracción folicular unidad por unidad, sin cicatriz lineal ni puntos de sutura. El estándar actual para resultados de aspecto natural.",
  },
  {
    nombre: "Injerto FUT",
    detalle: "Técnica de tira clásica para casos que requieren alta densidad en una sola sesión.",
  },
  {
    nombre: "PRP capilar",
    detalle:
      "Plasma rico en plaquetas para fortalecer el folículo y frenar la caída, antes o después del injerto.",
  },
  {
    nombre: "Barba y cejas",
    detalle: "Diseño de barba y cejas con vello propio, mismo criterio de densidad natural.",
  },
];

const PROCESO = [
  {
    paso: "1",
    titulo: "Evaluación gratuita",
    detalle: "Analizamos tu tipo de calvicie y zona donante, presencial o por videollamada.",
  },
  {
    paso: "2",
    titulo: "Diseño personalizado",
    detalle: "Trazamos la línea capilar según tu rostro junto a el/la especialista.",
  },
  {
    paso: "3",
    titulo: "Procedimiento ambulatorio",
    detalle: "Con anestesia local, en el día. Volvés a tu casa la misma tarde.",
  },
  {
    paso: "4",
    titulo: "Seguimiento post-operatorio",
    detalle: "Controles incluidos hasta ver el resultado final, entre 8 y 12 meses después.",
  },
];

const TESTIMONIOS = [
  {
    cita: "Vine con muchas dudas y el equipo me explicó cada paso. El resultado se ve completamente natural.",
    nombre: "Martín G.",
  },
  {
    cita: "Lo que más valoré fue el seguimiento post-operatorio — nunca sentí que me dejaran solo con el proceso.",
    nombre: "Gonzalo R.",
  },
  {
    cita: "La evaluación gratuita me sacó todas las dudas sobre si era candidato o no. Muy transparentes con los tiempos.",
    nombre: "Federico A.",
  },
];

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
      <section className="bg-[var(--color-primary)] px-8 py-20 text-white">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 text-center">
          <span className="rounded-full border border-white/25 px-4 py-1 text-sm opacity-80">
            Evaluación inicial sin cargo
          </span>
          <h1 className="text-3xl font-semibold sm:text-4xl md:text-5xl">
            Recuperá tu cabello. Recuperá tu confianza.
          </h1>
          <p className="max-w-2xl text-base opacity-80 sm:text-lg">
            Injerto capilar FUE de alta densidad, sin cirugía a cielo abierto y con resultados de
            aspecto natural, en un equipo especializado exclusivamente en restauración capilar.
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-4">
            <Link href="/agenda">
              <Button variant="accent" size="lg">
                Reservá tu evaluación gratuita
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
      </section>

      {/* Barra de confianza */}
      <section className="border-b border-[var(--color-border)] bg-[var(--color-surface)] px-8 py-10">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 text-center sm:grid-cols-4">
          {[
            { valor: "+12 años", etiqueta: "de experiencia" },
            { valor: "+3.000", etiqueta: "procedimientos realizados" },
            { valor: "Técnica FUE", etiqueta: "de última generación" },
            { valor: "100%", etiqueta: "especialistas certificados" },
          ].map((stat) => (
            <div key={stat.etiqueta}>
              <p className="text-xl font-semibold text-[var(--color-primary)] sm:text-2xl">
                {stat.valor}
              </p>
              <p className="text-sm opacity-70">{stat.etiqueta}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Servicios */}
      <section className="px-8 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-2 text-center text-2xl font-semibold text-[var(--color-primary)]">
            Nuestros procedimientos
          </h2>
          <p className="mx-auto mb-10 max-w-xl text-center opacity-70">
            Cada tratamiento se define en la evaluación inicial según tu tipo de calvicie y objetivo
            de densidad.
          </p>
          <div className="grid gap-6 sm:grid-cols-2">
            {SERVICIOS.map((servicio) => (
              <Card key={servicio.nombre}>
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
      <section id="proceso" className="bg-[var(--color-surface)] px-8 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-10 text-center text-2xl font-semibold text-[var(--color-primary)]">
            Cómo funciona el proceso
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESO.map((item) => (
              <div key={item.paso} className="flex flex-col gap-2">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white"
                  style={{ background: "var(--color-accent)" }}
                >
                  {item.paso}
                </span>
                <h3 className="font-semibold text-[var(--color-primary)]">{item.titulo}</h3>
                <p className="text-sm opacity-70">{item.detalle}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section className="px-8 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-10 text-center text-2xl font-semibold text-[var(--color-primary)]">
            Pacientes que ya empezaron su proceso
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {TESTIMONIOS.map((testimonio) => (
              <Card key={testimonio.nombre}>
                <p className="mb-4 italic opacity-80">&ldquo;{testimonio.cita}&rdquo;</p>
                <p className="text-sm font-semibold text-[var(--color-primary)]">
                  {testimonio.nombre}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="px-8 py-16" style={{ background: "var(--color-accent)" }}>
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center text-white">
          <h2 className="text-2xl font-semibold sm:text-3xl">
            Empezá tu transformación capilar hoy
          </h2>
          <p className="opacity-90">
            Agendá tu evaluación sin cargo y llevate un diagnóstico y presupuesto personalizado.
          </p>
          <Link href="/agenda">
            <Button variant="primary" size="lg" className="!bg-white !text-[var(--color-primary)]">
              Reservá tu lugar
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
