import type { NextConfig } from "next";

// Headers de seguridad aplicados a toda ruta — ver hallazgo CN-004 del
// reporte Cyber Neo (sin headers de defensa en profundidad, app con panel de
// admin/portal de cliente/checkout de Stripe). `Content-Security-Policy` NO
// va acá: necesita un nonce distinto por request para no romper la
// hidratación de Next.js App Router, así que la pone `src/middleware.ts`.
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  // `firebase-admin` arrastra `jwks-rsa` -> `jose` (ESM puro). Bundleado por
  // Turbopack en la función serverless, ese `require()` rompe con
  // ERR_REQUIRE_ESM en Vercel (confirmado: 500 real en producción, nunca en
  // dev local). `serverExternalPackages` saca el paquete del bundle y deja
  // que Node lo resuelva nativo desde `node_modules` en runtime.
  serverExternalPackages: ["firebase-admin"],
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
