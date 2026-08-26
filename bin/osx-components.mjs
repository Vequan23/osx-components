#!/usr/bin/env node
import { existsSync } from "node:fs";
import { cp, mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const skillName = "build-with-osx-components";
const skillSource = join(packageRoot, "skills", skillName);

function help() {
  console.log(`OSX Components agent installer

Usage:
  osx-components agent install [options]

Options:
  --target <agents|codex|claude|opencode|cursor|auto|all>
  --scope <project|user>       Default: project
  --cwd <path>                 Default: current directory
  --force                      Replace an existing installed copy
  --dry-run                    Print destinations without writing
  --help                       Show this help

Examples:
  npx osx-components agent install
  npx osx-components agent install --target claude --scope user
  npx osx-components agent install --target all --force
`);
}

async function exists(path) {
  try { await stat(path); return true; }
  catch { return false; }
}

function option(args, name, fallback) {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : fallback;
}

function targetsFor(requested, cwd) {
  const supported = ["agents", "codex", "claude", "opencode", "cursor"];
  if (requested === "all") return supported;
  if (requested !== "auto") return [requested];
  const detected = supported.filter((target) => target !== "agents" && existsSync(join(cwd, `.${target}`)));
  return detected.length ? detected : ["agents"];
}

function destinationFor(target, scope, cwd) {
  const project = {
    agents: join(cwd, ".agents", "skills", skillName),
    codex: join(cwd, ".codex", "skills", skillName),
    claude: join(cwd, ".claude", "skills", skillName),
    opencode: join(cwd, ".opencode", "skills", skillName),
    cursor: join(cwd, ".cursor", "rules", "osx-components.mdc"),
  };
  const user = {
    agents: join(homedir(), ".agents", "skills", skillName),
    codex: join(homedir(), ".codex", "skills", skillName),
    claude: join(homedir(), ".claude", "skills", skillName),
    opencode: join(homedir(), ".config", "opencode", "skills", skillName),
  };
  if (scope === "user" && target === "cursor") throw new Error("Cursor file-based rules are project scoped. Use --scope project.");
  return (scope === "user" ? user : project)[target];
}

async function cursorRule() {
  const skill = await readFile(join(skillSource, "SKILL.md"), "utf8");
  const body = skill.replace(/^---[\s\S]*?---\s*/, "").replaceAll(/\[([^\]]+)\]\(references\/[^)]+\)/g, "$1 (bundled below)");
  const references = ["component-selection.md", "framework-usage.md", "composition-patterns.md", "quality-standard.md"];
  const bundled = await Promise.all(references.map(async (name) => `\n\n---\n\n${await readFile(join(skillSource, "references", name), "utf8")}`));
  return `---\ndescription: Build and review interfaces with the osx-components design system\nglobs:\nalwaysApply: false\n---\n\n<!-- Generated from the osx-components ${skillName} skill. -->\n\n${body.trim()}${bundled.join("")}\n`;
}

async function install(target, scope, cwd, force, dryRun) {
  const destination = destinationFor(target, scope, cwd);
  if (dryRun) return { target, destination, state: "planned" };
  if (await exists(destination)) {
    if (!force) throw new Error(`${destination} already exists. Re-run with --force to update it.`);
    await rm(destination, { recursive: true, force: true });
  }
  await mkdir(dirname(destination), { recursive: true });
  if (target === "cursor") await writeFile(destination, await cursorRule(), "utf8");
  else await cp(skillSource, destination, { recursive: true });
  return { target, destination, state: "installed" };
}

const args = process.argv.slice(2);
if (args.includes("--help") || args.length === 0) { help(); process.exit(0); }
if (args[0] !== "agent" || args[1] !== "install") { help(); process.exitCode = 1; }
else {
  const target = option(args, "--target", "agents");
  const scope = option(args, "--scope", "project");
  const cwd = resolve(option(args, "--cwd", process.cwd()));
  const supported = new Set(["agents", "codex", "claude", "opencode", "cursor", "auto", "all"]);
  if (!supported.has(target)) throw new Error(`Unsupported target: ${target}`);
  if (!new Set(["project", "user"]).has(scope)) throw new Error(`Unsupported scope: ${scope}`);
  const results = [];
  for (const item of targetsFor(target, cwd)) results.push(await install(item, scope, cwd, args.includes("--force"), args.includes("--dry-run")));
  for (const result of results) console.log(`${result.state === "planned" ? "Would install" : "Installed"} ${result.target}: ${result.destination}`);
}
