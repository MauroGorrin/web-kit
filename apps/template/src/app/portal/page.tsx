import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSession } from "@mgorrin/web-kit/auth-rbac";
import { NextAppointmentCard, NotificationList } from "@mgorrin/web-kit";
import { listUpcomingCitasForClient } from "@mgorrin/web-kit/scheduling";

// Dinámico a propósito — la próxima cita depende de la sesión del request,
// nunca se puede pre-renderizar estáticamente. Ver blueprint §7.
export const dynamic = "force-dynamic";

export default async function PortalPage() {
  const sessionCookie = (await cookies()).get("session")?.value;
  const session = await getSession(sessionCookie);

  if (!session) {
    redirect("/");
  }

  const [nextCita] = await listUpcomingCitasForClient(session.uid, { limit: 1 });

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 p-8">
      <h1 className="text-2xl font-semibold text-[var(--color-primary)]">Portal del paciente</h1>
      <NextAppointmentCard cita={nextCita ?? null} />
      <NotificationList notifications={[]} />
    </main>
  );
}
