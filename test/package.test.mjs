import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const componentTags = ["osx-agent-approval", "osx-agent-composer", "osx-agent-message", "osx-agent-run-status", "osx-app-shell", "osx-button", "osx-checkbox", "osx-progress", "osx-segmented-control", "osx-select", "osx-sheet", "osx-source-list", "osx-split-view", "osx-status-bar", "osx-text-field", "osx-tool-call", "osx-toolbar", "osx-window"];
const componentFiles = ["OsxAgentApproval.ce.vue", "OsxAgentComposer.ce.vue", "OsxAgentMessage.ce.vue", "OsxAgentRunStatus.ce.vue", "OsxAppShell.ce.vue", "OsxButton.ce.vue", "OsxCheckbox.ce.vue", "OsxProgress.ce.vue", "OsxSegmentedControl.ce.vue", "OsxSelect.ce.vue", "OsxSheet.ce.vue", "OsxSourceList.ce.vue", "OsxSplitView.ce.vue", "OsxStatusBar.ce.vue", "OsxTextField.ce.vue", "OsxToolCall.ce.vue", "OsxToolbar.ce.vue", "OsxWindow.ce.vue"];

test("publishes a framework-neutral custom element registry", async () => {
  const source = await read("src/index.ts");
  for (const tag of componentTags) assert.match(source, new RegExp(`"${tag}"`));
  assert.match(source, /customElements\.define/);
  assert.match(source, /customElements\.get/);
});

test("package exports point to shipped runtime, theme, and consumer types", async () => {
  const manifest = JSON.parse(await read("package.json"));
  assert.equal(manifest.exports["."].import, "./dist/osx-components.js");
  assert.equal(manifest.exports["."].types, "./types/index.d.ts");
  assert.equal(manifest.exports["./theme.css"], "./dist/osx-components.css");
  assert.ok(manifest.files.includes("types"));
});

test("ships Aqua, Graphite, and Panther token contracts", async () => {
  const theme = await read("src/theme.css");
  for (const themeName of ["aqua", "graphite", "panther"]) assert.match(theme, new RegExp(`data-osx-theme="${themeName}"`));
  for (const token of ["--osx-accent", "--osx-surface", "--osx-border", "--osx-focus"]) assert.match(theme, new RegExp(token));
});

test("component typography respects a 12px accessibility floor", async () => {
  for (const file of componentFiles) {
    const source = await read(`src/components/${file}`);
    const undersized = [...source.matchAll(/font(?:-size)?:[^;}]*?(\d+(?:\.\d+)?)px/g)].filter((match) => Number(match[1]) < 12);
    assert.deepEqual(undersized, [], `${file} declares text smaller than 12px`);
  }
});

test("showcase catalog names every published element", async () => {
  const [source, page] = await Promise.all([read("src/index.ts"), read("index.html")]);
  const tags = [...source.matchAll(/"(osx-[a-z-]+)":/g)].map((match) => match[1]);
  assert.equal(tags.length, 18);
  for (const tag of tags) assert.match(page, new RegExp(`&lt;${tag}&gt;`));
});

test("agent primitives expose bounded interactions without owning a provider", async () => {
  const [composer, approval, shell, types, page, behavior, readme] = await Promise.all([
    read("src/components/OsxAgentComposer.ce.vue"),
    read("src/components/OsxAgentApproval.ce.vue"),
    read("src/components/OsxAppShell.ce.vue"),
    read("types/index.d.ts"),
    read("index.html"),
    read("demo/main.ts"),
    read("README.md"),
  ]);
  assert.match(composer, /event\.key === "Enter" && !event\.shiftKey/);
  assert.match(composer, /submit: \[value: string\]/);
  assert.match(approval, /approve: \[\]; reject: \[\]/);
  for (const region of ["toolbar", "sidebar", "composer", "inspector", "status"]) assert.match(shell, new RegExp(`name="${region}"`));
  assert.match(shell, /aria-label="Workspace content"/);
  assert.doesNotMatch(shell, /<main>/);
  for (const name of ["OsxAgentComposerProps", "OsxAgentApprovalProps", "OsxAppShellProps", "OsxToolCallProps"]) assert.match(types, new RegExp(name));
  assert.match(page, /id="agent-shell"/);
  for (const id of ["agent-thread", "agent-composer", "agent-run", "agent-approval", "agent-status"]) {
    assert.match(page, new RegExp(`id="${id}"`));
    assert.match(behavior, new RegExp(`#${id}`));
  }
  assert.match(readme, /does not execute tools or call a model/);
});

test("playground wires visible feedback for its interactive controls", async () => {
  const [page, behavior] = await Promise.all([read("index.html"), read("demo/main.ts")]);
  for (const id of ["preference-view", "source-list", "highlight-select", "smooth-scroll", "reduce-transparency", "display-name", "show-all", "remove-preference", "save-preferences", "demo-window", "demo-status"]) {
    assert.match(page, new RegExp(`id="${id}"`), `${id} is missing from the playground`);
    assert.match(behavior, new RegExp(`#${id}`), `${id} has no behavior binding`);
  }
  assert.match(behavior, /setStatus/);
});

test("Vercel deploys the showcase instead of the package artifact", async () => {
  const [manifest, deployment] = await Promise.all([
    read("package.json").then(JSON.parse),
    read("vercel.json").then(JSON.parse),
  ]);
  assert.equal(manifest.scripts["build:site"], "vite build --config vite.site.config.ts");
  assert.equal(deployment.buildCommand, "npm run build:site");
  assert.equal(deployment.outputDirectory, "site-dist");
});

test("mobile layouts stack dense application chrome instead of compressing it", async () => {
  const [showcase, splitView, sourceList, toolbar, window, segmented] = await Promise.all([
    read("demo/showcase.css"),
    read("src/components/OsxSplitView.ce.vue"),
    read("src/components/OsxSourceList.ce.vue"),
    read("src/components/OsxToolbar.ce.vue"),
    read("src/components/OsxWindow.ce.vue"),
    read("src/components/OsxSegmentedControl.ce.vue"),
  ]);
  for (const source of [showcase, splitView, sourceList, toolbar, window, segmented]) {
    assert.match(source, /@media \(max-width: 620px\)/);
  }
  assert.match(splitView, /grid-template-rows: auto 1px minmax\(0,1fr\)/);
  assert.match(sourceList, /grid-template-columns: repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(toolbar, /grid-column: 1 \/ -1/);
  assert.match(showcase, /#save-preferences/);
});
