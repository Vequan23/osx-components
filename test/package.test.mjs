import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const componentTags = ["osx-agent-approval", "osx-agent-composer", "osx-agent-message", "osx-agent-run-status", "osx-alert", "osx-app-shell", "osx-artifact", "osx-avatar", "osx-badge", "osx-button", "osx-checkbox", "osx-citation", "osx-copy", "osx-data-table", "osx-dialog", "osx-diff-viewer", "osx-ecosystem-card", "osx-empty-state", "osx-file-tree", "osx-heading", "osx-icon", "osx-icon-button", "osx-link", "osx-markdown", "osx-menu", "osx-menu-item", "osx-plan", "osx-popover", "osx-progress", "osx-radio-group", "osx-segmented-control", "osx-select", "osx-sheet", "osx-shimmer", "osx-skeleton", "osx-source-list", "osx-source-panel", "osx-spinner", "osx-split-view", "osx-status-bar", "osx-table", "osx-tabs", "osx-terminal", "osx-textarea", "osx-text-field", "osx-thinking", "osx-toast", "osx-toggle", "osx-tool-call", "osx-toolbar", "osx-tooltip", "osx-window"];
const componentFiles = ["OsxAgentApproval.ce.vue", "OsxAgentComposer.ce.vue", "OsxAgentMessage.ce.vue", "OsxAgentRunStatus.ce.vue", "OsxAlert.ce.vue", "OsxAppShell.ce.vue", "OsxArtifact.ce.vue", "OsxAvatar.ce.vue", "OsxBadge.ce.vue", "OsxButton.ce.vue", "OsxCheckbox.ce.vue", "OsxCitation.ce.vue", "OsxCopy.ce.vue", "OsxDataTable.ce.vue", "OsxDialog.ce.vue", "OsxDiffViewer.ce.vue", "OsxEcosystemCard.ce.vue", "OsxEmptyState.ce.vue", "OsxFileTree.ce.vue", "OsxHeading.ce.vue", "OsxIcon.ce.vue", "OsxIconButton.ce.vue", "OsxLink.ce.vue", "OsxMarkdown.ce.vue", "OsxMenu.ce.vue", "OsxMenuItem.ce.vue", "OsxPlan.ce.vue", "OsxPopover.ce.vue", "OsxProgress.ce.vue", "OsxRadioGroup.ce.vue", "OsxSegmentedControl.ce.vue", "OsxSelect.ce.vue", "OsxSheet.ce.vue", "OsxShimmer.ce.vue", "OsxSkeleton.ce.vue", "OsxSourceList.ce.vue", "OsxSourcePanel.ce.vue", "OsxSpinner.ce.vue", "OsxSplitView.ce.vue", "OsxStatusBar.ce.vue", "OsxTable.ce.vue", "OsxTabs.ce.vue", "OsxTerminal.ce.vue", "OsxTextArea.ce.vue", "OsxTextField.ce.vue", "OsxThinking.ce.vue", "OsxToast.ce.vue", "OsxToggle.ce.vue", "OsxToolCall.ce.vue", "OsxToolbar.ce.vue", "OsxTooltip.ce.vue", "OsxWindow.ce.vue"];

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
  assert.equal(manifest.exports["./skill"], "./skills/build-with-osx-components/SKILL.md");
  assert.ok(manifest.files.includes("types"));
  assert.ok(manifest.files.includes("skills"));
  assert.equal(manifest.bin["osx-components"], "bin/osx-components.mjs");
});

