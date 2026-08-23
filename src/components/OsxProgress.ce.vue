<script setup lang="ts">
import { computed } from "vue";
const props = withDefaults(defineProps<{ value?: number; max?: number; indeterminate?: boolean; label?: string }>(), { value: 0, max: 100, indeterminate: false, label: "Progress" });
const percent = computed(() => Math.max(0, Math.min(100, (props.value / Math.max(1, props.max)) * 100)));
</script>

<template>
  <div class="progress" role="progressbar" :aria-label="label" :aria-valuemin="indeterminate ? undefined : 0" :aria-valuemax="indeterminate ? undefined : max" :aria-valuenow="indeterminate ? undefined : value">
    <span :class="{ indeterminate }" :style="indeterminate ? undefined : { width: `${percent}%` }"></span>
  </div>
</template>

<style>
:host { display: block; min-width: 100px; }
.progress { height: 12px; overflow: hidden; border: 1px solid var(--osx-border); border-radius: 7px; background: var(--osx-surface-sunken); box-shadow: 0 1px 2px rgba(0, 0, 0, .2) inset, 0 1px var(--osx-highlight); }
.progress span { height: 100%; display: block; border-radius: inherit; background: repeating-linear-gradient(135deg, rgba(255,255,255,.28) 0 5px, transparent 5px 10px), linear-gradient(var(--osx-accent-light), var(--osx-accent)); transition: width .2s ease; }
.progress span.indeterminate { width: 35%; animation: travel 1.25s ease-in-out infinite; }
@keyframes travel { 0% { transform: translateX(-105%); } 100% { transform: translateX(300%); } }
@media (prefers-reduced-motion: reduce) { .progress span { transition: none; } .progress span.indeterminate { width: 100%; animation: none; } }
</style>
