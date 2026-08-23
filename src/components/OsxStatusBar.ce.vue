<script setup lang="ts">
withDefaults(defineProps<{ label?: string; status?: "ready" | "working" | "offline"; detail?: string }>(), { label: "Ready", status: "ready", detail: "" });
</script>

<template>
  <footer><div><i :class="status" aria-hidden="true"></i><strong>{{ label }}</strong><slot></slot></div><span>{{ detail }}</span><slot name="trailing"></slot></footer>
</template>

<style>
:host { display: block; color: var(--osx-muted); font-family: var(--osx-font); }
footer { min-height: 24px; display: grid; grid-template-columns: 1fr auto auto; gap: 12px; align-items: center; padding: 3px 9px; border-top: 1px solid var(--osx-border); background: repeating-linear-gradient(0deg, transparent 0 2px, rgba(255,255,255,.12) 2px 3px), linear-gradient(var(--osx-title-start),var(--osx-title-end)); box-shadow: 0 1px var(--osx-highlight) inset; font-size: 12px; }footer div { min-width: 0; display: flex; gap: 6px; align-items: center; }strong { overflow: hidden; color: var(--osx-text); text-overflow: ellipsis; white-space: nowrap; }i { width: 8px; height: 8px; flex: 0 0 8px; border: 1px solid #28773b; border-radius: 50%; background: #3db45a; box-shadow: 0 1px rgba(255,255,255,.45) inset; }.working { border-color: #a16a1e; background: #e9a92f; }.offline { border-color: #8b3430; background: #ce4f48; }
</style>
