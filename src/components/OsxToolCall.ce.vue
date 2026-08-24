<script setup lang="ts">
import IconGlyph from "./IconGlyph.vue";
withDefaults(defineProps<{
  name?: string;
  status?: "queued" | "running" | "success" | "error";
  summary?: string;
  duration?: string;
  open?: boolean;
}>(), { name: "Tool", status: "queued", summary: "", duration: "", open: false });
</script>

<template>
  <details :open="open" :class="status">
    <summary><span class="state"><IconGlyph :name="status === 'success' ? 'check' : status === 'error' ? 'close' : status === 'running' ? 'loader' : 'circle'" :size="13" /></span><strong>{{ name }}</strong><span>{{ summary }}</span><time v-if="duration">{{ duration }}</time></summary>
    <div class="result"><slot></slot></div>
  </details>
</template>

<style>
:host { display: block; color: var(--osx-text); font-family: var(--osx-font); }
details { overflow: hidden; border: 1px solid var(--osx-border-soft); border-radius: 7px; background: var(--osx-surface-raised); }
summary { min-height: 38px; display: grid; grid-template-columns: auto auto minmax(0,1fr) auto; gap: 9px; align-items: center; padding: 7px 10px; cursor: pointer; list-style: none; }
summary::-webkit-details-marker { display: none; }
.state { width: 22px; height: 22px; display: grid; place-items: center; border: 1px solid var(--osx-border); border-radius: 50%; color: var(--osx-muted); background: var(--osx-surface-sunken); font-size: 12px; font-weight: 800; }
.success .state { color: var(--osx-success,#2f9951); border-color: var(--osx-success,#2f9951); }.error .state { color: var(--osx-danger,#c74d47); border-color: var(--osx-danger,#c74d47); }.running .state { color: var(--osx-accent); border-color: var(--osx-accent); }
summary strong { font-size: 13px; }summary span:not(.state),summary time { overflow: hidden; color: var(--osx-muted); font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
.result { padding: 10px 12px; border-top: 1px solid var(--osx-border-soft); overflow-wrap: anywhere; color: var(--osx-muted); background: var(--osx-surface-sunken); font: 12px/1.55 ui-monospace,monospace; }
@media (max-width: 480px) { summary { grid-template-columns: auto minmax(0,1fr) auto; }summary span:not(.state) { grid-column: 2 / -1; } }
</style>
