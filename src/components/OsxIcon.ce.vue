<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(defineProps<{
  name?: "search" | "chevron-right" | "chevron-down" | "check" | "close" | "info" | "warning" | "error" | "sparkle" | "terminal" | "file" | "folder" | "copy" | "play" | "stop" | "settings" | "grid";
  size?: number;
  label?: string;
  strokeWidth?: number;
}>(), { name: "info", size: 20, label: "", strokeWidth: 1.8 });

const paths: Record<string, string[]> = {
  search: ["m21 21-4.35-4.35", "M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z"],
  "chevron-right": ["m9 18 6-6-6-6"],
  "chevron-down": ["m6 9 6 6 6-6"],
  check: ["m5 12 4 4L19 6"],
  close: ["M18 6 6 18", "m6 6 12 12"],
  info: ["M12 16v-4", "M12 8h.01", "M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z"],
  warning: ["M10.3 2.9 1.8 17a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 2.9a2 2 0 0 0-3.4 0Z", "M12 9v4", "M12 17h.01"],
  error: ["M15 9 9 15", "m9-6 6 6", "M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z"],
  sparkle: ["m12 3-1.6 4.4L6 9l4.4 1.6L12 15l1.6-4.4L18 9l-4.4-1.6L12 3Z", "m19 15-.8 2.2L16 18l2.2.8L19 21l.8-2.2L22 18l-2.2-.8L19 15Z"],
  terminal: ["m4 17 6-5-6-5", "M12 19h8"],
  file: ["M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z", "M14 2v6h6"],
  folder: ["M3 6h6l2 2h10v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"],
  copy: ["M8 8h12v12H8Z", "M4 16V4h12"],
  play: ["m8 5 11 7-11 7Z"],
  stop: ["M7 7h10v10H7Z"],
  settings: ["M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z", "M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2 3.46-.09-.03a1.7 1.7 0 0 0-1.8.2l-.62.36a1.7 1.7 0 0 0-.82 1.69V22h-4v-.1a1.7 1.7 0 0 0-.82-1.69l-.62-.36a1.7 1.7 0 0 0-1.8-.2l-.09.03-2-3.46.06-.06A1.7 1.7 0 0 0 4.6 15v-.72a1.7 1.7 0 0 0-1.08-1.57L3.44 12l2-3.46.09.03a1.7 1.7 0 0 0 1.8-.2l.62-.36a1.7 1.7 0 0 0 .82-1.69V6h4v.1a1.7 1.7 0 0 0 .82 1.69l.62.36a1.7 1.7 0 0 0 1.8.2l.09-.03 2 3.46-.06.06a1.7 1.7 0 0 0-.64 1.88Z"],
  grid: ["M4 4h6v6H4Z", "M14 4h6v6h-6Z", "M4 14h6v6H4Z", "M14 14h6v6h-6Z"],
};
const iconPaths = computed(() => paths[props.name] ?? paths.info);
</script>

<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor" :stroke-width="strokeWidth" stroke-linecap="round" stroke-linejoin="round" :role="label ? 'img' : undefined" :aria-label="label || undefined" :aria-hidden="label ? undefined : 'true'">
    <path v-for="path in iconPaths" :key="path" :d="path" />
  </svg>
</template>

<style>
:host { display: inline-flex; flex: 0 0 auto; align-items: center; justify-content: center; color: inherit; line-height: 0; vertical-align: middle; }
svg { display: block; }
</style>
