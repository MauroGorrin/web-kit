// Limitador de tasa en memoria, por proceso — ver CN-012 del reporte Cyber
// Neo (`/api/leads` y `/api/checkout` no tenían ningún control de abuso).
// Deliberadamente simple: ventana fija por IP, sin dependencia externa nueva
// (no hay Redis/cache compartido provisionado en este proyecto). No protege
// contra un atacante distribuido en múltiples IPs ni sobrevive un restart,
// pero sí frena el caso común de un mismo cliente reintentando en loop.
// Si el proyecto pasa a correr en múltiples instancias, reemplazar el `Map`
// por un store compartido (Firestore con TTL, o Redis) sin cambiar la firma
// de `checkRateLimit`.
interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
}

export function checkRateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number },
): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (bucket.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  bucket.count += 1;
  return { allowed: true, remaining: limit - bucket.count };
}

export function clientIpFrom(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}
