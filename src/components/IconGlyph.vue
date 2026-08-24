<script setup lang="ts">
import { computed } from "vue";
import { iconRegistry, type OsxIconName } from "../icons";

const props = withDefaults(defineProps<{ name?: OsxIconName; size?: number; label?: string; strokeWidth?: number; absoluteStrokeWidth?: boolean }>(), {
  name: "info", size: 20, label: "", strokeWidth: 2, absoluteStrokeWidth: true,
});
const glyph = computed(() => iconRegistry[props.name] ?? iconRegistry.info);
</script>

<template><component :is="glyph" :size="size" :stroke-width="strokeWidth" :absolute-stroke-width="absoluteStrokeWidth" :role="label ? 'img' : undefined" :aria-label="label || undefined" :aria-hidden="label ? undefined : 'true'" /></template>
