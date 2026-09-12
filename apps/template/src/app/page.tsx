import { Button, Card, Input } from "@mgorrin/web-kit";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <Card className="w-full max-w-md">
        <h1 className="mb-2 text-2xl font-semibold">Web Kit</h1>
        <p className="mb-6 opacity-70">Starter kit interno de la agencia.</p>
        <Input placeholder="tu@email.com" className="mb-4" />
        <Button>Empezar</Button>
      </Card>
    </main>
  );
}
