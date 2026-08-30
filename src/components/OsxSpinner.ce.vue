<script setup lang="ts">
withDefaults(defineProps<{
  size?: "small" | "medium" | "large";
  tone?: "default" | "accent" | "inverse";
  label?: string;
  showLabel?: boolean;
  paused?: boolean;
}>(), { size: "medium", tone: "accent", label: "Loading", showLabel: false, paused: false });
</script>

<template>
  <span class="spinner-shell" :class="[size, tone, { paused }]" role="status" :aria-label="label" aria-live="polite">
    <svg viewBox="0 0 24 24" aria-hidden="true"><circle class="track" cx="12" cy="12" r="9"></circle><path class="indicator" d="M12 3a9 9 0 0 1 9 9"></path></svg>
    <span v-if="showLabel" class="label"><slot>{{ label }}</slot></span>
  </span>
</template>

<style>
:host { display: inline-block; color: var(--osx-text); font-family: var(--osx-font); }
.spinner-shell { display: inline-flex; gap: 8px; align-items: center; color: var(--osx-accent-ink); font: 600 12px/1.2 var(--osx-font); }
svg { width: 20px; height: 20px; display: block; overflow: visible; animation: spin .8s linear infinite; fill: none; stroke-width: 3; stroke-linecap: round; }
.track { stroke: color-mix(in srgb, currentColor 22%, transparent); }.indicator { stroke: currentColor; }
.small svg { width: 14px; height: 14px; stroke-width: 3.5; }.large svg { width: 28px; height: 28px; stroke-width: 2.5; }
.default { color: var(--osx-muted); }.inverse { color: white; }.paused svg { animation-play-state: paused; }
@keyframes spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { svg { animation: none; } }
</style>
