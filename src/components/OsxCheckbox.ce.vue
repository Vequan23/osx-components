<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from "vue";
import IconGlyph from "./IconGlyph.vue";
const props = withDefaults(defineProps<{ checked?: boolean; label?: string; disabled?: boolean; indeterminate?: boolean }>(), { checked: false, label: "", disabled: false, indeterminate: false });
const emit = defineEmits<{ change: [checked: boolean] }>();
const current = ref(props.checked);
const input = ref<HTMLInputElement | null>(null);
watch(() => props.checked, (checked) => { current.value = checked; });
async function syncIndeterminate() { await nextTick(); if (input.value) input.value.indeterminate = props.indeterminate; }
watch(() => props.indeterminate, syncIndeterminate);
onMounted(syncIndeterminate);
function update(event: Event) { event.stopPropagation(); current.value = (event.target as HTMLInputElement).checked; emit("change", current.value); }
</script>

<template>
  <label :class="{ disabled, indeterminate }">
    <input ref="input" type="checkbox" :checked="current" :disabled="disabled" @change="update" />
    <span class="box" aria-hidden="true"><IconGlyph v-if="indeterminate" name="minus" :size="11" :stroke-width="2.5" /><IconGlyph v-else-if="current" name="check" :size="11" :stroke-width="2.5" /></span>
    <span class="copy"><slot>{{ label }}</slot></span>
  </label>
</template>

<style>
:host { display: inline-block; color: var(--osx-text); font-family: var(--osx-font); }
label { display: inline-flex; gap: 7px; align-items: center; font-size: 13px; cursor: pointer; }
input { width: 1px; height: 1px; position: absolute; opacity: 0; }
.box { width: 15px; height: 15px; display: grid; place-items: center; border: 1px solid var(--osx-border); border-radius: 4px; color: white; background: linear-gradient(var(--osx-surface-raised), var(--osx-surface-sunken)); box-shadow: 0 1px var(--osx-highlight) inset, 0 1px 2px rgba(0,0,0,.14); }
input:checked + .box, .indeterminate .box { border-color: color-mix(in srgb, var(--osx-accent) 80%, #123); background: linear-gradient(var(--osx-accent-light), var(--osx-accent)); text-shadow: 0 -1px rgba(0,0,0,.4); }
input:focus-visible + .box { outline: 3px solid var(--osx-focus); outline-offset: 2px; }
.box b { font-size: 12px; line-height: 1; }.box i { width: 7px; height: 2px; border-radius: 1px; background: white; }
.disabled { opacity: .55; cursor: not-allowed; }
</style>
