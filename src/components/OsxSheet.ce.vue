<script setup lang="ts">
import { nextTick, ref, watch } from "vue";
import IconGlyph from "./IconGlyph.vue";
import { useHostTitle } from "../native-host-attributes";
const props = withDefaults(defineProps<{ open?: boolean; description?: string; dismissible?: boolean }>(), { open: false, description: "", dismissible: true });
const title = useHostTitle("Confirm");
const emit = defineEmits<{ close: []; confirm: [] }>();
const dialog = ref<HTMLElement | null>(null);
watch(() => props.open, async (open) => { if (open) { await nextTick(); dialog.value?.focus(); } });
</script>

<template>
  <div v-if="open" class="backdrop" @click.self="dismissible && emit('close')"><section ref="dialog" role="dialog" aria-modal="true" :aria-label="title" tabindex="-1" @keydown.esc="dismissible && emit('close')"><header><span><IconGlyph name="warning" :size="19" /></span><div><h2>{{ title }}</h2><p v-if="description">{{ description }}</p></div></header><div class="content"><slot></slot></div><footer><slot name="actions"><button class="cancel" type="button" @click="emit('close')">Cancel</button><button class="confirm" type="button" @click="emit('confirm')">Continue</button></slot></footer></section></div>
</template>

<style>
:host { font-family: var(--osx-font); }
.backdrop { position: fixed; inset: 0; z-index: 1000; display: grid; place-items: start center; padding-top: min(18vh, 150px); background: rgba(8, 16, 21, .34); backdrop-filter: blur(2px); }
section { width: min(480px, calc(100vw - 32px)); overflow: hidden; border: 1px solid var(--osx-border); border-radius: 0 0 9px 9px; outline: 0; color: var(--osx-text); background: var(--osx-surface-raised); box-shadow: var(--osx-shadow); animation: enter .16s ease-out; }
header { display: grid; grid-template-columns: 38px 1fr; gap: 12px; align-items: start; padding: 20px 22px 10px; }header > span { width: 34px; height: 34px; display: grid; place-items: center; border: 1px solid #b37b24; border-radius: 50%; color: white; background: linear-gradient(#ffd56a,#d89222); font: 800 20px Georgia,serif; text-shadow: 0 -1px rgba(0,0,0,.4); }
h2 { margin: 0; font: 500 22px Georgia,serif; }p { margin: 6px 0 0; color: var(--osx-muted); font-size: 13px; line-height: 1.45; }.content { padding: 8px 22px 18px; font-size: 13px; }.content:empty { display: none; }
footer { display: flex; justify-content: flex-end; gap: 8px; padding: 10px 14px; border-top: 1px solid var(--osx-border-soft); background: var(--osx-surface-sunken); }button { min-height: 29px; padding: 5px 14px; border: 1px solid var(--osx-border); border-radius: 7px; color: var(--osx-text); background: linear-gradient(var(--osx-surface-raised),var(--osx-surface-sunken)); font: 600 12px var(--osx-font); cursor: pointer; }.confirm { color: white; border-color: color-mix(in srgb, var(--osx-accent) 80%, #123); background: linear-gradient(var(--osx-accent-light),var(--osx-accent)); text-shadow: 0 -1px rgba(0,0,0,.4); }button:focus-visible { outline: 3px solid var(--osx-focus); outline-offset: 2px; }
@keyframes enter { from { opacity: 0; transform: translateY(-18px); } }@media (prefers-reduced-motion: reduce) { section { animation: none; } }
</style>
