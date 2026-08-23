<script setup lang="ts">
withDefaults(defineProps<{ label?: string; compact?: boolean }>(), { label: "Toolbar", compact: false });
</script>

<template>
  <div :class="['toolbar', { compact }]" role="toolbar" :aria-label="label"><div><slot name="leading"></slot></div><div class="center"><slot></slot></div><div><slot name="trailing"></slot></div></div>
</template>

<style>
:host { display: block; font-family: var(--osx-font); }
.toolbar { min-height: 50px; display: grid; grid-template-columns: 1fr auto 1fr; gap: 12px; align-items: center; padding: 7px 12px; border-top: 1px solid var(--osx-highlight); border-bottom: 1px solid var(--osx-border); background: linear-gradient(var(--osx-title-start), var(--osx-title-end)); }
.toolbar.compact { min-height: 34px; padding-block: 4px; }
.toolbar > div { display: flex; gap: 7px; align-items: center; }
.toolbar > div:last-child { justify-content: flex-end; }
.center { justify-content: center; }
</style>
