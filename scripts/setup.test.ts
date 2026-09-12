import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readdirSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  buildModulesConfigContent,
  copyTemplate,
  DEFAULT_MODULE_FLAGS,
  isDirNonEmpty,
  parseArgs,
  run,
} from "./setup.js";

let workDir: string;

beforeEach(() => {
  workDir = mkdtempSync(join(tmpdir(), "web-kit-setup-test-"));
});

afterEach(() => {
  rmSync(workDir, { recursive: true, force: true });
});

describe("parseArgs", () => {
  it("parsea --dry-run, --name= y --out=", () => {
    expect(parseArgs(["--dry-run", "--name=demo", "--out=/tmp/x"])).toEqual({
      dryRun: true,
      name: "demo",
      out: "/tmp/x",
    });
  });

  it("dryRun es false por defecto", () => {
    expect(parseArgs(["--name=demo", "--out=/tmp/x"]).dryRun).toBe(false);
  });
});

describe("isDirNonEmpty", () => {
  it("es false para un directorio que no existe", () => {
    expect(isDirNonEmpty(join(workDir, "no-existe"))).toBe(false);
  });

  it("es false para un directorio vacío", () => {
    const dir = join(workDir, "vacio");
    mkdirSync(dir);
    expect(isDirNonEmpty(dir)).toBe(false);
  });

  it("es true para un directorio con al menos un archivo", () => {
    const dir = join(workDir, "con-contenido");
    mkdirSync(dir);
    writeFileSync(join(dir, "algo.txt"), "x");
    expect(isDirNonEmpty(dir)).toBe(true);
  });
});

describe("buildModulesConfigContent", () => {
  it("genera un módulo TS con los flags dados", () => {
    const content = buildModulesConfigContent(DEFAULT_MODULE_FLAGS);
    expect(content).toContain("export const modulesConfig");
    expect(content).toContain('"ecommerce": true');
  });
});

describe("copyTemplate", () => {
  it("copia archivos y excluye node_modules/ y .next/", () => {
    const src = join(workDir, "src-fixture");
    mkdirSync(join(src, "node_modules", "algun-paquete"), { recursive: true });
    mkdirSync(join(src, ".next", "cache"), { recursive: true });
    mkdirSync(join(src, "src", "app"), { recursive: true });
    writeFileSync(join(src, "package.json"), "{}");
    writeFileSync(join(src, "node_modules", "algun-paquete", "index.js"), "// dep");
    writeFileSync(join(src, ".next", "cache", "algo"), "// build cache");
    writeFileSync(join(src, "src", "app", "page.tsx"), "// page");

    const dest = join(workDir, "dest-fixture");
    copyTemplate(dest, src);

    expect(existsSync(join(dest, "package.json"))).toBe(true);
    expect(existsSync(join(dest, "src", "app", "page.tsx"))).toBe(true);
    expect(existsSync(join(dest, "node_modules"))).toBe(false);
    expect(existsSync(join(dest, ".next"))).toBe(false);
  });
});

describe("run", () => {
  it("con --dry-run escribe modules.config.ts con los flags por defecto y no copia el template", async () => {
    const out = join(workDir, "demo-dry-run");
    await run(["--dry-run", "--name=demo", `--out=${out}`]);

    expect(existsSync(join(out, "modules.config.ts"))).toBe(true);
    // dry-run no copia apps/template — no debería haber, p. ej., package.json.
    expect(existsSync(join(out, "package.json"))).toBe(false);
  });

  it("aborta con código 1 sin escribir nada si el destino ya existe y no está vacío", async () => {
    const out = join(workDir, "ya-existe");
    mkdirSync(out);
    writeFileSync(join(out, "algo.txt"), "preexistente");

    const originalExitCode = process.exitCode;
    process.exitCode = undefined;
    await run(["--dry-run", "--name=demo", `--out=${out}`]);
    const exitCode = process.exitCode;
    process.exitCode = originalExitCode;

    expect(exitCode).toBe(1);
    expect(readdirSync(out)).toEqual(["algo.txt"]);
    expect(existsSync(join(out, "modules.config.ts"))).toBe(false);
  });
});
