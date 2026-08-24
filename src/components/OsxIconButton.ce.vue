<script setup lang="ts">
import IconGlyph from "./IconGlyph.vue";
import type { OsxIconName } from "../icons";

withDefaults(defineProps<{ icon?: OsxIconName; label: string; size?: "small" | "medium" | "large"; variant?: "default" | "primary" | "danger"; disabled?: boolean; pressed?: boolean }>(), {
  icon: "info", size: "medium", variant: "default", disabled: false, pressed: false,
});
</script>

<template><button type="button" :class="[size,variant]" :aria-label="label" :aria-pressed="pressed || undefined" :disabled="disabled"><IconGlyph :name="icon" :size="size === 'small' ? 16 : size === 'large' ? 22 : 18" /></button></template>

<style>
:host { display: inline-flex; color: var(--osx-text); font-family: var(--osx-font); }
button { width: 36px; height: 36px; display: grid; place-items: center; padding: 0; border: 1px solid var(--osx-border); border-radius: 8px; color: var(--osx-text); background: linear-gradient(var(--osx-surface-raised),var(--osx-surface-sunken)); box-shadow: inset 0 1px rgba(255,255,255,.38),0 1px 2px rgba(0,0,0,.08); cursor: pointer; }
button.small { width: 32px; height: 32px; border-radius: 7px; }button.large { width: 44px; height: 44px; border-radius: 10px; }
button:hover:not(:disabled) { border-color: color-mix(in srgb,var(--osx-accent) 50%,var(--osx-border)); background: color-mix(in srgb,var(--osx-accent) 9%,var(--osx-surface-raised)); }
button.primary,button[aria-pressed="true"] { border-color: color-mix(in srgb,var(--osx-accent) 72%,#123); color: white; background: linear-gradient(var(--osx-accent-light),var(--osx-accent)); text-shadow: 0 -1px rgba(0,0,0,.3); }
button.danger { color: var(--osx-danger); }button:disabled { opacity: .5; cursor: not-allowed; }
button:focus-visible { outline: 3px solid var(--osx-focus); outline-offset: 2px; }
</style>
