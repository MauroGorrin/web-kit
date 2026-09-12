import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSession } from "@mgorrin/web-kit/auth-rbac";
import { hasRequiredRole } from "@mgorrin/web-kit";
import { AdminNav } from "../../components/nav/AdminNav";

// Reforzado aquí, en el layout — cubre `/admin` y toda ruta hija. Ver
// CLAUDE.md, "Regla de refuerzo": esto es la verificación real, no un guard
// cosmético de UI.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const sessionCookie = (await cookies()).get("session")?.value;
  const session = await getSession(sessionCookie);

  if (!session) {
    redirect("/");
  }
  if (!hasRequiredRole(session.role, ["admin", "super_admin"])) {
    redirect("/portal");
  }

  return (
    <>
      <AdminNav />
      {children}
    </>
  );
}
