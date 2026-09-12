import { EspecialistasCrud, listEspecialistas, listSedes } from "@mgorrin/web-kit";

export const dynamic = "force-dynamic";

export default async function AdminEspecialistasPage() {
  const [especialistas, sedes] = await Promise.all([listEspecialistas(), listSedes()]);

  return (
    <main className="flex min-h-screen flex-col gap-6 p-8">
      <h1 className="text-2xl font-semibold">Especialistas</h1>
      <EspecialistasCrud especialistas={especialistas} sedes={sedes} />
    </main>
  );
}
