<script setup lang="ts">
import IconGlyph from "./IconGlyph.vue";
import type { OsxIconName } from "../icons";

withDefaults(defineProps<{ name?: OsxIconName; size?: number; label?: string; strokeWidth?: number; absoluteStrokeWidth?: boolean }>(), {
  name: "info", size: 20, label: "", strokeWidth: 2, absoluteStrokeWidth: true,
});
</script>

<template><IconGlyph :name="name" :size="size" :label="label" :stroke-width="strokeWidth" :absolute-stroke-width="absoluteStrokeWidth" /></template>

<style>
:host { display: inline-flex; flex: 0 0 auto; align-items: center; justify-content: center; color: inherit; line-height: 0; vertical-align: middle; }
</style>
