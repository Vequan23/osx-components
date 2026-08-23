<script setup lang="ts">
import { ref, watch } from "vue";
const props = withDefaults(defineProps<{ value?: string; label?: string; placeholder?: string; type?: "text" | "email" | "password" | "search"; disabled?: boolean; hint?: string }>(), { value: "", type: "text", disabled: false });
const emit = defineEmits<{ input: [value: string]; change: [value: string] }>();
const localValue = ref(props.value);
watch(() => props.value, (value) => { localValue.value = value; });
function update(event: Event) { localValue.value = (event.target as HTMLInputElement).value; emit("input", localValue.value); }
</script>

<template>
  <label>
    <span v-if="label" class="label">{{ label }}</span>
    <span class="field"><span v-if="type === 'search'" class="search" aria-hidden="true"></span><input :type="type" :value="localValue" :placeholder="placeholder" :disabled="disabled" @input="update" @change="emit('change', localValue)" /></span>
    <small v-if="hint">{{ hint }}</small>
  </label>
</template>

<style>
:host { display: inline-block; min-width: 190px; color: var(--osx-text); font-family: var(--osx-font); }
label { display: grid; gap: 5px; }
.label { font-size: 12px; font-weight: 700; }
.field { min-height: 29px; display: flex; align-items: center; border: 1px solid var(--osx-border); border-radius: 7px; background: var(--osx-surface-raised); box-shadow: 0 1px 3px rgba(25, 43, 54, .18) inset, 0 1px var(--osx-highlight); }
.field:focus-within { border-color: var(--osx-accent); outline: 3px solid var(--osx-focus); }
input { width: 100%; min-width: 0; padding: 6px 9px; border: 0; outline: 0; color: var(--osx-text); background: transparent; font: 13px/1.25 var(--osx-font); }
input::placeholder, small { color: var(--osx-muted); }
input:disabled { opacity: .55; cursor: not-allowed; }
.search { width: 9px; height: 9px; flex: 0 0 9px; margin-left: 9px; border: 2px solid var(--osx-muted); border-radius: 50%; position: relative; }
.search::after { width: 5px; height: 2px; position: absolute; right: -4px; bottom: -2px; background: var(--osx-muted); content: ""; transform: rotate(45deg); }
small { font-size: 12px; }
</style>
