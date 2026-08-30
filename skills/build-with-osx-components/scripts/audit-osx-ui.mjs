#!/usr/bin/env node
import { readFile, readdir } from "node:fs/promises";
import { extname, join, relative, resolve } from "node:path";

const args = process.argv.slice(2);
const strict = args.includes("--strict");
const json = args.includes("--json");
const target = resolve(args.find((arg) => !arg.startsWith("--")) || process.cwd());
const ignored = new Set(["__tests__", "build", "coverage", "dist", "node_modules", "site-dist", "skills", "test", "tests"]);
const extensions = new Set([".css", ".html", ".js", ".jsx", ".less", ".mjs", ".sass", ".scss", ".svelte", ".ts", ".tsx", ".vue"]);
const rawGlyphs = /[✓✔✕✖❯❮▶◀↻⚙⌘◉◆]/u;
const findings = [];

async function filesIn(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && (entry.name.startsWith(".") || ignored.has(entry.name))) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await filesIn(path));
    else if (extensions.has(extname(entry.name))) files.push(path);
  }
  return files;
}

function lineOf(source, index) {
  return source.slice(0, index).split("\n").length;
}

function add(file, source, match, severity, rule, message) {
  findings.push({ severity, rule, file: relative(target, file), line: lineOf(source, match.index), message });
}

function isKeyboardShortcutGlyph(source, index) {
  for (const match of source.matchAll(/\bshortcut\s*=\s*(["'])[\s\S]*?\1/gi)) {
    if (index >= match.index && index < match.index + match[0].length) return true;
  }
  const lineStart = source.lastIndexOf("\n", index) + 1;
  const lineEnd = source.indexOf("\n", index);
  if (/\.output\s*=/.test(source.slice(lineStart, lineEnd < 0 ? source.length : lineEnd))) return true;
  const before = source.slice(0, index);
  return before.lastIndexOf("<kbd") > before.lastIndexOf("</kbd>");
}

for (const file of await filesIn(target)) {
  const source = await readFile(file, "utf8");
  for (const match of source.matchAll(/font-size\s*:\s*(\d+(?:\.\d+)?)px/gi)) {
    if (Number(match[1]) < 12) add(file, source, match, "error", "minimum-font-size", `Font size ${match[1]}px is below the 12px minimum.`);
  }
  for (const match of source.matchAll(/font\s*:\s*[^;{}]*?(\d+(?:\.\d+)?)px(?:\s*\/[^;{}\s]+)?/gi)) {
    if (Number(match[1]) < 12) add(file, source, match, "error", "minimum-font-size", `Font shorthand uses ${match[1]}px, below the 12px minimum.`);
  }
  for (const match of source.matchAll(/<osx-icon-button\b[^>]*>/gis)) {
    if (!/(?:^|\s)(?::?label|aria-label)\s*=/.test(match[0])) add(file, source, match, "error", "icon-button-label", "osx-icon-button requires a visible or accessible label prop.");
  }
  for (const match of source.matchAll(/<osx-(?:text-field|textarea|select|radio-group)\b[^>]*>/gis)) {
    if (!/(?:^|\s):?label\s*=/.test(match[0])) add(file, source, match, "error", "form-control-label", "OSX form controls require a visible label prop.");
  }
  for (const match of source.matchAll(rawGlyphs.global ? rawGlyphs : new RegExp(rawGlyphs.source, "gu"))) {
    if (isKeyboardShortcutGlyph(source, match.index)) continue;
    add(file, source, match, "warning", "raw-interface-glyph", `Replace raw interface glyph ${JSON.stringify(match[0])} with osx-icon or a component icon prop.`);
  }
}

const errors = findings.filter((finding) => finding.severity === "error");
const warnings = findings.filter((finding) => finding.severity === "warning");
if (json) console.log(JSON.stringify({ target, errors: errors.length, warnings: warnings.length, findings }, null, 2));
else {
  for (const finding of findings) console.log(`${finding.severity.toUpperCase()} ${finding.file}:${finding.line} [${finding.rule}] ${finding.message}`);
  console.log(`osx Components audit: ${errors.length} error(s), ${warnings.length} warning(s).`);
}
process.exitCode = errors.length || (strict && warnings.length) ? 1 : 0;
