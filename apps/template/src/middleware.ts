import { NextResponse, type NextRequest } from "next/server";

// CSP con nonce por request — ver CN-004 del reporte Cyber Neo. Un
// `script-src 'self'` estático (sin nonce) bloquea los scripts inline que
// Next.js App Router inyecta para hidratar RSC streaming, rompiendo toda
// interactividad client-side (confirmado por los e2e reales: botones que
// nunca hidratan). El patrón de nonce por middleware es el recomendado por
// Next.js para App Router — ver
// https://nextjs.org/docs/app/guides/content-security-policy.
export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://api.stripe.com",
    "frame-src https://js.stripe.com https://checkout.stripe.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    // Corre en toda ruta de página — excluye assets estáticos/imagen para no
    // pagar el costo del middleware en cada chunk servido.
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
