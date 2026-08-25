import { registerOsxComponents } from "../src/index.ts";
import { iconNames } from "../src/icons.ts";
import { componentDocs, frameworkExample } from "./component-docs.ts";
import "./catalog.css";

registerOsxComponents();

const storyNav = document.querySelector("#story-nav");
if (storyNav) [...storyNav.querySelectorAll("a")].sort((a,b) => (a.textContent || "").localeCompare(b.textContent || "")).forEach((link) => storyNav.append(link));

function detailValue(event: Event): string { return String((event as CustomEvent).detail?.[0] ?? ""); }
const root = document.documentElement;
const theme = document.querySelector("#catalog-theme") as HTMLElement & { value: string } | null;
theme?.addEventListener("change", (event) => { const value = detailValue(event) || "Aqua"; theme.value = value; root.dataset.osxTheme = value.toLowerCase(); });

const search = document.querySelector("#story-search") as HTMLInputElement | null;
const stories = [...document.querySelectorAll<HTMLElement>(".story")];
const groups = [...document.querySelectorAll<HTMLElement>(".story-group")];
const empty = document.querySelector<HTMLElement>("#empty-state");
search?.addEventListener("input", () => {
  const query = search.value.trim().toLowerCase();
  let visible = 0;
  for (const story of stories) { const match = !query || `${story.dataset.name} ${story.textContent}`.toLowerCase().includes(query); story.hidden = !match; if (match) visible += 1; }
  for (const group of groups) group.hidden = ![...group.querySelectorAll<HTMLElement>(".story")].some((story) => !story.hidden);
  if (empty) empty.hidden = visible > 0;
});

type Framework = "HTML" | "Vue" | "React" | "Svelte";
let docsFramework: Framework = "HTML";
const docsPicker = document.querySelector("#docs-framework") as HTMLElement & { value: string } | null;
const escapeHtml = (value: string) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const renderList = (values: string[] | undefined, empty = "None") => values?.length ? `<ul>${values.map((value) => `<li>${escapeHtml(value)}</li>`).join("")}</ul>` : `<p>${empty}</p>`;
function renderDocs() {
  for (const story of stories) {
    const tag = story.id.replace("story-", "");
    const metadata = componentDocs[tag];
    if (!metadata) continue;
    let panel = story.querySelector<HTMLElement>(".story-docs");
    if (!panel) { panel = document.createElement("details"); panel.className = "story-docs"; story.append(panel); }
    const access = [...metadata.accessibility, ...(metadata.keyboard ?? []).map((item) => `Keyboard: ${item}`)];
    panel.innerHTML = `<summary>API, accessibility & usage <span>${metadata.props.length} props</span></summary><div class="docs-body"><p class="docs-description">${escapeHtml(metadata.description)}</p><div class="api-grid"><section><h4>Props</h4>${renderList(metadata.props)}</section><section><h4>Events</h4>${renderList(metadata.events)}</section><section><h4>Slots</h4>${renderList(metadata.slots)}</section><section><h4>CSS tokens</h4>${renderList(metadata.tokens)}</section><section><h4>States</h4>${renderList(metadata.states)}</section><section><h4>Accessibility</h4>${renderList(access)}</section></div><div class="example-head"><strong>${docsFramework} example</strong><div><button type="button" data-copy-code="${tag}">Copy code</button><button type="button" data-copy-link="${tag}">Copy link</button></div></div><pre class="docs-code"><code>${escapeHtml(frameworkExample(tag, docsFramework))}</code></pre><p class="copy-status" role="status" aria-live="polite"></p></div>`;
  }
}
renderDocs();
docsPicker?.addEventListener("change", (event) => {
  const value = detailValue(event);
  if (["HTML", "Vue", "React", "Svelte"].includes(value)) { docsFramework = value as Framework; docsPicker.value = value; renderDocs(); }
});
document.addEventListener("click", async (event) => {
  const target = event.target as HTMLElement;
  const codeTag = target.dataset.copyCode;
  const linkTag = target.dataset.copyLink;
  if (!codeTag && !linkTag) return;
  const value = codeTag ? frameworkExample(codeTag, docsFramework) : `${location.origin}${location.pathname}#story-${linkTag}`;
  await navigator.clipboard.writeText(value);
  const status = target.closest(".docs-body")?.querySelector<HTMLElement>(".copy-status");
  if (status) status.textContent = codeTag ? `${docsFramework} example copied` : "Story link copied";
});

