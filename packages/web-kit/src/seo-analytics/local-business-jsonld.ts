// Lógica pura — genera el bloque JSON-LD `LocalBusiness` (schema.org). Quien
// renderiza lo serializa dentro de un `<script type="application/ld+json">`.
export interface LocalBusinessData {
  name: string;
  address: string;
  telephone?: string;
  url?: string;
}

export interface LocalBusinessJsonLd {
  "@context": "https://schema.org";
  "@type": "LocalBusiness";
  name: string;
  address: string;
  telephone?: string;
  url?: string;
}

export function buildLocalBusinessJsonLd(data: LocalBusinessData): LocalBusinessJsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: data.name,
    address: data.address,
    ...(data.telephone ? { telephone: data.telephone } : {}),
    ...(data.url ? { url: data.url } : {}),
  };
}

/**
 * `JSON.stringify` no escapa `<`, así que un valor con `</script>` rompería
 * el bloque `<script type="application/ld+json">` que lo envuelve — ver
 * CN-021 del reporte Cyber Neo. Hoy `page.tsx` usa strings hardcodeadas, pero
 * este módulo está pensado para que cada proyecto de cliente lo llene con
 * datos propios, así que el escape va acá, no en cada call site.
 */
export function toJsonLdScript(data: LocalBusinessJsonLd): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
