// Tema visual de ESTE proyecto de cliente. Sobreescribe las variables CSS que
// `@mgorrin/web-kit/design-system/tokens.css` declara con sus valores por
// defecto — retemar un cliente edita este archivo, nunca `tokens.css`.
export interface ThemeConfig {
  colorPrimary: string;
  colorAccent: string;
  colorBackground: string;
  colorSurface: string;
  colorBorder: string;
}

// Tema del cliente de ejemplo: Vitalis Capilar (clínica de injerto capilar).
// Navy profundo + dorado — paleta típica de clínicas estéticas premium
// (confianza médica + sensación de resultado de alta gama).
export const theme: ThemeConfig = {
  colorPrimary: "#0E2A3D",
  colorAccent: "#C9972B",
  colorBackground: "#FFFFFF",
  colorSurface: "#F7F5F1",
  colorBorder: "#E7E1D4",
};

// Serializado a un <style> en el root layout — así el override llega antes del
// primer paint, sin esperar a que React hidrate ningún componente.
export function themeCssVariables(t: ThemeConfig = theme): string {
  return (
    ":root{" +
    `--color-primary:${t.colorPrimary};` +
    `--color-accent:${t.colorAccent};` +
    `--color-background:${t.colorBackground};` +
    `--color-surface:${t.colorSurface};` +
    `--color-border:${t.colorBorder};` +
    "}"
  );
}
