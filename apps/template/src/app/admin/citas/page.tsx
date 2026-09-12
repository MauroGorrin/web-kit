import { CitasTable, listCitasBetween, listSedes } from "@mgorrin/web-kit";

export const dynamic = "force-dynamic";

export default async function AdminCitasPage() {
  const now = new Date();
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const [citas, sedes] = await Promise.all([listCitasBetween(now, in30Days), listSedes()]);

  return (
    <main className="flex min-h-screen flex-col gap-6 p-8">
      <h1 className="text-2xl font-semibold">Citas</h1>
      <CitasTable citas={citas} sedes={sedes} />
    </main>
  );
}
