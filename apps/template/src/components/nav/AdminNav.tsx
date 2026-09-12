import Link from "next/link";
import { modulesConfig, type ModulesConfig } from "../../../modules.config";

export interface AdminNavItem {
  href: string;
  label: string;
}

/**
 * Pura — separada del componente para que sea testeable directamente
 * (`modules.config.test.ts`) sin renderizar React.
 */
export function getAdminNavItems(config: ModulesConfig): AdminNavItem[] {
  const items: AdminNavItem[] = [{ href: "/admin", label: "Dashboard" }];
  if (config.scheduling) items.push({ href: "/admin/citas", label: "Citas" });
  if (config.adminPanel) items.push({ href: "/admin/especialistas", label: "Especialistas" });
  if (config.multiLocation) items.push({ href: "/admin/sedes", label: "Sedes" });
  return items;
}

export function AdminNav() {
  const items = getAdminNavItems(modulesConfig);

  return (
    <nav className="flex gap-4 border-b p-4">
      {items.map((item) => (
        <Link key={item.href} href={item.href}>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
