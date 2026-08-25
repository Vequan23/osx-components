<script setup lang="ts">
import { ref, useId, watch } from "vue";

const props = withDefaults(defineProps<{ checked?: boolean; label?: string; description?: string; disabled?: boolean }>(), { checked: false, label: "", description: "", disabled: false });
const emit = defineEmits<{ change: [checked: boolean] }>();
const current = ref(props.checked);
const descriptionId = `osx-toggle-${useId()}`;
watch(() => props.checked, (checked) => { current.value = checked; });
function update(event: Event) { current.value = (event.target as HTMLInputElement).checked; emit("change", current.value); }
</script>

<template>
  <label :class="{ disabled }">
    <span class="copy"><span class="title"><slot>{{ label }}</slot></span><span v-if="description" :id="descriptionId" class="description">{{ description }}</span></span>
    <span class="control"><input type="checkbox" role="switch" :checked="current" :disabled="disabled" :aria-describedby="description ? descriptionId : undefined" @change="update" /><span class="track" aria-hidden="true"><span class="thumb"></span></span></span>
  </label>
</template>

<style>
:host { display: block; color: var(--osx-text); font-family: var(--osx-font); }
label { display: flex; gap: 14px; align-items: center; justify-content: space-between; cursor: pointer; }.copy { min-width: 0; display: grid; gap: 2px; }.title { font: 600 13px/1.3 var(--osx-font); }.description { color: var(--osx-muted); font: 400 12px/1.35 var(--osx-font); }
.control { flex: 0 0 auto; position: relative; }.control input { width: 1px; height: 1px; position: absolute; opacity: 0; }.track { width: 38px; height: 21px; display: block; position: relative; border: 1px solid var(--osx-border); border-radius: 999px; background: linear-gradient(var(--osx-surface-sunken), var(--osx-surface-raised)); box-shadow: 0 1px 2px rgba(0,0,0,.18) inset; transition: background .16s ease; }.thumb { width: 17px; height: 17px; position: absolute; top: 1px; left: 1px; border: 1px solid var(--osx-border); border-radius: 50%; background: linear-gradient(#fff, var(--osx-surface-raised)); box-shadow: 0 1px 2px rgba(0,0,0,.2); transition: transform .16s ease; }
input:checked + .track { border-color: color-mix(in srgb, var(--osx-accent) 78%, #123); background: linear-gradient(var(--osx-accent-light), var(--osx-accent)); }.control input:checked + .track .thumb { transform: translateX(17px); }.control input:focus-visible + .track { outline: 3px solid var(--osx-focus); outline-offset: 2px; }.disabled { opacity: .55; cursor: not-allowed; }
@media (prefers-reduced-motion: reduce) { .track, .thumb { transition: none; } }
</style>
