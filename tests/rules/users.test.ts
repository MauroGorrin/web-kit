import { readFileSync } from "node:fs";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

// Sufijo por archivo — cada test file de esta carpeta corre en su propio
// "proyecto" del emulador, así `clearFirestore()` de uno nunca pisa los
// datos de otro cuando vitest los corre en paralelo (confirmado por
// ejecución real: `vitest run tests/rules` completo fallaba intermitente
// sin esto).
const PROJECT_ID = `${process.env.FIREBASE_ADMIN_PROJECT_ID ?? "web-kit-test"}-users`;

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

describe("firestore.rules — users", () => {
  it("deniega la lectura a un usuario sin sesión", async () => {
    await seedUser("otro-uid", "specialist");
    const unauth = testEnv.unauthenticatedContext();
    await assertFails(getDoc(doc(unauth.firestore(), "users", "otro-uid")));
  });

  it("permite a un usuario con rol admin leer cualquier documento de users", async () => {
    await seedUser("admin-uid", "admin");
    await seedUser("otro-uid", "specialist");
    const admin = testEnv.authenticatedContext("admin-uid");
    await assertSucceeds(getDoc(doc(admin.firestore(), "users", "otro-uid")));
  });

  it("permite a un usuario leer su propio documento", async () => {
    await seedUser("self-uid", "specialist");
    const self = testEnv.authenticatedContext("self-uid");
    await assertSucceeds(getDoc(doc(self.firestore(), "users", "self-uid")));
  });

  it("deniega escribir el propio documento a quien no es super_admin", async () => {
    await seedUser("self-uid", "admin");
    const self = testEnv.authenticatedContext("self-uid");
    await assertFails(
      updateDoc(doc(self.firestore(), "users", "self-uid"), { role: "super_admin" }),
    );
  });

  it("permite escribir a un usuario con rol super_admin", async () => {
    await seedUser("root-uid", "super_admin");
    await seedUser("otro-uid", "specialist");
    const root = testEnv.authenticatedContext("root-uid");
    await assertSucceeds(updateDoc(doc(root.firestore(), "users", "otro-uid"), { role: "admin" }));
  });
});
