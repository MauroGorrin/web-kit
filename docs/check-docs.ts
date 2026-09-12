// Confirma que existe un `docs/modules/<módulo>.md` por cada módulo
// exportado en `packages/web-kit/src/index.ts` — sale con código 1 si falta
// alguno. Corre con `node --experimental-strip-types docs/check-docs.ts`
// (solo anotaciones de tipo simples: sin enums ni namespaces, para que el
// type-stripping nativo de Node lo acepte).
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT_INDEX = join("packages", "web-kit", "src", "index.ts");
const DOCS_DIR = join("docs", "modules");

function findModuleNames(): string[] {
  const content = readFileSync(ROOT_INDEX, "utf8");
  const names = new Set<string>();
  const importPathRegex = /from\s+["']\.\/([a-z0-9-]+)\//g;

  let match: RegExpExecArray | null;
  while ((match = importPathRegex.exec(content)) !== null) {
    const name = match[1];
    if (name) names.add(name);
  }

  return [...names].sort();
}

function main(): void {
  const moduleNames = findModuleNames();
  const missing: string[] = [];

  for (const name of moduleNames) {
    const docPath = join(DOCS_DIR, `${name}.md`);
    if (!existsSync(docPath)) {
      missing.push(name);
    }
  }

  if (missing.length > 0) {
    console.error(
      `Faltan docs/modules/<módulo>.md para: ${missing.join(", ")}. ` +
        `Cada módulo exportado en ${ROOT_INDEX} necesita su doc — ver .claude/skills/add-a-module.`,
    );
    process.exit(1);
  }

  console.log(
    `OK — ${moduleNames.length} módulos encontrados en ${ROOT_INDEX}, cada uno con su docs/modules/<módulo>.md.`,
  );
}

main();
