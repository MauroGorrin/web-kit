import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

// Config raíz, consciente del workspace: cubre packages/web-kit y apps/template
// desde un único comando `vitest run` en la raíz del repo.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "apps/template/src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: [
      "packages/web-kit/src/**/*.test.{ts,tsx}",
      "apps/template/src/**/*.test.{ts,tsx}",
      "apps/template/*.test.{ts,tsx}",
      "scripts/**/*.test.{ts,tsx}",
    ],
    exclude: ["node_modules", "dist", ".next", "blueprints/**"],
    coverage: {
      exclude: ["blueprints/**", "node_modules/**", "dist/**", ".next/**"],
    },
  },
});
