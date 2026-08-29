<script setup lang="ts">
import { computed, ref, useHost, useId, watch } from "vue";
import { emitElementEvent, updateElementState } from "../element-events";

const props = withDefaults(defineProps<{
  value?: string;
  label?: string;
  placeholder?: string;
  name?: string;
  rows?: number;
  maxlength?: number;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  invalid?: boolean;
  hint?: string;
  error?: string;
  resize?: "none" | "vertical" | "horizontal" | "both";
}>(), {
  value: "",
  label: "",
  placeholder: "",
  name: "",
  rows: 4,
  maxlength: undefined,
  disabled: false,
  readonly: false,
  required: false,
  invalid: false,
  hint: "",
  error: "",
  resize: "vertical",
});

const host = useHost();
const localValue = ref(props.value);
const descriptionId = `osx-textarea-${useId()}`;
const hasError = computed(() => props.invalid || Boolean(props.error));
const description = computed(() => props.error || props.hint);

watch(() => props.value, (value) => { localValue.value = value; });
function update(event: Event) {
  event.stopPropagation();
  localValue.value = (event.target as HTMLTextAreaElement).value;
  updateElementState(host, "value", localValue.value);
  emitElementEvent(host, "input", [localValue.value]);
}
function commit(event: Event) { event.stopPropagation(); emitElementEvent(host, "change", [localValue.value]); }
</script>

<template>
  <label :class="{ invalid: hasError, disabled }">
    <span v-if="label" class="label">{{ label }}<b v-if="required" aria-hidden="true">Required</b></span>
    <textarea
      :value="localValue"
      :placeholder="placeholder"
      :name="name || undefined"
      :rows="rows"
      :maxlength="maxlength"
      :disabled="disabled"
      :readonly="readonly"
      :required="required"
      :aria-invalid="hasError ? 'true' : undefined"
      :aria-describedby="description ? descriptionId : undefined"
      :style="{ resize }"
      @input="update"
      @change="commit"
    ></textarea>
    <small v-if="description" :id="descriptionId" :class="{ error: hasError }">{{ description }}</small>
  </label>
</template>

<style>
:host { display: inline-block; min-width: 220px; color: var(--osx-text); font-family: var(--osx-font); }
label { display: grid; gap: 5px; }.label { display: flex; gap: 8px; align-items: baseline; justify-content: space-between; font-size: 12px; font-weight: 700; }.label b { color: var(--osx-muted); font-size: 12px; font-weight: 500; }
textarea { box-sizing: border-box; width: 100%; max-width: 100%; min-width: 0; min-height: 74px; padding: 8px 10px; border: 1px solid var(--osx-border); border-radius: 7px; outline: 0; color: var(--osx-text); background: var(--osx-surface-raised); box-shadow: 0 1px 3px rgba(25,43,54,.18) inset,0 1px var(--osx-highlight); font: 13px/1.45 var(--osx-font); }
textarea:focus-visible { border-color: var(--osx-accent); outline: 3px solid var(--osx-focus); outline-offset: 1px; }.invalid textarea { border-color: var(--osx-danger); }.invalid textarea:focus-visible { outline-color: color-mix(in srgb,var(--osx-danger) 30%,transparent); }
textarea::placeholder,small { color: var(--osx-muted); }small { font-size: 12px; line-height: 1.35; }.error { color: color-mix(in srgb,var(--osx-danger) 80%,var(--osx-text)); }.disabled { opacity: .55; cursor: not-allowed; }textarea:disabled { cursor: not-allowed; }textarea:read-only:not(:disabled) { background: var(--osx-surface-sunken); }
</style>
