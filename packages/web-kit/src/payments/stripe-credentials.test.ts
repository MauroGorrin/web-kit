import { afterEach, describe, expect, it } from "vitest";
import {
  MissingStripeSecretKeyError,
  MissingStripeWebhookSecretError,
  resolveStripeSecretKey,
  resolveStripeWebhookSecret,
} from "./stripe-credentials.ts";

const originalSecretKey = process.env.STRIPE_SECRET_KEY;
const originalWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

afterEach(() => {
  if (originalSecretKey === undefined) delete process.env.STRIPE_SECRET_KEY;
  else process.env.STRIPE_SECRET_KEY = originalSecretKey;
  if (originalWebhookSecret === undefined) delete process.env.STRIPE_WEBHOOK_SECRET;
  else process.env.STRIPE_WEBHOOK_SECRET = originalWebhookSecret;
});

describe("resolveStripeSecretKey", () => {
  it("lanza MissingStripeSecretKeyError si falta STRIPE_SECRET_KEY", () => {
    delete process.env.STRIPE_SECRET_KEY;
    expect(() => resolveStripeSecretKey()).toThrow(MissingStripeSecretKeyError);
  });

  it("retorna la key cuando está presente", () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_123";
    expect(resolveStripeSecretKey()).toBe("sk_test_123");
  });
});

describe("resolveStripeWebhookSecret", () => {
  it("lanza MissingStripeWebhookSecretError si falta STRIPE_WEBHOOK_SECRET", () => {
    delete process.env.STRIPE_WEBHOOK_SECRET;
    expect(() => resolveStripeWebhookSecret()).toThrow(MissingStripeWebhookSecretError);
  });

  it("retorna el secret cuando está presente", () => {
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_123";
    expect(resolveStripeWebhookSecret()).toBe("whsec_123");
  });
});
