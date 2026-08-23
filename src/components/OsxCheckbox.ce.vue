<script setup lang="ts">
import { ref, watch } from "vue";
const props = withDefaults(defineProps<{ checked?: boolean; label?: string; disabled?: boolean; indeterminate?: boolean }>(), { checked: false, label: "", disabled: false, indeterminate: false });
const emit = defineEmits<{ change: [checked: boolean] }>();
const current = ref(props.checked);
watch(() => props.checked, (checked) => { current.value = checked; });
function update(event: Event) { current.value = (event.target as HTMLInputElement).checked; emit("change", current.value); }
</script>

<template>
  <label :class="{ disabled }">
    <input type="checkbox" :checked="current" :disabled="disabled" :aria-checked="indeterminate ? 'mixed' : current" @change="update" />
    <span class="box" aria-hidden="true"><i v-if="indeterminate"></i><b v-else-if="current">✓</b></span>
    <span class="copy"><slot>{{ label }}</slot></span>
  </label>
</template>

<style>
:host { display: inline-block; color: var(--osx-text); font-family: var(--osx-font); }
label { display: inline-flex; gap: 7px; align-items: center; font-size: 13px; cursor: pointer; }
input { width: 1px; height: 1px; position: absolute; opacity: 0; }
.box { width: 15px; height: 15px; display: grid; place-items: center; border: 1px solid var(--osx-border); border-radius: 4px; color: white; background: linear-gradient(var(--osx-surface-raised), var(--osx-surface-sunken)); box-shadow: 0 1px var(--osx-highlight) inset, 0 1px 2px rgba(0,0,0,.14); }
input:checked + .box, input[aria-checked="mixed"] + .box { border-color: color-mix(in srgb, var(--osx-accent) 80%, #123); background: linear-gradient(var(--osx-accent-light), var(--osx-accent)); text-shadow: 0 -1px rgba(0,0,0,.4); }
input:focus-visible + .box { outline: 3px solid var(--osx-focus); outline-offset: 2px; }
.box b { font-size: 12px; line-height: 1; }.box i { width: 7px; height: 2px; border-radius: 1px; background: white; }
.disabled { opacity: .55; cursor: not-allowed; }
</style>
