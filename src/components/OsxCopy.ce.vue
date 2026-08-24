<script setup lang="ts">
const props = withDefaults(defineProps<{
  as?: "p" | "span" | "div";
  size?: "small" | "medium" | "large";
  tone?: "default" | "muted" | "accent";
  weight?: "regular" | "medium" | "bold";
  measure?: "none" | "narrow" | "default" | "wide";
  align?: "left" | "center" | "right";
}>(), { as: "p", size: "medium", tone: "default", weight: "regular", measure: "default", align: "left" });
</script>

<template>
  <component :is="props.as" :class="[`size-${size}`, `tone-${tone}`, `weight-${weight}`, `measure-${measure}`, `align-${align}`]"><slot></slot></component>
</template>

<style>
:host { display: block; color: var(--osx-text); font-family: var(--osx-font); }
:host([as="span"]) { display: inline; }
p,span,div { margin: 0; color: inherit; overflow-wrap: anywhere; }
.size-small { font-size: 12px; line-height: 1.45; }.size-medium { font-size: 14px; line-height: 1.55; }.size-large { font-size: 18px; line-height: 1.55; }
.tone-muted { color: var(--osx-muted); }.tone-accent { color: var(--osx-accent); }
.weight-regular { font-weight: 400; }.weight-medium { font-weight: 600; }.weight-bold { font-weight: 800; }
.measure-narrow { max-width: 42ch; }.measure-default { max-width: 65ch; }.measure-wide { max-width: 82ch; }.measure-none { max-width: none; }
.align-center { margin-inline: auto; text-align: center; }.align-right { margin-left: auto; text-align: right; }
</style>
