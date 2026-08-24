<script setup lang="ts">
withDefaults(defineProps<{ tone?: "neutral" | "info" | "success" | "warning" | "danger"; size?: "small" | "medium"; label?: string; dot?: boolean }>(), { tone: "neutral", size: "medium", label: "", dot: false });
</script>
<template><span :class="['badge',tone,size,{ dot }]" :aria-label="label || undefined"><i v-if="dot" aria-hidden="true"></i><slot>{{ label }}</slot></span></template>
<style>
:host { display: inline-flex; color: var(--osx-text); font-family: var(--osx-font); }.badge { --tone: var(--osx-muted); display: inline-flex; gap: 5px; align-items: center; min-height: 22px; padding: 2px 8px; border: 1px solid color-mix(in srgb,var(--tone) 55%,var(--osx-border)); border-radius: 999px; color: var(--osx-text); background: color-mix(in srgb,var(--tone) 10%,var(--osx-surface-raised)); font-size: 12px; font-weight: 800; line-height: 1.2; }.info { --tone: var(--osx-accent); }.success { --tone: var(--osx-success); }.warning { --tone: var(--osx-warning); }.danger { --tone: var(--osx-danger); }.small { min-height: 18px; padding-inline: 6px; }.badge i { width: 7px; height: 7px; border-radius: 50%; background: var(--tone); box-shadow: 0 0 0 1px color-mix(in srgb,var(--tone) 60%,#111); }
</style>
