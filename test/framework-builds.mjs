import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import vue from "@vitejs/plugin-vue";
import { build } from "vite";

const fixtures = [
  { name: "html", plugins: [] },
  { name: "vue", plugins: [vue({ template: { compilerOptions: { isCustomElement: (tag) => tag.startsWith("osx-") } } })] },
  { name: "react", plugins: [react()] },
  { name: "svelte", plugins: [svelte()] },
];

for (const fixture of fixtures) {
  const root = fileURLToPath(new URL(`./fixtures/${fixture.name}/`, import.meta.url));
  const result = await build({ root, configFile: false, logLevel: "silent", plugins: fixture.plugins, resolve: { preserveSymlinks: true }, build: { write: false } });
  const outputs = Array.isArray(result) ? result.flatMap((item) => item.output) : result.output;
  assert.ok(outputs.some((item) => item.type === "chunk"), `${fixture.name} produced no JavaScript bundle`);
  process.stdout.write(`✓ ${fixture.name} consumer built\n`);
}
