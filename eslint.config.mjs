import { FlatCompat } from "@eslint/eslintrc";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({ baseDirectory: __dirname });

export default [
  {
    // El bundle del blueprint vive dentro del repo — excluirlo evita que ESLint
    // lo trate como una segunda raíz del proyecto (ver §19.6, "el bundle es
    // parte de la superficie de herramientas").
    ignores: ["blueprints/**", "**/dist/**", "**/.next/**", "node_modules/**"],
  },
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      // El ecosistema Radix migró a un único paquete unificado `radix-ui` en
      // 2026-02. Los paquetes legacy @radix-ui/react-* nunca deben importarse:
      // design-system es el único lugar autorizado a hablar con Radix.
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@radix-ui/react-*"],
              message:
                "Importa desde 'radix-ui' (paquete unificado). Los paquetes @radix-ui/react-* son legacy y solo design-system puede tocar Radix.",
            },
          ],
        },
      ],
    },
  },
];