test("ships one canonical, progressively disclosed agent skill", async () => {
  const [skill, metadata, selection, frameworks, composition, quality, audit] = await Promise.all([
    read("skills/build-with-osx-components/SKILL.md"),
    read("skills/build-with-osx-components/agents/openai.yaml"),
    read("skills/build-with-osx-components/references/component-selection.md"),
    read("skills/build-with-osx-components/references/framework-usage.md"),
    read("skills/build-with-osx-components/references/composition-patterns.md"),
    read("skills/build-with-osx-components/references/quality-standard.md"),
    read("skills/build-with-osx-components/scripts/audit-osx-ui.mjs"),
  ]);
  assert.match(skill, /^---\nname: build-with-osx-components\ndescription: .+\n---/);
  for (const reference of ["component-selection.md", "framework-usage.md", "composition-patterns.md", "quality-standard.md"]) assert.match(skill, new RegExp(reference.replace(".", "\\.")));
  assert.match(metadata, /\$build-with-osx-components/);
  for (const source of [selection, frameworks, composition, quality]) assert.ok(source.length > 300);
  assert.match(audit, /minimum-font-size/);
  assert.match(audit, /icon-button-label/);
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

test("component explorer renders every published element", async () => {
  const [source, page, behavior, config] = await Promise.all([read("src/index.ts"), read("components.html"), read("demo/catalog.ts"), read("vite.site.config.ts")]);
  const tags = [...new Set([...source.matchAll(/"(osx-[a-z-]+)":/g)].map((match) => match[1]))];
  assert.equal(tags.length, componentTags.length);
  for (const tag of tags) {
    assert.match(page, new RegExp(`id="story-${tag}"`));
    assert.match(page, new RegExp(`<${tag}(?:[ >])`));
  }
  assert.match(page, /id="story-search"/);
  assert.match(behavior, /search\?\.addEventListener\("input"/);
  assert.match(config, /components: resolve\(root, "components\.html"\)/);
});

test("typed documentation covers every component and every framework", async () => {
  const [docs, behavior, page] = await Promise.all([read("demo/component-docs.ts"), read("demo/catalog.ts"), read("components.html")]);
  for (const tag of componentTags) assert.match(docs, new RegExp(`"${tag}"`), `${tag} has no documentation metadata`);
  for (const framework of ["HTML", "Vue", "React", "Svelte"]) assert.match(docs, new RegExp(`framework === "${framework}"|framework: "HTML" \\| "Vue" \\| "React" \\| "Svelte"`));
  for (const contract of ["Props", "Events", "Slots", "CSS tokens", "States", "Accessibility"]) assert.match(behavior, new RegExp(contract));
  assert.match(page, /id="docs-framework"/);
  assert.match(behavior, /data-copy-code/);
  assert.match(behavior, /data-copy-link/);
});

test("typography primitives preserve document semantics and readable defaults", async () => {
  const [heading, copy, link, types] = await Promise.all([
    read("src/components/OsxHeading.ce.vue"), read("src/components/OsxCopy.ce.vue"), read("src/components/OsxLink.ce.vue"), read("types/index.d.ts"),
  ]);
  assert.match(heading, /`h\$\{/);
  assert.match(heading, /display.*title.*section.*label/s);
  assert.match(copy, /max-width: 65ch/);
  assert.match(copy, /size-small \{ font-size: 12px/);
  assert.match(link, /<a /);
  assert.match(link, /noreferrer noopener/);
  assert.match(link, /aria-disabled/);
  for (const name of ["OsxHeadingProps", "OsxCopyProps", "OsxLinkProps"]) assert.match(types, new RegExp(name));
});

test("ecosystem discovery is explicit, accessible, and inert until the host measures it", async () => {
  const [component, types, docs, readme] = await Promise.all([
    read("src/components/OsxEcosystemCard.ce.vue"), read("types/index.d.ts"), read("demo/component-docs.ts"), read("README.md"),
  ]);
  assert.match(component, /<article/);
  assert.match(component, /<a/);
  assert.match(component, /noreferrer noopener/);
  assert.match(component, /activate: \[detail: \{ name: string; href: string; trackingId: string \}\]/);
  for (const networkPrimitive of [/\bfetch\s*\(/, /XMLHttpRequest/, /sendBeacon/, /localStorage/, /sessionStorage/]) assert.doesNotMatch(component, networkPrimitive);
  assert.match(types, /OsxEcosystemCardProps/);
  assert.match(docs, /No analytics or network requests are made by the component/);
  assert.match(readme, /never sends analytics or makes network requests itself/);
});

test("feedback, loading, and Lucide icon primitives expose accessible contracts", async () => {
  const [alert, toast, shimmer, skeleton, icon, iconButton, glyph, registry, types, readme] = await Promise.all([
    read("src/components/OsxAlert.ce.vue"), read("src/components/OsxToast.ce.vue"), read("src/components/OsxShimmer.ce.vue"), read("src/components/OsxSkeleton.ce.vue"), read("src/components/OsxIcon.ce.vue"), read("src/components/OsxIconButton.ce.vue"), read("src/components/IconGlyph.vue"), read("src/icons.ts"), read("types/index.d.ts"), read("README.md"),
  ]);
  assert.match(alert, /dismiss: \[\]/);
  assert.match(alert, /"alert" : "status"/);
  assert.match(toast, /dismiss: \[reason: "manual" \| "timeout"\]/);
  assert.match(toast, /aria-live/);
  for (const loading of [shimmer, skeleton]) { assert.match(loading, /aria-busy="true"/); assert.match(loading, /prefers-reduced-motion: reduce/); }
  assert.match(icon, /IconGlyph/);
  assert.match(glyph, /aria-hidden/);
  assert.match(glyph, /absolute-stroke-width/);
  assert.match(registry, /from "@lucide\/vue"/);
  assert.match(registry, /iconRegistry/);
  assert.match(iconButton, /<button/);
  assert.match(iconButton, /:aria-label="label"/);
  for (const name of ["OsxAlertProps", "OsxToastProps", "OsxShimmerProps", "OsxSkeletonProps", "OsxIconProps", "OsxIconButtonProps"]) assert.match(types, new RegExp(name));
  assert.match(readme, /shared icon contract/);
});

test("table, spinner, toggle, buttons, and form controls expose native accessible contracts", async () => {
  const [table, spinner, toggle, button, textField, textArea, select, radioGroup, types] = await Promise.all([
    read("src/components/OsxTable.ce.vue"), read("src/components/OsxSpinner.ce.vue"), read("src/components/OsxToggle.ce.vue"), read("src/components/OsxButton.ce.vue"), read("src/components/OsxTextField.ce.vue"), read("src/components/OsxTextArea.ce.vue"), read("src/components/OsxSelect.ce.vue"), read("src/components/OsxRadioGroup.ce.vue"), read("types/index.d.ts"),
  ]);
  for (const semantic of ["<table>", "<caption", "scope=\"col\"", "aria-sort", "tabindex=\"0\""]) assert.match(table, new RegExp(semantic));
  assert.match(table, /sort: \[key: string, direction:/);
  assert.match(spinner, /role="status"/);
  assert.match(spinner, /prefers-reduced-motion: reduce/);
  assert.match(toggle, /role="switch"/);
  assert.match(toggle, /emitElementEvent\(host, "change", \[current\.value\]\)/);
  assert.match(toggle, /aria-describedby/);
  assert.match(button, /IconGlyph/);
  assert.match(button, /iconPosition/);
  assert.match(textField, /displayedIcon/);
  assert.match(textField, /iconPosition/);
  for (const control of [textField, textArea, select, radioGroup]) { assert.match(control, /aria-invalid/); assert.match(control, /aria-describedby/); assert.match(control, /required/); }
  assert.match(textArea, /<textarea/);
  assert.match(radioGroup, /<fieldset/);
  assert.match(radioGroup, /type="radio"/);
  assert.match(select, /Array\.isArray\(props\.options\)/);
  for (const name of ["OsxTableProps", "OsxSpinnerProps", "OsxToggleProps", "OsxTextAreaProps", "OsxRadioGroupProps", "OsxSelectOption", "icon?: OsxIconName", "iconPosition?: \"leading\" | \"trailing\""]) assert.match(types, new RegExp(name.replace("?", "\\?")));
});

test("form controls expose a consistent form, state, and event boundary", async () => {
  const [registry, association, events, checkbox, segmented, types, readme] = await Promise.all([
    read("src/index.ts"),
    read("src/form-associated-element.ts"),
    read("src/element-events.ts"),
    read("src/components/OsxCheckbox.ce.vue"),
    read("src/components/OsxSegmentedControl.ce.vue"),
    read("types/index.d.ts"),
    read("README.md"),
  ]);
  for (const tag of ["osx-checkbox", "osx-radio-group", "osx-select", "osx-textarea", "osx-text-field", "osx-toggle"]) {
    assert.match(registry, new RegExp(`"${tag}"`));
  }
  for (const contract of ["static formAssociated = true", "attachInternals", "setFormValue", "setValidity", "formResetCallback", "formStateRestoreCallback", "setCustomValidity"]) {
    assert.match(association, new RegExp(contract));
  }
  assert.match(events, /bubbles: true/);
  assert.match(events, /composed: true/);
  assert.match(checkbox, /updateElementState\(host, "indeterminate", false\)/);
  for (const key of ["ArrowLeft", "ArrowRight", "Home", "End"]) assert.match(segmented, new RegExp(key));
  assert.match(segmented, /tabindex="tabIndex/);
  assert.match(types, /OsxFormAssociatedElement/);
  assert.match(types, /type\?: "button" \| "submit" \| "reset"/);
  assert.match(readme, /form-associated custom elements/);
});

test("data table exposes search, selection, pagination, loading, and server-control contracts", async () => {
  const [table, types, docs, page, behavior] = await Promise.all([
    read("src/components/OsxDataTable.ce.vue"), read("types/index.d.ts"), read("demo/component-docs.ts"), read("components.html"), read("demo/catalog.ts"),
  ]);
  for (const semantic of ["<table>", "<caption", "scope=\"col\"", "aria-sort", "aria-busy", "type=\"search\"", "aria-label=\"Table pagination\""]) assert.match(table, new RegExp(semantic));
  for (const event of ["search", "sort", "page-change", "page-size-change", "selection-change", "row-activate"]) assert.match(table, new RegExp(`\"${event}\"`));
  assert.match(table, /serverMode/);
  assert.match(table, /selectedKeys/);
  assert.match(table, /noResultsMessage/);
  assert.match(types, /OsxDataTableProps/);
  assert.match(docs, /"osx-data-table"/);
  assert.match(page, /id="catalog-data-table"/);
  assert.match(behavior, /#catalog-data-table/);
});

test("signature developer components expose inspectable repository evidence", async () => {
  const [diff, terminal, tree, types, page, behavior] = await Promise.all([
    read("src/components/OsxDiffViewer.ce.vue"),
    read("src/components/OsxTerminal.ce.vue"),
    read("src/components/OsxFileTree.ce.vue"),
    read("types/index.d.ts"),
    read("index.html"),
    read("demo/main.ts"),
  ]);
  assert.match(diff, /"unified" \| "split"/);
  assert.match(diff, /"view-change": \[view:/);
  assert.match(terminal, /rerun: \[command: string\]; interrupt: \[\]; clear: \[\]/);
  assert.match(terminal, /role="log"/);
  assert.match(tree, /role="tree"/);
  assert.match(tree, /select: \[path: string\]; toggle: \[path: string, open: boolean\]/);
  for (const name of ["OsxDiffViewerProps", "OsxTerminalProps", "OsxFileTreeProps"]) assert.match(types, new RegExp(name));
  for (const id of ["agent-diff", "agent-terminal", "agent-file-tree"]) {
    assert.match(page, new RegExp(`id="${id}"`));
    assert.match(behavior, new RegExp(`#${id}`));
  }
});

test("agent output primitives stay streaming-safe, grounded, and backend-neutral", async () => {
  const [thinking, plan, artifact, citation, sources, markdown, types, page, behavior] = await Promise.all([
    read("src/components/OsxThinking.ce.vue"),
    read("src/components/OsxPlan.ce.vue"),
    read("src/components/OsxArtifact.ce.vue"),
    read("src/components/OsxCitation.ce.vue"),
    read("src/components/OsxSourcePanel.ce.vue"),
    read("src/components/OsxMarkdown.ce.vue"),
    read("types/index.d.ts"),
    read("components.html"),
    read("demo/catalog.ts"),
  ]);
  assert.match(thinking, /<details/);
  assert.match(thinking, /aria-busy/);
  for (const state of ["pending", "active", "done", "failed", "skipped"]) assert.match(plan, new RegExp(state));
  assert.match(plan, /aria-current/);
  assert.match(artifact, /copy: \[content: string\]; download: \[filename: string\]; open: \[href: string\]/);
  assert.match(citation, /activate: \[sourceId: string\]/);
  assert.match(sources, /select: \[sourceId: string\]/);
  for (const semantic of ["<table>", "<code>", "block.ordered ? 'ol' : 'ul'"]) assert.ok(markdown.includes(semantic));
  assert.match(markdown, /safeHref/);
  assert.doesNotMatch(markdown, /v-html/);
  assert.match(markdown, /block\.incomplete && streaming/);
  for (const name of ["OsxThinkingProps", "OsxPlanProps", "OsxArtifactProps", "OsxCitationProps", "OsxSourcePanelProps", "OsxMarkdownProps"]) assert.match(types, new RegExp(name));
  for (const id of ["catalog-plan", "catalog-artifact", "catalog-markdown", "catalog-source-panel"]) {
    assert.match(page, new RegExp(`id="${id}"`));
    assert.match(behavior, new RegExp(`#${id}`));
  }
});

test("snippet lab creates framework-specific shareable adoption paths", async () => {
  const [page, behavior] = await Promise.all([read("index.html"), read("demo/main.ts")]);
  for (const framework of ["HTML", "Vue", "React", "Svelte"]) assert.match(behavior, new RegExp(`${framework}: \\{`));
  for (const id of ["snippet-framework", "snippet-output", "snippet-file", "snippet-status", "copy-snippet", "share-snippet"]) {
    assert.match(page, new RegExp(`id="${id}"`));
    assert.match(behavior, new RegExp(`#${id}`));
  }
  assert.match(behavior, /url\.searchParams\.set\("framework"/);
  assert.match(behavior, /navigator\.clipboard/);
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
  assert.match(composer, /emitElementEvent\(host, "submit", \[prompt\]\)/);
  assert.match(approval, /approve: \[\]; reject: \[\]/);
  for (const region of ["toolbar", "sidebar", "composer", "inspector", "status"]) assert.match(shell, new RegExp(`name="${region}"`));
  assert.match(shell, /aria-label="Workspace content"/);
  assert.match(shell, /role="separator"/);
  assert.match(shell, /"panel-resize": \[panel: Panel, width: number\]/);
  assert.match(shell, /ArrowLeft/);
  assert.match(shell, /setPointerCapture/);
  assert.doesNotMatch(shell, /<main>/);
  assert.match(shell, /\.shell \{ height: 100%; min-height: 520px/);
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
