import { describe, expect, it } from "vitest";
import { modulesConfig, type ModulesConfig } from "./modules.config";
import { getAdminNavItems } from "./src/components/nav/AdminNav";

describe("modulesConfig", () => {
  it("no tiene ningún flag para design-system — nunca se apaga", () => {
    expect(modulesConfig).not.toHaveProperty("designSystem");
    expect(modulesConfig).not.toHaveProperty("design-system");
    expect(Object.keys(modulesConfig)).not.toContain("designSystem");
  });

  it("crm es un objeto con enabled y externalSync, no un booleano suelto", () => {
    expect(modulesConfig.crm).toEqual(
      expect.objectContaining({ enabled: expect.any(Boolean), externalSync: expect.any(Boolean) }),
    );
  });
});

describe("getAdminNavItems", () => {
  const allOn: ModulesConfig = {
    authRbac: true,
    multiLocation: true,
    scheduling: true,
    clientPortal: true,
    adminPanel: true,
    crm: { enabled: true, externalSync: false },
    notifications: true,
    seoAnalytics: true,
    payments: true,
    ecommerce: true,
  };

  it("siempre incluye el Dashboard", () => {
    const items = getAdminNavItems(allOn);
    expect(items.some((item) => item.href === "/admin")).toBe(true);
  });

  it("incluye /admin/citas solo si scheduling está activo", () => {
    expect(
      getAdminNavItems({ ...allOn, scheduling: true }).some((i) => i.href === "/admin/citas"),
    ).toBe(true);
    expect(
      getAdminNavItems({ ...allOn, scheduling: false }).some((i) => i.href === "/admin/citas"),
    ).toBe(false);
  });

  it("con todos los módulos activables en false, sigue retornando solo el Dashboard sin lanzar", () => {
    const allOff: ModulesConfig = {
      authRbac: false,
      multiLocation: false,
      scheduling: false,
      clientPortal: false,
      adminPanel: false,
      crm: { enabled: false, externalSync: false },
      notifications: false,
      seoAnalytics: false,
      payments: false,
      ecommerce: false,
    };
    expect(() => getAdminNavItems(allOff)).not.toThrow();
    expect(getAdminNavItems(allOff)).toEqual([{ href: "/admin", label: "Dashboard" }]);
  });
});
