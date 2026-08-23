import { registerOsxComponents } from "../src/index.ts";
import "./showcase.css";

registerOsxComponents();

const root = document.documentElement;
type StatusElement = HTMLElement & { label: string; status: "ready" | "working" | "offline"; detail: string };
const picker = document.querySelector("#theme-picker") as HTMLElement & { value: string } | null;
const statusBar = document.querySelector("#demo-status") as StatusElement | null;
function eventValue(event: Event): string { return String((event as CustomEvent).detail?.[0] ?? ""); }
function setStatus(label: string, status: StatusElement["status"] = "ready", detail = "Just now") {
  if (!statusBar) return;
  statusBar.label = label;
  statusBar.status = status;
  statusBar.detail = detail;
}
picker?.addEventListener("change", (event) => {
  const selected = eventValue(event) || "Aqua";
  picker.value = selected;
  const value = selected.toLowerCase();
  root.dataset.osxTheme = value;
  setStatus(`${selected} theme applied`);
});

document.querySelector("#explore")?.addEventListener("click", () => {
  document.querySelector("#components")?.scrollIntoView({ behavior: "smooth" });
});

const sheet = document.querySelector("#demo-sheet") as HTMLElement & { open: boolean } | null;
document.querySelector("#open-sheet")?.addEventListener("click", () => { if (sheet) sheet.open = true; });
sheet?.addEventListener("close", () => { sheet.open = false; setStatus("Sheet dismissed"); });
sheet?.addEventListener("confirm", () => { sheet.open = false; setStatus("Appearance confirmed"); });

document.querySelector("#preference-view")?.addEventListener("change", (event) => setStatus(`${eventValue(event)} preferences selected`));
document.querySelector("#source-list")?.addEventListener("change", (event) => setStatus(`${eventValue(event)} opened`));
document.querySelector("#highlight-select")?.addEventListener("change", (event) => {
  const selected = eventValue(event);
  if (selected) root.dataset.osxTheme = selected.toLowerCase();
  setStatus(`${selected} highlight selected`);
});
document.querySelector("#smooth-scroll")?.addEventListener("change", (event) => setStatus(`Smooth scrolling ${eventValue(event) === "true" ? "enabled" : "disabled"}`));
document.querySelector("#reduce-transparency")?.addEventListener("change", (event) => setStatus(`Reduced transparency ${eventValue(event) === "true" ? "enabled" : "disabled"}`));
document.querySelector("#display-name")?.addEventListener("change", (event) => setStatus(`Display name updated to ${eventValue(event)}`));
document.querySelector("#show-all")?.addEventListener("click", () => setStatus("All preference categories shown"));
document.querySelector("#remove-preference")?.addEventListener("click", () => { if (sheet) sheet.open = true; setStatus("Confirmation required", "working"); });
document.querySelector("#save-preferences")?.addEventListener("click", () => setStatus("Preferences saved"));

const demoWindow = document.querySelector("#demo-window");
demoWindow?.addEventListener("close", () => setStatus("Close requested", "working"));
demoWindow?.addEventListener("minimize", () => setStatus("Minimize requested", "working"));
demoWindow?.addEventListener("zoom", () => setStatus("Zoom requested", "working"));

type AgentComposerElement = HTMLElement & { value: string; busy: boolean };
type AgentRunElement = HTMLElement & { phase: "planning" | "working" | "verifying" | "complete" | "error"; detail: string };
const agentComposer = document.querySelector("#agent-composer") as AgentComposerElement | null;
const agentRun = document.querySelector("#agent-run") as AgentRunElement | null;
const agentStatus = document.querySelector("#agent-status") as StatusElement | null;
const agentThread = document.querySelector("#agent-thread");
function setAgentStatus(label: string, status: StatusElement["status"], detail: string) {
  if (!agentStatus) return;
  agentStatus.label = label;
  agentStatus.status = status;
  agentStatus.detail = detail;
}
agentComposer?.addEventListener("submit", (event) => {
  const prompt = eventValue(event);
  if (!prompt || !agentThread) return;
  const message = document.createElement("osx-agent-message");
  message.setAttribute("role", "user");
  message.setAttribute("author", "You");
  message.setAttribute("timestamp", "Just now");
  const paragraph = document.createElement("p");
  paragraph.textContent = prompt;
  message.append(paragraph);
  agentThread.append(message);
  agentComposer.value = "";
  agentComposer.busy = true;
  if (agentRun) { agentRun.phase = "working"; agentRun.detail = "Working"; }
  setAgentStatus("Agent is working", "working", "Prompt retained locally");
  window.setTimeout(() => {
    agentComposer.busy = false;
    if (agentRun) { agentRun.phase = "complete"; agentRun.detail = "4 of 4 phases"; }
    setAgentStatus("Demo run complete", "ready", "No repository changes");
  }, 900);
});
agentComposer?.addEventListener("stop", () => {
  agentComposer.busy = false;
  if (agentRun) { agentRun.phase = "error"; agentRun.detail = "Stopped by user"; }
  setAgentStatus("Run stopped", "offline", "No changes applied");
});
const approval = document.querySelector("#agent-approval") as HTMLElement & { disabled: boolean } | null;
approval?.addEventListener("approve", () => {
  approval.disabled = true;
  setAgentStatus("Patch approved", "ready", "Ready to promote");
});
approval?.addEventListener("reject", () => {
  approval.disabled = true;
  setAgentStatus("Patch kept isolated", "ready", "Working tree unchanged");
});

