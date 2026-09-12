import { beforeEach, describe, expect, it, vi } from "vitest";
import type Stripe from "stripe";

// Fake mínimo de Firestore Admin — suficiente para el uso real de
// `repository.server.ts` (collection().doc().get()/.set(), batch()). Vivo
// vía `vi.hoisted` para que el factory de `vi.mock` (que se hoistea antes de
// cualquier import) pueda referenciarlo.
const { fakeAdminDb, collectionSize } = vi.hoisted(() => {
  const store = new Map<string, Map<string, unknown>>();
  let autoId = 0;

  function collectionMap(name: string) {
    if (!store.has(name)) store.set(name, new Map());
    return store.get(name)!;
  }

  function makeDocRef(collectionName: string, id: string) {
    return {
      id,
      collectionName,
      async get() {
        const data = collectionMap(collectionName).get(id);
        return { exists: data !== undefined, data: () => data };
      },
      async set(data: unknown) {
        collectionMap(collectionName).set(id, data);
      },
    };
  }

  const fakeAdminDb = {
    collection(name: string) {
      return {
        doc(id?: string) {
          return makeDocRef(name, id ?? `auto-${autoId++}`);
        },
      };
    },
    batch() {
      const pending: Array<{ ref: ReturnType<typeof makeDocRef>; data: unknown }> = [];
      return {
        set(ref: ReturnType<typeof makeDocRef>, data: unknown) {
          pending.push({ ref, data });
          return this;
        },
        async commit() {
          for (const { ref, data } of pending) {
            collectionMap(ref.collectionName).set(ref.id, data);
          }
        },
      };
    },
  };

  function collectionSize(name: string): number {
    return store.has(name) ? store.get(name)!.size : 0;
  }

  return { fakeAdminDb, collectionSize };
});

// `server-only` lanza incondicionalmente bajo jsdom (define `window`) — se
// mockea a un no-op igual que Next.js lo alía en builds de servidor.
vi.mock("server-only", () => ({}));
vi.mock("../auth-rbac/firebase-admin.server.ts", () => ({ adminDb: fakeAdminDb }));

const { recordCheckoutSessionCompleted } = await import("./repository.server.ts");

function makeEvent(id: string, overrides: Partial<Stripe.Checkout.Session> = {}): Stripe.Event {
  return {
    id,
    type: "checkout.session.completed",
    data: {
      object: {
        client_reference_id: "cliente-uid",
        amount_total: 1999,
        payment_intent: "pi_123",
        metadata: null,
        ...overrides,
      },
    },
  } as unknown as Stripe.Event;
}

beforeEach(() => {
  // Cada test parte de colecciones vacías — se limpia reasignando el mapa
  // interno vía un nuevo fake no es trivial aquí, así que cada test usa un
  // `event.id` único en su lugar (evita interferencia entre tests).
});

describe("recordCheckoutSessionCompleted", () => {
  it("crea un Pedido y marca el event.id como procesado", async () => {
    await recordCheckoutSessionCompleted(makeEvent("evt_a"));
    expect(collectionSize("pedidos")).toBe(1);
    expect(collectionSize("stripe_webhook_events")).toBe(1);
  });

  it("el mismo event.id entregado dos veces no duplica el Pedido — no-op idempotente", async () => {
    const before = collectionSize("pedidos");
    await recordCheckoutSessionCompleted(makeEvent("evt_b"));
    const afterFirst = collectionSize("pedidos");
    await recordCheckoutSessionCompleted(makeEvent("evt_b"));
    const afterSecond = collectionSize("pedidos");

    expect(afterFirst).toBe(before + 1);
    expect(afterSecond).toBe(afterFirst);
  });

  it("event.id distintos sí crean Pedidos distintos", async () => {
    const before = collectionSize("pedidos");
    await recordCheckoutSessionCompleted(makeEvent("evt_c"));
    await recordCheckoutSessionCompleted(makeEvent("evt_d"));
    expect(collectionSize("pedidos")).toBe(before + 2);
  });
});
