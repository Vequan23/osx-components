<script setup lang="ts">
import { computed, useHost, useId } from "vue";
import { emitElementEvent, updateElementState } from "../element-events";
type SelectOption = { value: string; label: string; disabled?: boolean };
const props = withDefaults(defineProps<{
  options?: string | SelectOption[];
  value?: string;
  label?: string;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  hint?: string;
  error?: string;
}>(), { options: "", value: "", label: "", name: "", disabled: false, required: false, invalid: false, hint: "", error: "" });
const host = useHost();
const descriptionId = `osx-select-${useId()}`;
const hasError = computed(() => props.invalid || Boolean(props.error));
const description = computed(() => props.error || props.hint);
const choices = computed<SelectOption[]>(() => {
  if (Array.isArray(props.options)) return props.options;
  return props.options.split(",").map((item) => item.trim()).filter(Boolean).map((item) => ({ value: item, label: item }));
});
function change(event: Event) { event.stopPropagation(); const value = (event.target as HTMLSelectElement).value; updateElementState(host, "value", value); emitElementEvent(host, "change", [value]); }
</script>

<template>
  <label :class="{ invalid: hasError, disabled }"><span v-if="label" class="label">{{ label }}<b v-if="required" aria-hidden="true">Required</b></span><span class="select-shell"><select :value="value" :name="name || undefined" :disabled="disabled" :required="required" :aria-invalid="hasError ? 'true' : undefined" :aria-describedby="description ? descriptionId : undefined" @input.stop @change="change"><option v-for="option in choices" :key="option.value" :value="option.value" :disabled="option.disabled">{{ option.label }}</option></select><i aria-hidden="true"></i></span><small v-if="description" :id="descriptionId" :class="{ error: hasError }">{{ description }}</small></label>
</template>

<style>
:host { display: inline-block; min-width: 150px; color: var(--osx-text); font-family: var(--osx-font); }
label { display: grid; gap: 5px; font-size: 12px; font-weight: 700; }.label { display: flex; gap: 8px; align-items: baseline; justify-content: space-between; }.label b { color: var(--osx-muted); font-size: 12px; font-weight: 500; }.select-shell { display: grid; position: relative; }
select { width: 100%; min-height: 30px; appearance: none; padding: 5px 32px 5px 10px; border: 1px solid var(--osx-border); border-radius: 7px; color: var(--osx-text); background: linear-gradient(var(--osx-surface-raised), var(--osx-surface-sunken)); box-shadow: 0 1px var(--osx-highlight) inset, 0 1px 2px rgba(0,0,0,.15); font: 600 12px var(--osx-font); cursor: pointer; }
select:focus-visible { outline: 3px solid var(--osx-focus); outline-offset: 2px; }.select-shell i { width: 20px; position: absolute; inset: 1px 1px 1px auto; border-left: 1px solid var(--osx-border-soft); border-radius: 0 6px 6px 0; pointer-events: none; }
.select-shell i::before,.select-shell i::after { position: absolute; left: 6px; border: 4px solid transparent; content: ""; }.select-shell i::before { top: 5px; border-bottom-color: var(--osx-muted); }.select-shell i::after { bottom: 5px; border-top-color: var(--osx-muted); }.invalid select { border-color: var(--osx-danger); }.invalid select:focus-visible { outline-color: color-mix(in srgb,var(--osx-danger) 30%,transparent); }.disabled { opacity: .55; cursor: not-allowed; }select:disabled { cursor: not-allowed; }small { color: var(--osx-muted); font-size: 12px; font-weight: 400; line-height: 1.35; }.error { color: color-mix(in srgb,var(--osx-danger) 80%,var(--osx-text)); }
</style>