type DiffViewerElement = HTMLElement & { patch: string; file: string; view: "unified" | "split" };
type TerminalElement = HTMLElement & { output: string; status: "idle" | "running" | "success" | "error"; duration: string };
type FileTreeElement = HTMLElement & { statuses: string };
const agentDiff = document.querySelector("#agent-diff") as DiffViewerElement | null;
const agentTerminal = document.querySelector("#agent-terminal") as TerminalElement | null;
const agentFileTree = document.querySelector("#agent-file-tree") as FileTreeElement | null;
const demoPatch = [
  "@@ -42,8 +42,12 @@ public TokenPair rotate(String rawToken) {",
  "+     RefreshToken current = repository.findValid(hash(rawToken))",
  "+         .orElseThrow(InvalidRefreshTokenException::new);",
  "-     current.setRevoked(true);",
  "-     return issuePair(current.getAccount());",
  "+     current.revoke(clock.instant());",
  "+     TokenPair replacement = issuePair(current.getAccount());",
  "+     repository.save(current);",
  "+     audit.recordRotation(current, replacement.refreshToken());",
  "+     return replacement;",
  "  }",
].join("\n");
if (agentDiff) agentDiff.patch = demoPatch;
if (agentTerminal) agentTerminal.output = [
  "[INFO] Scanning for projects…",
  "[INFO] Running RefreshTokenTest",
  "[INFO] Tests run: 6, Failures: 0, Errors: 0, Skipped: 0",
  "[INFO] BUILD SUCCESS",
].join("\n");
if (agentFileTree) agentFileTree.statuses = JSON.stringify({
  "src/components/OsxDiffViewer.ce.vue": "modified",
  "src/components/OsxFileTree.ce.vue": "added",
  "src/components/OsxTerminal.ce.vue": "added",
});
agentFileTree?.addEventListener("select", (event) => setAgentStatus(`${eventValue(event)} selected`, "ready", "Repository context"));
agentDiff?.addEventListener("view-change", (event) => setAgentStatus(`${eventValue(event)} diff selected`, "ready", "Review layout"));
agentDiff?.addEventListener("copy", async (event) => {
  await copyText(eventValue(event));
  setAgentStatus("Patch copied", "ready", "Clipboard updated");
});
agentTerminal?.addEventListener("rerun", () => {
  agentTerminal.status = "running";
  agentTerminal.duration = "";
  agentTerminal.output = "[INFO] Running focused verification…";
  setAgentStatus("Verification running", "working", "Focused test");
  window.setTimeout(() => {
    agentTerminal.status = "success";
    agentTerminal.duration = "7.2s";
    agentTerminal.output = "[INFO] Tests run: 6, Failures: 0, Errors: 0, Skipped: 0\n[INFO] BUILD SUCCESS";
    setAgentStatus("Verification passed", "ready", "6 tests passed");
  }, 900);
});
agentTerminal?.addEventListener("interrupt", () => {
  agentTerminal.status = "error";
  agentTerminal.output += "\n[ERROR] Command interrupted by user";
  setAgentStatus("Verification interrupted", "offline", "Review required");
});
agentTerminal?.addEventListener("clear", () => setAgentStatus("Terminal cleared", "ready", "Output removed"));

