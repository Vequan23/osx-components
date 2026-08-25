<script setup lang="ts">
import type { OsxIconName } from "../icons";
import IconGlyph from "./IconGlyph.vue";

withDefaults(defineProps<{
  variant?: "default" | "primary" | "danger";
  size?: "small" | "medium";
  disabled?: boolean;
  loading?: boolean;
  icon?: OsxIconName;
  iconPosition?: "leading" | "trailing";
}>(), { variant: "default", size: "medium", disabled: false, loading: false, icon: undefined, iconPosition: "leading" });
</script>

<template>
  <button :class="[variant, size]" :disabled="disabled || loading" :aria-busy="loading || undefined">
    <span v-if="loading" class="spinner" aria-hidden="true"></span>
    <IconGlyph v-else-if="icon && iconPosition === 'leading'" :name="icon" :size="size === 'small' ? 13 : 15" />
    <span class="label"><slot></slot></span>
    <IconGlyph v-if="icon && iconPosition === 'trailing' && !loading" :name="icon" :size="size === 'small' ? 13 : 15" />
  </button>
</template>

<style>
:host { display: inline-block; font-family: var(--osx-font); }
button { min-height: 30px; display: inline-flex; gap: 7px; align-items: center; justify-content: center; padding: 5px 15px; border: 1px solid var(--osx-border); border-radius: 7px; color: var(--osx-text); background: linear-gradient(var(--osx-surface-raised), var(--osx-surface-sunken)); box-shadow: 0 1px var(--osx-highlight) inset, 0 1px 2px rgba(22, 38, 48, .18); font: 600 13px/1.2 var(--osx-font); text-shadow: 0 1px var(--osx-highlight); cursor: pointer; }
button:hover:not(:disabled) { filter: brightness(1.04); }
button:active:not(:disabled) { background: linear-gradient(var(--osx-surface-sunken), var(--osx-surface-raised)); box-shadow: 0 1px 2px rgba(22, 38, 48, .18) inset; }
button:focus-visible { outline: 3px solid var(--osx-focus); outline-offset: 2px; }
button.primary { color: white; border-color: color-mix(in srgb, var(--osx-accent) 78%, #123); background: linear-gradient(var(--osx-accent-light), var(--osx-accent) 52%, color-mix(in srgb, var(--osx-accent) 78%, #123)); text-shadow: 0 -1px rgba(0, 0, 0, .45); }
button.danger { color: white; border-color: #9c3632; background: linear-gradient(#ef8179, #c74d47 55%, #a73a36); text-shadow: 0 -1px rgba(0, 0, 0, .42); }
button.small { min-height: 24px; padding: 3px 10px; font-size: 12px; }
button:disabled { opacity: .54; cursor: not-allowed; }
.spinner { width: 10px; height: 10px; display: inline-block; border: 2px solid currentColor; border-right-color: transparent; border-radius: 50%; animation: spin .7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .spinner { animation: none; } }
</style>
