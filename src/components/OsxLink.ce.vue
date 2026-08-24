<script setup lang="ts">
import { computed } from "vue";
import IconGlyph from "./IconGlyph.vue";

const props = withDefaults(defineProps<{
  href?: string;
  target?: "_self" | "_blank" | "_parent" | "_top";
  rel?: string;
  external?: boolean;
  download?: boolean | string;
  underline?: "always" | "hover" | "none";
  disabled?: boolean;
}>(), { href: "", target: "_self", rel: "", external: false, download: false, underline: "hover", disabled: false });

const safeRel = computed(() => props.rel || (props.target === "_blank" ? "noreferrer noopener" : undefined));
function blockDisabled(event: MouseEvent) { if (props.disabled) event.preventDefault(); }
</script>

<template>
  <a :href="disabled ? undefined : href" :target="target" :rel="safeRel" :download="download || undefined" :role="disabled ? 'link' : undefined" :aria-disabled="disabled || undefined" :tabindex="disabled ? -1 : undefined" :class="[`underline-${underline}`, { disabled }]" @click="blockDisabled">
    <slot></slot><IconGlyph v-if="external" class="external" name="external" :size="13" />
  </a>
</template>

<style>
:host { display: inline; color: var(--osx-accent); font-family: var(--osx-font); }
a { color: inherit; font-size: inherit; font-weight: 650; line-height: inherit; text-decoration-thickness: 1px; text-underline-offset: .16em; border-radius: 2px; cursor: pointer; }
.underline-hover { text-decoration-color: transparent; }.underline-hover:hover { text-decoration-color: currentColor; }.underline-none { text-decoration: none; }
a:focus-visible { outline: 3px solid var(--osx-focus); outline-offset: 3px; }
.external { display: inline-block; margin-left: .18em; font-size: .82em; text-decoration: none; }
.disabled { color: var(--osx-muted); opacity: .72; cursor: not-allowed; text-decoration: none; }
</style>
