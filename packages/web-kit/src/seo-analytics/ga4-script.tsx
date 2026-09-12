"use client";

import * as React from "react";

const GA4_SCRIPT_ID = "ga4-init";

export interface Ga4ScriptProps {
  /** Por defecto lee `NEXT_PUBLIC_GA_MEASUREMENT_ID` — ver blueprint §11. */
  measurementId?: string;
}

/**
 * Sin `measurementId` no renderiza ni inyecta nada — nunca un script con
 * `undefined` en la URL. Ver acceptance #4 de E2-T4. Inyección manual (mismo
 * patrón que `scheduling/CalendlyEmbed.tsx`) en vez de `next/script`: ese
 * import no resuelve desde este paquete en modo ESM estricto porque `next`
 * no declara un mapa `exports` — confirmado por ejecución real.
 */
export function Ga4Script({
  measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
}: Ga4ScriptProps) {
  React.useEffect(() => {
    if (!measurementId) return;
    if (document.getElementById(GA4_SCRIPT_ID)) return;

    const gtagSrc = document.createElement("script");
    gtagSrc.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    gtagSrc.async = true;
    document.head.appendChild(gtagSrc);

    const init = document.createElement("script");
    init.id = GA4_SCRIPT_ID;
    init.textContent = `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${measurementId}');`;
    document.head.appendChild(init);
  }, [measurementId]);

  return null;
}
