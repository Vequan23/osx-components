<script setup lang="ts">
import IconGlyph from "./IconGlyph.vue";
const props = withDefaults(defineProps<{
  index?: string | number;
  label?: string;
  title?: string;
  sourceId?: string;
  href?: string;
  selected?: boolean;
  disabled?: boolean;
}>(), { index: "1", label: "Source", title: "", sourceId: "", href: "", selected: false, disabled: false });
const emit = defineEmits<{ activate: [sourceId: string] }>();
function activate(event: Event) { if (props.disabled) { event.preventDefault(); return; } emit("activate", props.sourceId || String(props.index)); }
</script>

<template>
  <a v-if="href" :href="disabled ? undefined : href" :target="href.startsWith('http') ? '_blank' : undefined" :rel="href.startsWith('http') ? 'noreferrer noopener' : undefined" :aria-label="title ? `${label} ${index}: ${title}` : `${label} ${index}`" :aria-disabled="disabled || undefined" :class="{ selected, disabled }" @click="activate"><span>{{ index }}</span><IconGlyph name="external" :size="12" /></a>
  <button v-else type="button" :disabled="disabled" :aria-label="title ? `${label} ${index}: ${title}` : `${label} ${index}`" :aria-pressed="selected" :class="{ selected }" @click="activate"><span>{{ index }}</span></button>
</template>

<style>
:host { display: inline-flex; vertical-align: .1em; color: var(--osx-text); font-family: var(--osx-font); }
a,button { min-width: 24px; min-height: 22px; display: inline-flex; gap: 3px; align-items: center; justify-content: center; padding: 1px 6px; border: 1px solid color-mix(in srgb,var(--osx-accent) 55%,var(--osx-border)); border-radius: 999px; color: var(--osx-accent); background: color-mix(in srgb,var(--osx-accent) 9%,var(--osx-surface-raised)); font: 800 12px/1 var(--osx-font); text-decoration: none; cursor: pointer; }a:hover,button:hover,.selected { color: white; background: var(--osx-accent); }a:focus-visible,button:focus-visible { outline: 3px solid var(--osx-focus); outline-offset: 1px; }.disabled,button:disabled { opacity: .48; cursor: not-allowed; }
</style>
