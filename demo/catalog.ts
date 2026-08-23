import { registerOsxComponents } from "../src/index.ts";
import "./catalog.css";

registerOsxComponents();

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

type Diff = HTMLElement & { patch: string };
type Terminal = HTMLElement & { output: string };
type Tree = HTMLElement & { statuses: string };
const diff = document.querySelector("#catalog-diff") as Diff | null;
if (diff) diff.patch = ["@@ -14,6 +14,9 @@ export function createSession() {", "-  return store.create();", "+  const session = store.create();", "+  evidence.capture(session.id);", "+  return session;"].join("\n");
const terminal = document.querySelector("#catalog-terminal") as Terminal | null;
if (terminal) terminal.output = ["✓ 26 component stories", "✓ accessibility contracts", "✓ package exports", "", "Tests: 14 passed"].join("\n");
const tree = document.querySelector("#catalog-tree") as Tree | null;
if (tree) tree.statuses = JSON.stringify({ "src/components/OsxAlert.ce.vue": "added", "src/components/OsxToast.ce.vue": "added", "src/index.ts": "modified" });

const toast = document.querySelector("#catalog-toast") as HTMLElement & { open: boolean } | null;
document.querySelector("#show-toast")?.addEventListener("click", () => { if (toast) toast.open = true; });
toast?.addEventListener("dismiss", () => { toast.open = false; });

const sheet = document.querySelector("#catalog-sheet") as HTMLElement & { open: boolean } | null;
document.querySelector("#open-catalog-sheet")?.addEventListener("click", () => { if (sheet) sheet.open = true; });
for (const event of ["close", "confirm"]) sheet?.addEventListener(event, () => { sheet.open = false; });
