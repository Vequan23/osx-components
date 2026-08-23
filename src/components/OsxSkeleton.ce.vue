<script setup lang="ts">
import { computed } from "vue";
const props = withDefaults(defineProps<{ variant?: "text" | "card" | "profile"; lines?: number; animated?: boolean; label?: string }>(), { variant: "text", lines: 3, animated: true, label: "Loading content" });
const lineCount = computed(() => Math.max(1, Math.min(8, props.lines)));
</script>
<template>
  <section :class="['skeleton', variant, { animated }]" role="status" aria-busy="true" :aria-label="label">
    <span v-if="variant === 'card'" class="media"></span>
    <span v-if="variant === 'profile'" class="avatar"></span>
    <div class="lines"><span v-for="index in lineCount" :key="index" :style="{ width: index === lineCount ? '67%' : index % 2 ? '100%' : '86%' }"></span></div>
  </section>
</template>
<style>
:host { display: block; }
.skeleton { --base: color-mix(in srgb,var(--osx-muted) 17%,var(--osx-surface-sunken)); --shine: color-mix(in srgb,var(--osx-surface-raised) 78%,white); display: grid; gap: 11px; padding: 12px; border: 1px solid var(--osx-border-soft); border-radius: 8px; background: var(--osx-surface-raised); }.profile { grid-template-columns: 44px minmax(0,1fr); align-items: center; }.media,.avatar,.lines span { display: block; overflow: hidden; background: var(--base); }.media { height: 92px; border-radius: 6px; }.avatar { width: 44px; height: 44px; border-radius: 50%; }.lines { display: grid; gap: 8px; align-content: center; }.lines span { height: 12px; border-radius: 5px; }
.animated .media,.animated .avatar,.animated .lines span { background: linear-gradient(100deg,var(--base) 20%,var(--shine) 40%,var(--base) 60%); background-size: 240% 100%; animation: shimmer 1.45s linear infinite; }@keyframes shimmer { from { background-position: 100% 0; }to { background-position: -140% 0; } }@media (prefers-reduced-motion: reduce) { .animated .media,.animated .avatar,.animated .lines span { animation: none; } }
</style>
