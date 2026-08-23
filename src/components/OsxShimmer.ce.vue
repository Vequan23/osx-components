<script setup lang="ts">
withDefaults(defineProps<{ width?: string; height?: string; radius?: string; paused?: boolean; label?: string }>(), { width: "100%", height: "16px", radius: "6px", paused: false, label: "Loading" });
</script>
<template><span class="shimmer" :class="{ paused }" :style="{ width, height, borderRadius: radius }" role="status" aria-busy="true" :aria-label="label"></span></template>
<style>
:host { display: inline-block; max-width: 100%; line-height: 0; }
.shimmer { display: block; max-width: 100%; overflow: hidden; background: linear-gradient(100deg,color-mix(in srgb,var(--osx-muted) 19%,var(--osx-surface-sunken)) 20%,color-mix(in srgb,var(--osx-surface-raised) 78%,white) 40%,color-mix(in srgb,var(--osx-muted) 19%,var(--osx-surface-sunken)) 60%); background-size: 240% 100%; animation: shimmer 1.45s linear infinite; }
.paused { animation-play-state: paused; }@keyframes shimmer { from { background-position: 100% 0; }to { background-position: -140% 0; } }@media (prefers-reduced-motion: reduce) { .shimmer { animation: none; } }
</style>
