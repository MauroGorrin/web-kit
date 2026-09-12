import { headers } from "next/headers";
import {
  Button,
  Card,
  Input,
  buildLocalBusinessJsonLd,
  buildMetadata,
  Ga4Script,
  toJsonLdScript,
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

export default async function Home() {
  // Nonce por request de la CSP (`src/middleware.ts`) — ver CN-004 del
  // reporte Cyber Neo.
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: toJsonLdScript(localBusiness) }}
      />
      <Ga4Script nonce={nonce} />
      <Card className="w-full max-w-md">
        <h1 className="mb-2 text-2xl font-semibold">Web Kit</h1>
        <p className="mb-6 opacity-70">Starter kit interno de la agencia.</p>
        <Input placeholder="tu@email.com" className="mb-4" />
        <Button>Empezar</Button>
      </Card>
    </main>
  );
}
