import { readFileSync } from "node:fs";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { collection, doc, getDocs, setDoc, updateDoc } from "firebase/firestore";

// Sufijo por archivo — ver comentario en tests/rules/users.test.ts.
const PROJECT_ID = `${process.env.FIREBASE_ADMIN_PROJECT_ID ?? "web-kit-test"}-citas`;

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

async function seedCita(id: string, clientUid: string | null) {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), "citas", id), {
      clientUid,
      sedeId: "sede-1",
      especialistaId: null,
      datetime: new Date("2026-10-01T15:00:00Z"),
      status: "scheduled",
      source: "manual",
      notes: "",
    });
  });
}

describe("firestore.rules — citas", () => {
  it("deniega leer citas sin sesión", async () => {
    await seedCita("cita-1", "cliente-uid");
    const unauth = testEnv.unauthenticatedContext();
    await assertFails(getDocs(collection(unauth.firestore(), "citas")));
  });

  it("permite crear una cita a cualquier usuario con sesión", async () => {
    await seedUser("cliente-uid", "specialist");
    const cliente = testEnv.authenticatedContext("cliente-uid");
    await assertSucceeds(
      setDoc(doc(cliente.firestore(), "citas", "cita-1"), {
        clientUid: "cliente-uid",
        sedeId: "sede-1",
        especialistaId: null,
        datetime: new Date("2026-10-01T15:00:00Z"),
        status: "scheduled",
        source: "calendly",
        notes: "",
      }),
    );
  });

  it("deniega editar la cita de otro cliente a quien no es admin ni el dueño", async () => {
    await seedUser("otro-uid", "specialist");
    await seedCita("cita-1", "cliente-uid");
    const otro = testEnv.authenticatedContext("otro-uid");
    await assertFails(updateDoc(doc(otro.firestore(), "citas", "cita-1"), { status: "cancelled" }));
  });

  it("permite al cliente dueño editar su propia cita", async () => {
    await seedUser("cliente-uid", "specialist");
    await seedCita("cita-1", "cliente-uid");
    const cliente = testEnv.authenticatedContext("cliente-uid");
    await assertSucceeds(
      updateDoc(doc(cliente.firestore(), "citas", "cita-1"), { status: "cancelled" }),
    );
  });

  it("permite a un admin editar cualquier cita", async () => {
    await seedUser("admin-uid", "admin");
    await seedCita("cita-1", "cliente-uid");
    const admin = testEnv.authenticatedContext("admin-uid");
    await assertSucceeds(
      updateDoc(doc(admin.firestore(), "citas", "cita-1"), { status: "confirmed" }),
    );
  });
});
