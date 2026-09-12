import { describe, expect, it } from "vitest";
import { hasRequiredRole, useRoleGuard } from "./use-role-guard.ts";

describe("hasRequiredRole", () => {
  it("permite cuando el rol está en la lista permitida", () => {
    expect(hasRequiredRole("admin", ["admin", "super_admin"])).toBe(true);
  });

  it("deniega cuando el rol no está en la lista permitida", () => {
    expect(hasRequiredRole("specialist", ["admin", "super_admin"])).toBe(false);
  });

  it("deniega cuando no hay rol (null o undefined)", () => {
    expect(hasRequiredRole(null, ["admin"])).toBe(false);
    expect(hasRequiredRole(undefined, ["admin"])).toBe(false);
  });
});

describe("useRoleGuard", () => {
  it("delega en hasRequiredRole", () => {
    expect(useRoleGuard("super_admin", ["super_admin"])).toBe(true);
    expect(useRoleGuard("admin", ["super_admin"])).toBe(false);
  });
});
