<script setup lang="ts">
import { ref, watch } from "vue";
const props = withDefaults(defineProps<{ open?: boolean; label?: string; placement?: "start" | "end" }>(), { open: false, label: "Actions", placement: "start" });
const emit = defineEmits<{ close: [] }>(); const visible = ref(props.open); watch(() => props.open, (value) => { visible.value = value; });
function close() { visible.value = false; emit("close"); }
function move(event: KeyboardEvent) { if (!["ArrowDown","ArrowUp"].includes(event.key)) return; event.preventDefault(); const items = [...(event.currentTarget as HTMLElement).querySelectorAll<HTMLElement>("osx-menu-item")]; const active = items.findIndex((item) => item.matches(":focus-within")); const next = event.key === "ArrowDown" ? (active + 1) % items.length : (active - 1 + items.length) % items.length; items[next]?.shadowRoot?.querySelector<HTMLButtonElement>("button")?.focus(); }
</script>
<template><div v-if="visible" :class="['menu',placement]" role="menu" :aria-label="label" @keydown="move" @keydown.esc="close"><slot></slot></div></template>
<style>
:host { display: block; color: var(--osx-text); font-family: var(--osx-font); }.menu { min-width: 210px; padding: 5px; border: 1px solid var(--osx-border); border-radius: 8px; background: var(--osx-surface-raised); box-shadow: var(--osx-shadow); }.menu ::slotted(hr) { margin: 5px 4px; border: 0; border-top: 1px solid var(--osx-border-soft); }
</style>
