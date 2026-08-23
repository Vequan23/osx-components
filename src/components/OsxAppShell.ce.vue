<script setup lang="ts">
withDefaults(defineProps<{
  appTitle?: string;
  sidebarWidth?: string;
  inspectorWidth?: string;
  inspectorOpen?: boolean;
  label?: string;
}>(), {
  appTitle: "Application",
  sidebarWidth: "220px",
  inspectorWidth: "280px",
  inspectorOpen: true,
  label: "Application workspace",
});
</script>

<template>
  <section
    :class="['shell', { 'without-inspector': !inspectorOpen }]"
    :style="{ '--osx-sidebar-width': sidebarWidth, '--osx-inspector-width': inspectorWidth }"
    :aria-label="label"
  >
    <header><strong>{{ appTitle }}</strong><div><slot name="toolbar"></slot></div></header>
    <aside class="sidebar" aria-label="Workspace navigation"><slot name="sidebar"></slot></aside>
    <section class="workspace" aria-label="Workspace content"><div class="content"><slot></slot></div><div class="composer"><slot name="composer"></slot></div></section>
    <aside v-if="inspectorOpen" class="inspector" aria-label="Inspector"><slot name="inspector"></slot></aside>
    <footer><slot name="status"></slot></footer>
  </section>
</template>

<style>
:host { display: block; min-width: 0; color: var(--osx-text); font-family: var(--osx-font); }
.shell { min-height: 520px; display: grid; grid-template: "toolbar toolbar toolbar" auto "sidebar main inspector" minmax(0,1fr) "status status status" auto / var(--osx-sidebar-width) minmax(0,1fr) var(--osx-inspector-width); overflow: hidden; border: 1px solid var(--osx-border); border-radius: 9px; background: var(--osx-surface); box-shadow: var(--osx-shadow); }
.shell.without-inspector { grid-template: "toolbar toolbar" auto "sidebar main" minmax(0,1fr) "status status" auto / var(--osx-sidebar-width) minmax(0,1fr); }
header { grid-area: toolbar; min-height: 44px; display: flex; gap: 16px; align-items: center; justify-content: space-between; padding: 7px 12px; border-bottom: 1px solid var(--osx-border); background: linear-gradient(var(--osx-title-start),var(--osx-title-end)); box-shadow: 0 1px var(--osx-highlight) inset; }
header strong { overflow: hidden; font-size: 13px; text-overflow: ellipsis; white-space: nowrap; }
header div { min-width: 0; display: flex; gap: 8px; align-items: center; justify-content: flex-end; }
.sidebar { grid-area: sidebar; min-width: 0; overflow: auto; border-right: 1px solid var(--osx-border); background: var(--osx-surface-sunken); }
.workspace { grid-area: main; min-width: 0; min-height: 0; display: grid; grid-template-rows: minmax(0,1fr) auto; background: var(--osx-surface); }
.content { min-width: 0; min-height: 0; overflow: auto; }
.composer { border-top: 1px solid var(--osx-border-soft); background: var(--osx-surface-raised); }
.inspector { grid-area: inspector; min-width: 0; overflow: auto; border-left: 1px solid var(--osx-border); background: var(--osx-surface-sunken); }
footer { grid-area: status; min-width: 0; border-top: 1px solid var(--osx-border); background: linear-gradient(var(--osx-title-start),var(--osx-title-end)); }
@media (max-width: 760px) {
  .shell,.shell.without-inspector { grid-template: "toolbar" auto "sidebar" auto "main" minmax(420px,auto) "inspector" auto "status" auto / minmax(0,1fr); }
  .shell.without-inspector { grid-template-areas: "toolbar" "sidebar" "main" "status"; }
  .sidebar { max-height: 150px; border-right: 0; border-bottom: 1px solid var(--osx-border); }
  .inspector { border-top: 1px solid var(--osx-border); border-left: 0; }
}
@media (max-width: 480px) {
  .shell { border-inline: 0; border-radius: 0; }
  header { align-items: flex-start; flex-direction: column; }
  header div { width: 100%; justify-content: flex-start; }
}
</style>
