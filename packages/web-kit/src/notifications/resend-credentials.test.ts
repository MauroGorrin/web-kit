import { afterEach, describe, expect, it } from "vitest";
import { MissingResendApiKeyError, resolveResendApiKey } from "./resend-credentials.ts";

const original = process.env.RESEND_API_KEY;

afterEach(() => {
  if (original === undefined) delete process.env.RESEND_API_KEY;
  else process.env.RESEND_API_KEY = original;
});

describe("resolveResendApiKey", () => {
  it("lanza MissingResendApiKeyError cuando RESEND_API_KEY está ausente", () => {
    delete process.env.RESEND_API_KEY;
    expect(() => resolveResendApiKey()).toThrow(MissingResendApiKeyError);
  });

  it("retorna la key cuando está presente", () => {
    process.env.RESEND_API_KEY = "re_test_123";
    expect(resolveResendApiKey()).toBe("re_test_123");
  });
});
