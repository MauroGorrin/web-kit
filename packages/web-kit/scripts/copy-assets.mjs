// tsc solo compila .ts/.tsx — este paso copia los assets no-TS (hoy, CSS de
// design-system) de src/ a dist/ preservando la misma ruta relativa, para que
// `exports["./design-system/tokens.css"]` en package.json resuelva contra algo
// real después de `pnpm build`.
import { cpSync, readdirSync, statSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const srcDir = join(root, "..", "src");
const distDir = join(root, "..", "dist");

const ASSET_EXTENSIONS = [".css"];

function copyAssets(dir) {
  for (const entry of readdirSync(dir)) {
    const srcPath = join(dir, entry);
    const stat = statSync(srcPath);
    if (stat.isDirectory()) {
      copyAssets(srcPath);
      continue;
    }
    if (!ASSET_EXTENSIONS.some((ext) => entry.endsWith(ext))) continue;
    const relative = srcPath.slice(srcDir.length + 1);
    const destPath = join(distDir, relative);
    mkdirSync(dirname(destPath), { recursive: true });
    cpSync(srcPath, destPath);
  }
}

copyAssets(srcDir);
