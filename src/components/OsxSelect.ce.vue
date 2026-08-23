<script setup lang="ts">
import { computed } from "vue";
const props = withDefaults(defineProps<{ options?: string; value?: string; label?: string; disabled?: boolean }>(), { options: "", value: "", label: "", disabled: false });
const emit = defineEmits<{ change: [value: string] }>();
const choices = computed(() => props.options.split(",").map((item) => item.trim()).filter(Boolean));
</script>

<template>
  <label><span v-if="label">{{ label }}</span><span class="select-shell"><select :value="value" :disabled="disabled" @change="emit('change', ($event.target as HTMLSelectElement).value)"><option v-for="option in choices" :key="option" :value="option">{{ option }}</option></select><i aria-hidden="true"></i></span></label>
</template>

<style>
:host { display: inline-block; min-width: 150px; color: var(--osx-text); font-family: var(--osx-font); }
label { display: grid; gap: 5px; font-size: 12px; font-weight: 700; }.select-shell { display: grid; position: relative; }
select { width: 100%; min-height: 30px; appearance: none; padding: 5px 32px 5px 10px; border: 1px solid var(--osx-border); border-radius: 7px; color: var(--osx-text); background: linear-gradient(var(--osx-surface-raised), var(--osx-surface-sunken)); box-shadow: 0 1px var(--osx-highlight) inset, 0 1px 2px rgba(0,0,0,.15); font: 600 12px var(--osx-font); cursor: pointer; }
select:focus-visible { outline: 3px solid var(--osx-focus); outline-offset: 2px; }.select-shell i { width: 20px; position: absolute; inset: 1px 1px 1px auto; border-left: 1px solid var(--osx-border-soft); border-radius: 0 6px 6px 0; pointer-events: none; }
.select-shell i::before,.select-shell i::after { position: absolute; left: 6px; border: 4px solid transparent; content: ""; }.select-shell i::before { top: 5px; border-bottom-color: var(--osx-muted); }.select-shell i::after { bottom: 5px; border-top-color: var(--osx-muted); } select:disabled { opacity: .55; cursor: not-allowed; }
</style>
