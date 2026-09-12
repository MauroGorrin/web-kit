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

export const theme: ThemeConfig = {
  colorPrimary: "#0F172A",
  colorAccent: "#2563EB",
  colorBackground: "#FFFFFF",
  colorSurface: "#F8FAFC",
  colorBorder: "#E2E8F0",
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
