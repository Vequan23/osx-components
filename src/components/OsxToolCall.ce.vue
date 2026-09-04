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
    <summary><span class="state"><IconGlyph :name="status === 'success' ? 'check' : status === 'error' ? 'close' : status === 'running' ? 'loader' : 'circle'" :size="15" /></span><strong>{{ name }}</strong><span>{{ summary }}</span><time v-if="duration">{{ duration }}</time></summary>
    <div class="result"><slot></slot></div>
  </details>
</template>

<style>
:host { display: block; color: var(--osx-text); font-family: var(--osx-font); }
details { overflow: hidden; border: 1px solid var(--osx-border-soft); border-radius: 7px; background: var(--osx-surface-raised); }
summary { min-height: 38px; display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 6px 9px; align-items: start; padding: 7px 10px; cursor: pointer; list-style: none; }
summary::-webkit-details-marker { display: none; }
.state { grid-row: 1 / span 3; width: 27px; height: 27px; display: grid; place-items: center; border: 1px solid var(--osx-border); border-radius: 50%; color: var(--osx-muted); background: var(--osx-surface-sunken); font-size: 12px; font-weight: 800; }
.success .state { color: var(--osx-success,#2f9951); border-color: var(--osx-success,#2f9951); }.error .state { color: var(--osx-danger,#c74d47); border-color: var(--osx-danger,#c74d47); }.running .state { color: var(--osx-accent-ink); border-color: var(--osx-accent); }
summary strong { grid-column: 2; font-size: 13px; }
summary span:not(.state), summary time { grid-column: 2; color: var(--osx-muted); font-size: 12px; line-height: 1.45; overflow-wrap: anywhere; word-break: break-word; }
summary time { justify-self: start; }
.result { padding: 10px 12px; border-top: 1px solid var(--osx-border-soft); overflow-wrap: anywhere; color: var(--osx-muted); background: var(--osx-surface-sunken); font: 12px/1.55 ui-monospace,monospace; }
</style>
