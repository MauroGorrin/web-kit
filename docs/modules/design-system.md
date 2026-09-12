# design-system

Componentes base y tokens visuales. **Siempre activo — nunca lleva flag en `modules.config.ts`.**

## Exports

| Export          | Tipo  | Notas                                                                                                   |
| --------------- | ----- | ------------------------------------------------------------------------------------------------------- |
| `Button`        | valor | Variantes: `primary` (default), `accent`, `outline`; tamaños `sm`/`md`/`lg`.                            |
| `Card`          | valor | Contenedor con borde/padding de `tokens.css`.                                                           |
| `Input`         | valor | Input estilizado, extiende `InputHTMLAttributes`.                                                       |
| `Dialog`        | valor | Namespace sobre `radix-ui` (`Dialog.Root`, `.Trigger`, `.Content`, `.Title`, `.Description`, `.Close`). |
| `ButtonVariant` | tipo  | `"primary" \| "accent" \| "outline"`.                                                                   |

También expone `tokens.css` vía el subpath `@mgorrin/web-kit/design-system/tokens.css` — se importa
una vez en el root layout (`apps/template/src/app/layout.tsx`).

## Re-temar un cliente

**Nunca se edita `tokens.css`.** Cada proyecto de cliente re-tema editando
`apps/template/theme.config.ts`, que inyecta un `<style>` sobreescribiendo las variables
`--color-*` en el layout. Ver tabla de tokens en `CLAUDE.md`, sección "Sistema de diseño".

## Reglas

- Único módulo autorizado a importar `radix-ui` — bloqueado en cualquier otro archivo por
  `no-restricted-imports` en `eslint.config.mjs`.
- Ningún componente hardcodea un color/radio/espaciado — todo lee una variable CSS.
