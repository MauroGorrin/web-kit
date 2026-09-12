"use client";

import * as React from "react";

const CALENDLY_WIDGET_SRC = "https://assets.calendly.com/assets/external/widget.js";

export interface CalendlyEmbedProps {
  /** Por defecto lee `NEXT_PUBLIC_CALENDLY_URL` — ver blueprint §11. */
  url?: string;
  className?: string;
}

/**
 * Embed inline de Calendly. En v1 no hay webhook de Calendly (ver CLAUDE.md,
 * "Ruta de una cita creada por Calendly") — el booking se sincroniza a mano
 * por el admin, este componente solo muestra el widget.
 */
export function CalendlyEmbed({
  url = process.env.NEXT_PUBLIC_CALENDLY_URL,
  className,
}: CalendlyEmbedProps) {
  React.useEffect(() => {
    if (!url) return;
    if (document.querySelector(`script[src="${CALENDLY_WIDGET_SRC}"]`)) return;

    const script = document.createElement("script");
    script.src = CALENDLY_WIDGET_SRC;
    script.async = true;
    document.body.appendChild(script);
  }, [url]);

  if (!url) return null;

  return (
    <div className={className} data-url={url} style={{ minWidth: "320px", height: "700px" }} />
  );
}
