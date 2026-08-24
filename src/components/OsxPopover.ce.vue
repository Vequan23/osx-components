<script setup lang="ts">
import { ref, watch } from "vue";
import IconGlyph from "./IconGlyph.vue";
const props = withDefaults(defineProps<{ open?: boolean; placement?: "top" | "right" | "bottom" | "left"; label?: string; dismissible?: boolean }>(), { open: false, placement: "bottom", label: "Popover", dismissible: true });
const emit = defineEmits<{ "open-change": [open: boolean]; close: [] }>();
const visible = ref(props.open); watch(() => props.open, (value) => { visible.value = value; });
function setOpen(value: boolean) { visible.value = value; emit("open-change", value); if (!value) emit("close"); }
</script>
<template><span class="anchor" @keydown.esc="dismissible && setOpen(false)"><span class="trigger" @click="setOpen(!visible)"><slot name="trigger"></slot></span><section v-if="visible" :class="['popover',placement]" role="dialog" :aria-label="label"><slot></slot><button v-if="dismissible" type="button" aria-label="Close popover" @click="setOpen(false)"><IconGlyph name="close" :size="18" /></button></section></span></template>
<style>
:host { display: inline-flex; color: var(--osx-text); font-family: var(--osx-font); }.anchor { position: relative; display: inline-flex; }.trigger { display: inline-flex; }.popover { width: min(320px,calc(100vw - 32px)); position: absolute; z-index: 1150; padding: 14px; border: 1px solid var(--osx-border); border-radius: 8px; background: var(--osx-surface-raised); box-shadow: var(--osx-shadow); font-size: 13px; line-height: 1.45; }.bottom { top: calc(100% + 8px); left: 0; }.top { bottom: calc(100% + 8px); left: 0; }.right { top: 0; left: calc(100% + 8px); }.left { top: 0; right: calc(100% + 8px); }.popover button { width: 26px; height: 26px; position: absolute; top: 6px; right: 6px; border: 0; border-radius: 5px; color: var(--osx-muted); background: transparent; font: 500 19px var(--osx-font); cursor: pointer; }.popover button:focus-visible { outline: 3px solid var(--osx-focus); }
</style>
