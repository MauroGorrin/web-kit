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
