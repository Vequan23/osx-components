import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const exec = promisify(execFile);
const root = new URL("../", import.meta.url);
const cli = new URL("../bin/osx-components.mjs", import.meta.url);
const audit = new URL("../skills/build-with-osx-components/scripts/audit-osx-ui.mjs", import.meta.url);

test("agent installer copies the canonical skill and generates a Cursor adapter", async () => {
  const directory = await mkdtemp(join(tmpdir(), "osx-components-agent-"));
  try {
    await exec(process.execPath, [cli.pathname, "agent", "install", "--target", "agents", "--cwd", directory]);
    const installed = join(directory, ".agents", "skills", "build-with-osx-components", "SKILL.md");
    assert.ok((await stat(installed)).isFile());
    assert.match(await readFile(installed, "utf8"), /name: build-with-osx-components/);

    await exec(process.execPath, [cli.pathname, "agent", "install", "--target", "cursor", "--cwd", directory]);
    const cursor = await readFile(join(directory, ".cursor", "rules", "osx-components.mdc"), "utf8");
    assert.match(cursor, /alwaysApply: false/);
    assert.match(cursor, /Component selection/);
    assert.doesNotMatch(cursor, /\]\(references\//);
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test("interface audit rejects inaccessible sizing and unlabeled controls", async () => {
  const directory = await mkdtemp(join(tmpdir(), "osx-components-audit-"));
  try {
    await writeFile(join(directory, "bad.vue"), '<style>.tiny { font-size: 10px }</style><osx-icon-button icon="close"></osx-icon-button><osx-text-field></osx-text-field>');
    await assert.rejects(exec(process.execPath, [audit.pathname, directory]), (error) => {
      assert.match(error.stdout, /minimum-font-size/);
      assert.match(error.stdout, /icon-button-label/);
      assert.match(error.stdout, /form-control-label/);
      return true;
    });
    await writeFile(join(directory, "bad.vue"), '<style>.copy { font-size: 12px }</style><osx-icon-button icon="close" label="Close"></osx-icon-button><osx-text-field label="Name"></osx-text-field><osx-menu-item label="Search" shortcut="⌘K"></osx-menu-item>');
    const result = await exec(process.execPath, [audit.pathname, directory]);
    assert.match(result.stdout, /0 error\(s\)/);
  } finally { await rm(directory, { recursive: true, force: true }); }
});
