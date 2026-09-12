import { SedesCrud, listSedes } from "@mgorrin/web-kit";

export const dynamic = "force-dynamic";

export default async function AdminSedesPage() {
  const sedes = await listSedes();

  return (
    <main className="flex min-h-screen flex-col gap-6 p-8">
      <h1 className="text-2xl font-semibold">Sedes</h1>
      <SedesCrud sedes={sedes} />
    </main>
  );
}
