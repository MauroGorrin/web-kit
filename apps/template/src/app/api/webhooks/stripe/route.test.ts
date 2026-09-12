import { beforeEach, describe, expect, it, vi } from "vitest";

// `@mgorrin/web-kit/payments` transitivamente importa "server-only" y
// resuelve STRIPE_SECRET_KEY/STRIPE_WEBHOOK_SECRET al importar
// `stripe-provider.ts` — mockear el módulo completo evita que ese código
// real (y su comprobación de credenciales) se ejecute en el test. Mismo
// motivo que `auth-rbac/session.ts` no se testea con un import plano.
const verifyWebhookSignature = vi.fn();
const recordCheckoutSessionCompleted = vi.fn();

vi.mock("@mgorrin/web-kit/payments", () => ({
  // Clase real (no una arrow function) — el route handler hace
  // `new StripeProvider()`, y una arrow function no es invocable con `new`.
  StripeProvider: class {
    verifyWebhookSignature(...args: unknown[]) {
      return verifyWebhookSignature(...args);
    }
  },
  recordCheckoutSessionCompleted,
}));

const { POST } = await import("./route.ts");

function makeRequest(body: string, signature?: string): Request {
  return new Request("http://localhost/api/webhooks/stripe", {
    method: "POST",
    body,
    headers: signature ? { "stripe-signature": signature } : {},
  });
}

beforeEach(() => {
  verifyWebhookSignature.mockReset();
  recordCheckoutSessionCompleted.mockReset();
});

describe("POST /api/webhooks/stripe", () => {
  it("responde 400 y no escribe nada cuando falta el header stripe-signature", async () => {
    const res = await POST(makeRequest("{}") as never);
    expect(res.status).toBe(400);
    expect(verifyWebhookSignature).not.toHaveBeenCalled();
    expect(recordCheckoutSessionCompleted).not.toHaveBeenCalled();
  });

  it("responde 400 y no escribe nada cuando la firma es inválida", async () => {
    verifyWebhookSignature.mockImplementation(() => {
      throw new Error("Invalid signature");
    });

    const res = await POST(makeRequest("{}", "bad-sig") as never);

    expect(res.status).toBe(400);
    expect(recordCheckoutSessionCompleted).not.toHaveBeenCalled();
  });

  it('procesa "checkout.session.completed" con un event.id nuevo exactamente una vez', async () => {
    verifyWebhookSignature.mockReturnValue({
      id: "evt_1",
      type: "checkout.session.completed",
      data: { object: {} },
    });

    const res = await POST(makeRequest("{}", "good-sig") as never);

    expect(res.status).toBe(200);
    expect(recordCheckoutSessionCompleted).toHaveBeenCalledTimes(1);
    expect(recordCheckoutSessionCompleted).toHaveBeenCalledWith(
      expect.objectContaining({ id: "evt_1" }),
    );
  });

  it("responde 200 para un tipo de evento no manejado, sin llamar a recordCheckoutSessionCompleted", async () => {
    verifyWebhookSignature.mockReturnValue({
      id: "evt_2",
      type: "customer.created",
      data: { object: {} },
    });

    const res = await POST(makeRequest("{}", "good-sig") as never);

    expect(res.status).toBe(200);
    expect(recordCheckoutSessionCompleted).not.toHaveBeenCalled();
  });

  it("el mismo event.id entregado dos veces responde 200 ambas veces (la idempotencia real la garantiza recordCheckoutSessionCompleted, ver su propio test)", async () => {
    verifyWebhookSignature.mockReturnValue({
      id: "evt_3",
      type: "checkout.session.completed",
      data: { object: {} },
    });

    const first = await POST(makeRequest("{}", "good-sig") as never);
    const second = await POST(makeRequest("{}", "good-sig") as never);

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(recordCheckoutSessionCompleted).toHaveBeenCalledTimes(2);
  });
});