type Diff = HTMLElement & { patch: string };
type Terminal = HTMLElement & { output: string };
type Tree = HTMLElement & { statuses: string };
type Plan = HTMLElement & { steps: Array<{ title: string; detail?: string; state: "pending" | "active" | "done" | "failed" | "skipped" }> };
type Markdown = HTMLElement & { content: string; streaming: boolean };
type Artifact = HTMLElement & { content: string };
type SourcePanel = HTMLElement & { sources: Array<{ id: string; title: string; url?: string; snippet?: string }>; selected: string };
type Table = HTMLElement & { columns: Array<{ key: string; label: string; align?: "left" | "center" | "right"; sortable?: boolean }>; rows: Array<Record<string, string | number>> };
const diff = document.querySelector("#catalog-diff") as Diff | null;
if (diff) diff.patch = ["@@ -14,6 +14,9 @@ export function createSession() {", "-  return store.create();", "+  const session = store.create();", "+  evidence.capture(session.id);", "+  return session;"].join("\n");
const terminal = document.querySelector("#catalog-terminal") as Terminal | null;
if (terminal) terminal.output = ["✓ 48 component stories", "✓ accessibility contracts", "✓ package exports", "", "Tests: 15 passed"].join("\n");
const tree = document.querySelector("#catalog-tree") as Tree | null;
if (tree) tree.statuses = JSON.stringify({ "src/components/OsxAlert.ce.vue": "added", "src/components/OsxToast.ce.vue": "added", "src/index.ts": "modified" });
const plan = document.querySelector("#catalog-plan") as Plan | null;
if (plan) plan.steps = [
  { title: "Inspect the failing test", detail: "Located the stale token assertion", state: "done" },
  { title: "Trace token rotation", detail: "Following service and repository writes", state: "active" },
  { title: "Implement the fix", state: "pending" },
  { title: "Run focused verification", state: "pending" },
];
const markdown = document.querySelector("#catalog-markdown") as Markdown | null;
if (markdown) markdown.content = [
  "## Verification result",
  "",
  "The focused test now **passes** and the token rotation remains atomic.",
  "",
  "- Preserved the previous-token audit record",
  "- Added a regression assertion",
  "- Kept the public API unchanged",
  "",
  "```typescript",
  "const result = await rotateToken(currentToken);",
  "expect(result.previous.revoked).toBe(true);",
  "```",
  "",
  "| Check | Result |",
  "| --- | --- |",
  "| Focused test | Passed |",
  "| Full suite | Running |",
].join("\n");
const artifact = document.querySelector("#catalog-artifact") as Artifact | null;
if (artifact) artifact.content = ["# Refresh-token migration", "", "1. Apply the verified service patch.", "2. Run the focused test.", "3. Promote after review."].join("\n");
const sourcePanel = document.querySelector("#catalog-source-panel") as SourcePanel | null;
if (sourcePanel) sourcePanel.sources = [
  { id: "node-release", title: "Node.js release schedule", url: "https://github.com/nodejs/Release", snippet: "Official lifecycle dates for supported Node.js release lines." },
  { id: "security-guide", title: "OWASP secure coding guidance", url: "https://owasp.org", snippet: "Primary security guidance used to frame the recommendation." },
  { id: "project-tests", title: "Project verification output", snippet: "The focused test passed in the isolated workspace." },
];
for (const citation of document.querySelectorAll<HTMLElement & { selected: boolean }>("#story-osx-citation osx-citation")) {
  citation.addEventListener("activate", (event) => {
    const id = detailValue(event); if (sourcePanel) sourcePanel.selected = id;
    for (const item of document.querySelectorAll<HTMLElement & { sourceId: string; selected: boolean }>("#story-osx-citation osx-citation")) item.selected = item.sourceId === id;
  });
}
sourcePanel?.addEventListener("select", (event) => { sourcePanel.selected = detailValue(event); });
const table = document.querySelector("#catalog-table") as Table | null;
if (table) {
  table.columns = [{ key: "task", label: "Task", sortable: true }, { key: "status", label: "Status", sortable: true }, { key: "duration", label: "Duration", align: "right", sortable: true }];
  table.rows = [{ task: "Verify refresh tokens", status: "Passed", duration: "7.4s" }, { task: "Audit source handling", status: "Passed", duration: "3.1s" }, { task: "Build component package", status: "Running", duration: "12.8s" }];
}

const iconGrid = document.querySelector("#catalog-icon-grid");
for (const name of iconNames) {
  const tile = document.createElement("div");
  const glyph = document.createElement("osx-icon");
  glyph.setAttribute("name",name);
  glyph.setAttribute("label",name);
  const caption = document.createElement("code");
  caption.textContent = name;
  tile.append(glyph,caption);
  iconGrid?.append(tile);
}

const toast = document.querySelector("#catalog-toast") as HTMLElement & { open: boolean } | null;
document.querySelector("#show-toast")?.addEventListener("click", () => { if (toast) toast.open = true; });
toast?.addEventListener("dismiss", () => { toast.open = false; });

const sheet = document.querySelector("#catalog-sheet") as HTMLElement & { open: boolean } | null;
document.querySelector("#open-catalog-sheet")?.addEventListener("click", () => { if (sheet) sheet.open = true; });
for (const event of ["close", "confirm"]) sheet?.addEventListener(event, () => { sheet.open = false; });

const dialog = document.querySelector("#catalog-dialog") as HTMLElement & { open: boolean } | null;
document.querySelector("#open-catalog-dialog")?.addEventListener("click", () => { if (dialog) dialog.open = true; });
for (const event of ["close", "confirm"]) dialog?.addEventListener(event, () => { dialog.open = false; });
