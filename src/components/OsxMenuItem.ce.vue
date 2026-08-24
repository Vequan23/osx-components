<script setup lang="ts">
import { computed } from "vue";
import IconGlyph from "./IconGlyph.vue";
const props = withDefaults(defineProps<{ label?: string; shortcut?: string; disabled?: boolean; checked?: boolean; type?: "action" | "checkbox" }>(), { label: "Menu item", shortcut: "", disabled: false, checked: false, type: "action" });
const emit = defineEmits<{ select: []; change: [checked: boolean] }>();
const itemRole = computed(() => props.type === "checkbox" ? "menuitemcheckbox" : "menuitem");
function select() { if (props.disabled) return; emit("select"); if (props.type === "checkbox") emit("change", !props.checked); }
</script>
<template><button type="button" :role="itemRole" :aria-checked="type === 'checkbox' ? checked : undefined" :disabled="disabled" @click="select"><span class="check"><IconGlyph v-if="type === 'checkbox' && checked" name="check" :size="14" /></span><span><slot>{{ label }}</slot></span><kbd v-if="shortcut">{{ shortcut }}</kbd></button></template>
<style>
:host { display: block; color: var(--osx-text); font-family: var(--osx-font); }button { width: 100%; min-height: 30px; display: grid; grid-template-columns: 16px minmax(0,1fr) auto; gap: 7px; align-items: center; padding: 4px 10px; border: 0; border-radius: 5px; color: var(--osx-text); background: transparent; font: 13px var(--osx-font); text-align: left; cursor: pointer; }button:hover,button:focus-visible { outline: 0; color: white; background: var(--osx-accent); }.check { font-weight: 900; text-align: center; }kbd { color: var(--osx-muted); font: 12px var(--osx-font); }button:hover kbd,button:focus-visible kbd { color: white; }button:disabled { opacity: .5; cursor: not-allowed; }
</style>
