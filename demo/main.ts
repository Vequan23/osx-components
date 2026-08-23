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
