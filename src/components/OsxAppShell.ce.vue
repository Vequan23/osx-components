<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";

type Panel = "sidebar" | "inspector";
const props = withDefaults(defineProps<{
  appTitle?: string;
  sidebarWidth?: string;
  inspectorWidth?: string;
  inspectorOpen?: boolean;
  label?: string;
  resizable?: boolean;
  sidebarMinWidth?: number;
  sidebarMaxWidth?: number;
  inspectorMinWidth?: number;
  inspectorMaxWidth?: number;
}>(), {
  appTitle: "Application",
  sidebarWidth: "220px",
  inspectorWidth: "280px",
  inspectorOpen: true,
  label: "Application workspace",
  resizable: false,
  sidebarMinWidth: 160,
  sidebarMaxWidth: 420,
  inspectorMinWidth: 220,
  inspectorMaxWidth: 520,
});

const emit = defineEmits<{ "panel-resize": [panel: Panel, width: number] }>();
const sidebarPanel = ref<HTMLElement | null>(null);
const inspectorPanel = ref<HTMLElement | null>(null);
const localSidebarWidth = ref(props.sidebarWidth);
const localInspectorWidth = ref(props.inspectorWidth);
const sidebarPixels = ref(Math.round(Number.parseFloat(props.sidebarWidth) || props.sidebarMinWidth));
const inspectorPixels = ref(Math.round(Number.parseFloat(props.inspectorWidth) || props.inspectorMinWidth));
const dragging = ref<{ panel: Panel; pointerId: number; startX: number; startWidth: number; target: HTMLElement } | null>(null);

watch(() => props.sidebarWidth, async (value) => { localSidebarWidth.value = value; await nextTick(); syncPanelWidth("sidebar"); });
watch(() => props.inspectorWidth, async (value) => { localInspectorWidth.value = value; await nextTick(); syncPanelWidth("inspector"); });

function limits(panel: Panel) {
  return panel === "sidebar"
    ? { min: props.sidebarMinWidth, max: props.sidebarMaxWidth }
    : { min: props.inspectorMinWidth, max: props.inspectorMaxWidth };
}
function panelElement(panel: Panel) { return panel === "sidebar" ? sidebarPanel.value : inspectorPanel.value; }
function measuredPanelWidth(panel: Panel) {
  const element = panelElement(panel);
  if (element) return Math.round(element.getBoundingClientRect().width);
  return Math.round(Number.parseFloat(panel === "sidebar" ? localSidebarWidth.value : localInspectorWidth.value) || limits(panel).min);
}
function panelWidth(panel: Panel) { return panel === "sidebar" ? sidebarPixels.value : inspectorPixels.value; }
function syncPanelWidth(panel: Panel) {
  const width = measuredPanelWidth(panel);
  if (panel === "sidebar") sidebarPixels.value = width;
  else inspectorPixels.value = width;
}
function setPanelWidth(panel: Panel, width: number) {
  const { min, max } = limits(panel);
  const next = Math.round(Math.min(max, Math.max(min, width)));
  if (panel === "sidebar") { localSidebarWidth.value = next + "px"; sidebarPixels.value = next; }
  else { localInspectorWidth.value = next + "px"; inspectorPixels.value = next; }
  emit("panel-resize", panel, next);
}
function startResize(panel: Panel, event: PointerEvent) {
  if (!props.resizable || event.button !== 0) return;
  event.preventDefault();
  const target = event.currentTarget as HTMLElement;
  try { target.setPointerCapture(event.pointerId); } catch { /* Global listeners preserve dragging when capture is unavailable. */ }
  const startWidth = measuredPanelWidth(panel);
  if (panel === "sidebar") sidebarPixels.value = startWidth;
  else inspectorPixels.value = startWidth;
  dragging.value = { panel, pointerId: event.pointerId, startX: event.clientX, startWidth, target };
  window.addEventListener("pointermove", moveResize);
  window.addEventListener("pointerup", endResize);
  window.addEventListener("pointercancel", endResize);
  window.addEventListener("mousemove", moveMouseResize);
  window.addEventListener("mouseup", endMouseResize);
}
function moveResize(event: PointerEvent) {
  const active = dragging.value;
  if (!active || active.pointerId !== event.pointerId) return;
  const direction = active.panel === "sidebar" ? 1 : -1;
  setPanelWidth(active.panel, active.startWidth + (event.clientX - active.startX) * direction);
}
function endResize(event: PointerEvent) {
  const active = dragging.value;
  if (!active || active.pointerId !== event.pointerId) return;
  if (active.target.hasPointerCapture(event.pointerId)) active.target.releasePointerCapture(event.pointerId);
  dragging.value = null;
  removePointerListeners();
}
function moveMouseResize(event: MouseEvent) {
  const active = dragging.value;
  if (!active) return;
  const direction = active.panel === "sidebar" ? 1 : -1;
  setPanelWidth(active.panel, active.startWidth + (event.clientX - active.startX) * direction);
}
function endMouseResize() { if (!dragging.value) return; dragging.value = null; removePointerListeners(); }
function removePointerListeners() {
  window.removeEventListener("pointermove", moveResize);
  window.removeEventListener("pointerup", endResize);
  window.removeEventListener("pointercancel", endResize);
  window.removeEventListener("mousemove", moveMouseResize);
  window.removeEventListener("mouseup", endMouseResize);
}
function resizeWithKeyboard(panel: Panel, event: KeyboardEvent) {
  const { min, max } = limits(panel);
  let next = panelWidth(panel);
  if (event.key === "Home") next = min;
  else if (event.key === "End") next = max;
  else if (event.key === "ArrowLeft") next += panel === "sidebar" ? -10 : 10;
  else if (event.key === "ArrowRight") next += panel === "sidebar" ? 10 : -10;
  else return;
  event.preventDefault();
  setPanelWidth(panel, next);
}
onMounted(() => { syncPanelWidth("sidebar"); syncPanelWidth("inspector"); });
onBeforeUnmount(removePointerListeners);
</script>

