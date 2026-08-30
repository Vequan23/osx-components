<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(defineProps<{
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  variant?: "display" | "title" | "section" | "label";
  align?: "left" | "center" | "right";
  tone?: "default" | "muted" | "accent";
}>(), { level: 2, variant: "title", align: "left", tone: "default" });

const tag = computed(() => `h${Math.min(6, Math.max(1, Number(props.level) || 2))}`);
</script>

<template>
  <component :is="tag" :class="[variant, `align-${align}`, `tone-${tone}`]"><slot></slot></component>
</template>

<style>
:host { display: block; color: var(--osx-text); font-family: var(--osx-font); }
h1,h2,h3,h4,h5,h6 { margin: 0; color: inherit; text-wrap: balance; }
.display { font: 500 clamp(34px,6vw,64px)/1.02 Georgia,"Times New Roman",serif; letter-spacing: -.035em; }
.title { font: 500 clamp(25px,3.4vw,38px)/1.12 Georgia,"Times New Roman",serif; letter-spacing: -.02em; }
.section { font: 600 20px/1.2 Georgia,"Times New Roman",serif; }
.label { font: 800 12px/1.25 var(--osx-font); letter-spacing: .13em; text-transform: uppercase; }
.align-center { text-align: center; }.align-right { text-align: right; }
.tone-muted { color: var(--osx-muted); }.tone-accent { color: var(--osx-accent-ink); }
</style>
