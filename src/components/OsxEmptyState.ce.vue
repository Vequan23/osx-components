<script setup lang="ts">
import IconGlyph from "./IconGlyph.vue";
import type { OsxIconName } from "../icons";
withDefaults(defineProps<{ title?: string; description?: string; actionLabel?: string; icon?: OsxIconName }>(), { title: "Nothing here yet", description: "", actionLabel: "", icon: "inbox" });
const emit = defineEmits<{ action: [] }>();
</script>
<template><section :aria-label="title"><div class="icon"><slot name="icon"><IconGlyph :name="icon" :size="28" /></slot></div><h2>{{ title }}</h2><p v-if="description">{{ description }}</p><div class="content"><slot></slot></div><div class="actions"><slot name="actions"><button v-if="actionLabel" type="button" @click="emit('action')">{{ actionLabel }}</button></slot></div></section></template>
<style>
:host { display: block; color: var(--osx-text); font-family: var(--osx-font); }section { display: grid; justify-items: center; padding: 34px 22px; text-align: center; }.icon { width: 52px; height: 52px; display: grid; place-items: center; margin-bottom: 12px; border: 1px solid var(--osx-border); border-radius: 13px; color: var(--osx-accent-ink); background: var(--osx-surface-raised); font: 500 28px Georgia,serif; box-shadow: 0 2px 7px rgba(0,0,0,.1); }h2 { margin: 0; font: 500 22px Georgia,serif; }p,.content { max-width: 440px; margin: 7px 0 0; color: var(--osx-muted); font-size: 13px; line-height: 1.5; }.content:empty,.actions:empty { display: none; }.actions { margin-top: 16px; }button { min-height: 32px; padding: 5px 14px; border: 1px solid color-mix(in srgb,var(--osx-accent) 75%,#123); border-radius: 7px; color: white; background: linear-gradient(var(--osx-accent-light),var(--osx-accent)); font: 700 12px var(--osx-font); cursor: pointer; }button:focus-visible { outline: 3px solid var(--osx-focus); outline-offset: 2px; }
</style>