<template>
  <section
    :class="['shell', { 'without-inspector': !inspectorOpen, resizable }]"
    :style="{ '--osx-sidebar-width': localSidebarWidth, '--osx-inspector-width': localInspectorWidth }"
    :aria-label="label"
  >
    <header><strong>{{ appTitle }}</strong><div><slot name="toolbar"></slot></div></header>
    <aside ref="sidebarPanel" class="sidebar" aria-label="Workspace navigation"><slot name="sidebar"></slot></aside>
    <div
      v-if="resizable"
      class="resizer sidebar-resizer"
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize navigation panel"
      :aria-valuemin="sidebarMinWidth"
      :aria-valuemax="sidebarMaxWidth"
      :aria-valuenow="panelWidth('sidebar')"
      tabindex="0"
      @keydown="resizeWithKeyboard('sidebar', $event)"
      @pointerdown="startResize('sidebar', $event)"
    ></div>
    <section class="workspace" aria-label="Workspace content"><div class="content"><slot></slot></div><div class="composer"><slot name="composer"></slot></div></section>
    <div
      v-if="resizable && inspectorOpen"
      class="resizer inspector-resizer"
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize inspector panel"
      :aria-valuemin="inspectorMinWidth"
      :aria-valuemax="inspectorMaxWidth"
      :aria-valuenow="panelWidth('inspector')"
      tabindex="0"
      @keydown="resizeWithKeyboard('inspector', $event)"
      @pointerdown="startResize('inspector', $event)"
    ></div>
    <aside v-if="inspectorOpen" ref="inspectorPanel" class="inspector" aria-label="Inspector"><slot name="inspector"></slot></aside>
    <footer><slot name="status"></slot></footer>
  </section>
</template>

