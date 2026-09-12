import { readFileSync } from "node:fs";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, getDocs, collection, setDoc, deleteDoc } from "firebase/firestore";

const PROJECT_ID = process.env.FIREBASE_ADMIN_PROJECT_ID ?? "web-kit-test";

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: readFileSync("packages/web-kit/firestore.rules", "utf8"),
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

async function seedUser(uid: string, role: "super_admin" | "admin" | "specialist") {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), "users", uid), {
      uid,
      email: `${uid}@example.com`,
      displayName: uid,
      role,
      sedeId: null,
    });
  });
}

describe("firestore.rules — sedes", () => {
  it("permite leer sedes sin sesión", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "sedes", "sede-1"), {
        name: "Sede Centro",
        address: "Calle 1",
        hours: "Lun-Vie 9am-6pm",
        contact: "555-0000",
        isDefault: true,
      });
    });
    const unauth = testEnv.unauthenticatedContext();
    await assertSucceeds(getDocs(collection(unauth.firestore(), "sedes")));
  });

  it("deniega escribir sedes a un usuario sin rol admin", async () => {
    await seedUser("specialist-uid", "specialist");
    const specialist = testEnv.authenticatedContext("specialist-uid");
    await assertFails(
      setDoc(doc(specialist.firestore(), "sedes", "sede-1"), {
        name: "Sede Centro",
        address: "Calle 1",
        hours: "Lun-Vie 9am-6pm",
        contact: "555-0000",
        isDefault: true,
      }),
    );
  });

  it("permite escribir y borrar sedes a un usuario admin", async () => {
    await seedUser("admin-uid", "admin");
    const admin = testEnv.authenticatedContext("admin-uid");
    const ref = doc(admin.firestore(), "sedes", "sede-1");
    await assertSucceeds(
      setDoc(ref, {
        name: "Sede Centro",
        address: "Calle 1",
        hours: "Lun-Vie 9am-6pm",
        contact: "555-0000",
        isDefault: true,
      }),
    );
    await assertSucceeds(deleteDoc(ref));
  });
});
