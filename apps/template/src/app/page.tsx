import {
  Button,
  Card,
  Input,
  buildLocalBusinessJsonLd,
  buildMetadata,
  Ga4Script,
} from "@mgorrin/web-kit";

export const metadata = buildMetadata({
  title: "Web Kit",
  description: "Starter kit interno de la agencia — Next.js + Firebase.",
});

// Datos de ejemplo — cada proyecto de cliente los reemplaza con los suyos,
// igual que `theme.config.ts` con el tema visual.
const localBusiness = buildLocalBusinessJsonLd({
  name: "Web Kit",
  address: "Calle Falsa 123",
});

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness) }}
      />
      <Ga4Script />
      <Card className="w-full max-w-md">
        <h1 className="mb-2 text-2xl font-semibold">Web Kit</h1>
        <p className="mb-6 opacity-70">Starter kit interno de la agencia.</p>
        <Input placeholder="tu@email.com" className="mb-4" />
        <Button>Empezar</Button>
      </Card>
    </main>
  );
}