<style>
:host { width: 100%; height: 100%; min-width: 0; min-height: 0; display: block; color: var(--osx-text); font-family: var(--osx-font); }
.shell { height: 100%; min-height: 520px; box-sizing: border-box; display: grid; grid-template: "toolbar toolbar toolbar" auto "sidebar main inspector" minmax(0,1fr) "status status status" auto / var(--osx-sidebar-width) minmax(0,1fr) var(--osx-inspector-width); overflow: hidden; border: 1px solid var(--osx-border); border-radius: 9px; background: var(--osx-surface); box-shadow: var(--osx-shadow); }
.shell.without-inspector { grid-template: "toolbar toolbar" auto "sidebar main" minmax(0,1fr) "status status" auto / var(--osx-sidebar-width) minmax(0,1fr); }
.shell.resizable { grid-template: "toolbar toolbar toolbar toolbar toolbar" auto "sidebar sidebar-resizer main inspector-resizer inspector" minmax(0,1fr) "status status status status status" auto / var(--osx-sidebar-width) 9px minmax(0,1fr) 9px var(--osx-inspector-width); }
.shell.resizable.without-inspector { grid-template: "toolbar toolbar toolbar" auto "sidebar sidebar-resizer main" minmax(0,1fr) "status status status" auto / var(--osx-sidebar-width) 9px minmax(0,1fr); }
header { grid-area: toolbar; min-height: 44px; display: flex; gap: 16px; align-items: center; justify-content: space-between; padding: 7px 12px; border-bottom: 1px solid var(--osx-border); background: linear-gradient(var(--osx-title-start),var(--osx-title-end)); box-shadow: 0 1px var(--osx-highlight) inset; }
header strong { overflow: hidden; font-size: 13px; text-overflow: ellipsis; white-space: nowrap; }
header div { min-width: 0; display: flex; gap: 8px; align-items: center; justify-content: flex-end; }
.sidebar { grid-area: sidebar; min-width: 0; overflow: auto; border-right: 1px solid var(--osx-border); background: var(--osx-surface-sunken); }
.resizable .sidebar { border-right: 0; }
.workspace { grid-area: main; min-width: 0; min-height: 0; display: grid; grid-template-rows: minmax(0,1fr) auto; background: var(--osx-surface); }
.content { min-width: 0; min-height: 0; overflow: auto; }
.composer { border-top: 1px solid var(--osx-border-soft); background: var(--osx-surface-raised); }
.inspector { grid-area: inspector; min-width: 0; overflow: auto; border-left: 1px solid var(--osx-border); background: var(--osx-surface-sunken); }
.resizable .inspector { border-left: 0; }
.resizer { position: relative; z-index: 2; padding: 0; outline: 0; background: var(--osx-surface-sunken); cursor: col-resize; touch-action: none; }.resizer::after { width: 1px; position: absolute; inset: 0 auto 0 4px; background: var(--osx-border); content: ""; }.resizer:hover::after,.resizer:focus-visible::after { width: 3px; left: 3px; border-radius: 2px; background: var(--osx-accent); }.resizer:focus-visible { box-shadow: 0 0 0 3px var(--osx-focus) inset; }.sidebar-resizer { grid-area: sidebar-resizer; }.inspector-resizer { grid-area: inspector-resizer; }
footer { grid-area: status; min-width: 0; border-top: 1px solid var(--osx-border); background: linear-gradient(var(--osx-title-start),var(--osx-title-end)); }
@media (max-width: 760px) {
  .shell,.shell.resizable,.shell.without-inspector,.shell.resizable.without-inspector { grid-template: "toolbar" auto "sidebar" auto "main" minmax(420px,auto) "inspector" auto "status" auto / minmax(0,1fr); overflow: auto; }
  .shell.without-inspector,.shell.resizable.without-inspector { grid-template-areas: "toolbar" "sidebar" "main" "status"; }
  .resizer { display: none; }
  .sidebar { max-height: 150px; border-right: 0; border-bottom: 1px solid var(--osx-border); }
  .inspector { border-top: 1px solid var(--osx-border); border-left: 0; }
}
@media (max-width: 480px) {
  .shell { border-inline: 0; border-radius: 0; }
  header { align-items: flex-start; flex-direction: column; }
  header div { width: 100%; justify-content: flex-start; }
}
</style>
