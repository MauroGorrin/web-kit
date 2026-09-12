import { Dashboard } from "@mgorrin/web-kit";
import { listCitasBetween } from "@mgorrin/web-kit/scheduling";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const now = new Date();
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const citas = await listCitasBetween(now, in7Days);

  return (
    <main className="flex min-h-screen flex-col gap-6 p-8">
      <h1 className="text-2xl font-semibold">Admin</h1>
      <Dashboard citasProximos7Dias={citas} />
    </main>
  );
}