const snippets = {
  HTML: {
    file: "index.html",
    code: `<!-- npm install osx-components · serve with Vite -->
<script type="module">
  import { registerOsxComponents } from "osx-components";
  import "osx-components/theme.css";
  registerOsxComponents();
</script>

<div data-osx-theme="panther">
  <osx-app-shell app-title="Project Agent" inspector-open>
    <osx-agent-message author="Agent" model="Your model">
      I inspected the patch and verified the focused test.
    </osx-agent-message>
    <osx-agent-composer slot="composer" model="Provider · Model">
    </osx-agent-composer>
  </osx-app-shell>
</div>`,
  },
  Vue: {
    file: "AgentWorkspace.vue",
    code: `<script setup lang="ts">
import { onMounted } from "vue";
import { registerOsxComponents } from "osx-components";
import "osx-components/theme.css";

onMounted(registerOsxComponents);
</script>

<template>
  <div data-osx-theme="panther">
    <osx-app-shell app-title="Project Agent" inspector-open>
      <osx-agent-message author="Agent" model="Your model">
        I inspected the patch and verified the focused test.
      </osx-agent-message>
      <osx-agent-composer slot="composer" model="Provider · Model" />
    </osx-app-shell>
  </div>
</template>`,
  },
  React: {
    file: "AgentWorkspace.tsx",
    code: `import { useEffect } from "react";
import { registerOsxComponents } from "osx-components";
import "osx-components/theme.css";

export function AgentWorkspace() {
  useEffect(() => registerOsxComponents(), []);

  return (
    <div data-osx-theme="panther">
      <osx-app-shell app-title="Project Agent" inspector-open="true">
        <osx-agent-message author="Agent" model="Your model">
          I inspected the patch and verified the focused test.
        </osx-agent-message>
        <osx-agent-composer slot="composer" model="Provider · Model" />
      </osx-app-shell>
    </div>
  );
}`,
  },
  Svelte: {
    file: "AgentWorkspace.svelte",
    code: `<script lang="ts">
  import { onMount } from "svelte";
  import { registerOsxComponents } from "osx-components";
  import "osx-components/theme.css";

  onMount(registerOsxComponents);
</script>

<div data-osx-theme="panther">
  <osx-app-shell app-title="Project Agent" inspector-open>
    <osx-agent-message author="Agent" model="Your model">
      I inspected the patch and verified the focused test.
    </osx-agent-message>
    <osx-agent-composer slot="composer" model="Provider · Model" />
  </osx-app-shell>
</div>`,
  },
} as const;
type Framework = keyof typeof snippets;
const snippetPicker = document.querySelector("#snippet-framework") as HTMLElement & { value: string } | null;
const snippetOutput = document.querySelector("#snippet-output");
const snippetFile = document.querySelector("#snippet-file");
const snippetStatus = document.querySelector("#snippet-status");
let currentFramework: Framework = "HTML";
function isFramework(value: string): value is Framework { return value in snippets; }
function renderSnippet(framework: Framework, syncUrl = true) {
  currentFramework = framework;
  if (snippetPicker) snippetPicker.value = framework;
  if (snippetOutput) snippetOutput.textContent = snippets[framework].code;
  if (snippetFile) snippetFile.textContent = snippets[framework].file;
  if (snippetStatus) snippetStatus.textContent = `${framework} starter ready`;
  if (syncUrl) {
    const url = new URL(window.location.href);
    url.searchParams.set("framework", framework.toLowerCase());
    url.hash = "snippets";
    window.history.replaceState({}, "", url);
  }
}
async function copyText(value: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    try { await navigator.clipboard.writeText(value); return; } catch { /* Use the selection fallback below. */ }
  }
  const field = document.createElement("textarea");
  field.value = value;
  field.style.position = "fixed";
  field.style.opacity = "0";
  document.body.append(field);
  field.select();
  document.execCommand("copy");
  field.remove();
}
snippetPicker?.addEventListener("change", (event) => {
  const framework = eventValue(event);
  if (isFramework(framework)) renderSnippet(framework);
});
document.querySelector("#copy-snippet")?.addEventListener("click", async () => {
  await copyText(snippets[currentFramework].code);
  if (snippetStatus) snippetStatus.textContent = `${currentFramework} snippet copied`;
});
document.querySelector("#share-snippet")?.addEventListener("click", async () => {
  renderSnippet(currentFramework);
  await copyText(window.location.href);
  if (snippetStatus) snippetStatus.textContent = "Share link copied";
});
const requestedFramework = new URL(window.location.href).searchParams.get("framework");
const initialFramework = requestedFramework ? `${requestedFramework.slice(0,1).toUpperCase()}${requestedFramework.slice(1).toLowerCase()}` : "HTML";
renderSnippet(isFramework(initialFramework) ? initialFramework : "HTML", false);
