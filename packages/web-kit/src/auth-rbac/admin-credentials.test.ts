import { afterEach, describe, expect, it } from "vitest";
import {
  MissingFirebaseAdminCredentialsError,
  resolveAdminCredentials,
} from "./admin-credentials.ts";

const ENV_KEYS = [
  "FIRESTORE_EMULATOR_HOST",
  "FIREBASE_AUTH_EMULATOR_HOST",
  "FIREBASE_ADMIN_PROJECT_ID",
  "FIREBASE_ADMIN_CLIENT_EMAIL",
  "FIREBASE_ADMIN_PRIVATE_KEY",
] as const;

const original: Record<string, string | undefined> = {};
for (const key of ENV_KEYS) original[key] = process.env[key];

function clearEnv() {
  for (const key of ENV_KEYS) delete process.env[key];
}

afterEach(() => {
  for (const key of ENV_KEYS) {
    if (original[key] === undefined) delete process.env[key];
    else process.env[key] = original[key];
  }
});

describe("resolveAdminCredentials", () => {
  it("lanza MissingFirebaseAdminCredentialsError cuando falta FIREBASE_ADMIN_PRIVATE_KEY fuera del emulador", () => {
    clearEnv();
    process.env.FIREBASE_ADMIN_PROJECT_ID = "web-kit-test";
    process.env.FIREBASE_ADMIN_CLIENT_EMAIL = "sa@web-kit-test.iam.gserviceaccount.com";
    // FIREBASE_ADMIN_PRIVATE_KEY deliberadamente ausente.

    expect(() => resolveAdminCredentials()).toThrow(MissingFirebaseAdminCredentialsError);
    expect(() => resolveAdminCredentials()).toThrow(/FIREBASE_ADMIN_PRIVATE_KEY/);
  });

  it("nunca exige credenciales reales cuando los hosts del emulador están configurados", () => {
    clearEnv();
    process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
    process.env.FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099";

    const credentials = resolveAdminCredentials();
    expect(credentials.mode).toBe("emulator");
  });

  it("resuelve credenciales de cert cuando las tres variables están presentes", () => {
    clearEnv();
    process.env.FIREBASE_ADMIN_PROJECT_ID = "web-kit-test";
    process.env.FIREBASE_ADMIN_CLIENT_EMAIL = "sa@web-kit-test.iam.gserviceaccount.com";
    process.env.FIREBASE_ADMIN_PRIVATE_KEY =
      "-----BEGIN PRIVATE KEY-----\\nFAKE\\n-----END PRIVATE KEY-----\\n";

    const credentials = resolveAdminCredentials();
    expect(credentials.mode).toBe("cert");
    if (credentials.mode === "cert") {
      // Los \n escapados de la env var se convierten en saltos de línea reales.
      expect(credentials.privateKey).toContain("\n");
      expect(credentials.privateKey).not.toContain("\\n");
    }
  });
});
