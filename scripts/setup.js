#!/usr/bin/env node
"use strict";

// Scaffolder de proyectos de cliente — Node puro, sin dependencias nuevas.
// NUNCA copia `packages/web-kit/src/` — el proyecto generado consume
// `@mgorrin/web-kit` como paquete normal de GitHub Packages, no el código
// fuente. Ver CLAUDE.md / .claude/rules/modules.md.
const fs = require("node:fs");
const path = require("node:path");
const readline = require("node:readline");

const REPO_ROOT = path.resolve(__dirname, "..");
const TEMPLATE_DIR = path.join(REPO_ROOT, "apps", "template");
const EXCLUDED_DIR_NAMES = new Set(["node_modules", ".next"]);

/** Flags por defecto — todos los módulos activables encendidos, ver `modules.config.ts`. */
const DEFAULT_MODULE_FLAGS = {
  authRbac: true,
  multiLocation: true,
  scheduling: true,
  clientPortal: true,
  adminPanel: true,
  crm: { enabled: true, externalSync: false },
  notifications: true,
  seoAnalytics: true,
  payments: true,
  ecommerce: true,
};

function parseArgs(argv) {
  const args = { dryRun: false, name: undefined, out: undefined };
  for (const arg of argv) {
    if (arg === "--dry-run") {
      args.dryRun = true;
    } else if (arg.startsWith("--name=")) {
      args.name = arg.slice("--name=".length);
    } else if (arg.startsWith("--out=")) {
      args.out = arg.slice("--out=".length);
    }
  }
  return args;
}

/** `false` para un directorio que no existe o existe vacío — solo `true` bloquea. */
function isDirNonEmpty(dir) {
  if (!fs.existsSync(dir)) return false;
  return fs.readdirSync(dir).length > 0;
}

function buildModulesConfigContent(flags) {
  return `// Generado por scripts/setup.js — ver .claude/rules/modules.md.
export interface CrmModuleConfig {
  enabled: boolean;
  externalSync: boolean;
}

export interface ModulesConfig {
  authRbac: boolean;
  multiLocation: boolean;
  scheduling: boolean;
  clientPortal: boolean;
  adminPanel: boolean;
  crm: CrmModuleConfig;
  notifications: boolean;
  seoAnalytics: boolean;
  payments: boolean;
  ecommerce: boolean;
}

export const modulesConfig: ModulesConfig = ${JSON.stringify(flags, null, 2)};
`;
}

/**
 * Copia `apps/template` al destino, excluyendo `node_modules/` y `.next/`.
 * `srcDir` es inyectable para tests (ver acceptance #3 de E3-T4).
 */
function copyTemplate(destDir, srcDir = TEMPLATE_DIR) {
  fs.cpSync(srcDir, destDir, {
    recursive: true,
    filter: (src) => !EXCLUDED_DIR_NAMES.has(path.basename(src)),
  });
}

/**
 * Único punto interactivo del script — fuera del alcance automatizable de
 * los tests (nada que dependa de un humano es un acceptance criterion, ver
 * templates/tasks-schema.md). `--dry-run` existe precisamente para saltarse
 * esto en CI/tests.
 */
function promptModuleFlags() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question("¿Activar todos los módulos por defecto? (S/n) ", (answer) => {
      rl.close();
      if (answer.trim().toLowerCase() === "n") {
        console.log(
          "Generado con todos los módulos activos por defecto de todas formas — " +
            "edita modules.config.ts en el proyecto generado para desactivar los que no necesites.",
        );
      }
      resolve(DEFAULT_MODULE_FLAGS);
    });
  });
}

async function run(argv) {
  const args = parseArgs(argv);

  if (!args.name || !args.out) {
    console.error("Uso: node scripts/setup.js --name=<cliente> --out=<directorio> [--dry-run]");
    process.exitCode = 1;
    return;
  }

  // Normaliza `--out` antes de tocar el filesystem — ver CN-019 del reporte
  // Cyber Neo. El destino puede ser cualquier directorio fuera del repo (es
  // el uso normal de este scaffolder), pero nunca uno que resuelva DENTRO
  // del propio repo: evita pisar `apps/template` o cualquier otro código
  // fuente por un `--out` mal escrito.
  const resolvedOut = path.resolve(args.out);
  if (resolvedOut === REPO_ROOT || resolvedOut.startsWith(REPO_ROOT + path.sep)) {
    console.error(
      `El directorio destino "${args.out}" resuelve dentro del propio repo (${REPO_ROOT}) — abortando.`,
    );
    process.exitCode = 1;
    return;
  }

  if (isDirNonEmpty(resolvedOut)) {
    console.error(
      `El directorio destino "${args.out}" ya existe y no está vacío — abortando sin sobrescribir nada.`,
    );
    process.exitCode = 1;
    return;
  }

  fs.mkdirSync(resolvedOut, { recursive: true });

  let flags = DEFAULT_MODULE_FLAGS;

  if (args.dryRun) {
    // Modo no interactivo para tests/CI — solo escribe la config, sin copiar
    // el árbol completo de `apps/template` (evita una copia pesada solo para
    // confirmar que el scaffolder corrió). Ver acceptance #1 de E3-T4.
  } else {
    copyTemplate(resolvedOut);
    flags = await promptModuleFlags();
  }

  const configContent = buildModulesConfigContent(flags);
  fs.writeFileSync(path.join(resolvedOut, "modules.config.ts"), configContent, "utf8");

  console.log(
    `Proyecto "${args.name}" generado en ${resolvedOut}${args.dryRun ? " (dry-run: sin copiar apps/template)" : ""}.`,
  );
}

if (require.main === module) {
  run(process.argv.slice(2)).catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
}

module.exports = {
  parseArgs,
  isDirNonEmpty,
  buildModulesConfigContent,
  copyTemplate,
  run,
  DEFAULT_MODULE_FLAGS,
  TEMPLATE_DIR,
  EXCLUDED_DIR_NAMES,
};
