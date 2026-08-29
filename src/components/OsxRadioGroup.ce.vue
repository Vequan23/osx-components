<script setup lang="ts">
import { computed, ref, useHost, useId, watch } from "vue";
import { emitElementEvent, updateElementState } from "../element-events";

type RadioOption = { value: string; label: string; description?: string; disabled?: boolean };
const props = withDefaults(defineProps<{
  options?: string | RadioOption[];
  value?: string;
  label?: string;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  hint?: string;
  error?: string;
  orientation?: "horizontal" | "vertical";
  variant?: "default" | "cards";
}>(), {
  options: "",
  value: "",
  label: "Options",
  name: "",
  disabled: false,
  required: false,
  invalid: false,
  hint: "",
  error: "",
  orientation: "vertical",
  variant: "default",
});

const host = useHost();
const current = ref(props.value);
const groupId = `osx-radio-${useId()}`;
const descriptionId = `${groupId}-description`;
const hasError = computed(() => props.invalid || Boolean(props.error));
const description = computed(() => props.error || props.hint);
const choices = computed<RadioOption[]>(() => {
  if (Array.isArray(props.options)) return props.options;
  return props.options.split(",").map((item) => item.trim()).filter(Boolean).map((item) => ({ value: item, label: item }));
});

watch(() => props.value, (value) => { current.value = value; });
function select(option: RadioOption, event: Event) {
  event.stopPropagation();
  if (props.disabled || option.disabled) return;
  current.value = option.value;
  updateElementState(host, "value", option.value);
  emitElementEvent(host, "change", [option.value]);
}
</script>

<template>
  <fieldset :class="[orientation, variant, { invalid: hasError }]" :disabled="disabled" :aria-invalid="hasError ? 'true' : undefined" :aria-describedby="description ? descriptionId : undefined">
    <legend>{{ label }}<b v-if="required" aria-hidden="true">Required</b></legend>
    <div class="options">
      <label v-for="option in choices" :key="option.value" :class="{ selected: current === option.value, disabled: disabled || option.disabled }">
        <input
          type="radio"
          :name="name || groupId"
          :value="option.value"
          :checked="current === option.value"
          :disabled="disabled || option.disabled"
          :required="required"
          @input.stop
          @change="select(option, $event)"
        />
        <span class="radio" aria-hidden="true"><i></i></span>
        <span class="copy"><strong>{{ option.label }}</strong><small v-if="option.description">{{ option.description }}</small></span>
      </label>
    </div>
    <small v-if="description" :id="descriptionId" :class="['description', { error: hasError }]">{{ description }}</small>
  </fieldset>
</template>

<style>
:host { display: inline-block; min-width: 190px; color: var(--osx-text); font-family: var(--osx-font); }
fieldset { min-width: 0; display: grid; gap: 7px; margin: 0; padding: 0; border: 0; }legend { width: 100%; display: flex; gap: 8px; align-items: baseline; justify-content: space-between; margin-bottom: 6px; padding: 0; font-size: 12px; font-weight: 700; }legend b { color: var(--osx-muted); font-size: 12px; font-weight: 500; }.options { display: flex; gap: 8px; }.vertical .options { align-items: stretch; flex-direction: column; }
label { min-width: 0; display: grid; grid-template-columns: 17px minmax(0,1fr); gap: 8px; align-items: center; font-size: 13px; cursor: pointer; }input { width: 1px; height: 1px; position: absolute; opacity: 0; }.radio { width: 16px; height: 16px; display: grid; place-items: center; border: 1px solid var(--osx-border); border-radius: 50%; background: linear-gradient(var(--osx-surface-raised),var(--osx-surface-sunken)); box-shadow: 0 1px var(--osx-highlight) inset,0 1px 2px rgba(0,0,0,.14); }.radio i { width: 8px; height: 8px; border-radius: 50%; background: white; opacity: 0; transform: scale(.5); transition: opacity .12s ease,transform .12s ease; }input:checked + .radio { border-color: color-mix(in srgb,var(--osx-accent) 80%,#123); background: linear-gradient(var(--osx-accent-light),var(--osx-accent)); }input:checked + .radio i { opacity: 1; transform: scale(1); }input:focus-visible + .radio { outline: 3px solid var(--osx-focus); outline-offset: 2px; }
.copy { min-width: 0; display: grid; gap: 2px; }.copy strong { font-size: 13px; }.copy small,.description { color: var(--osx-muted); font-size: 12px; line-height: 1.35; }.cards label { padding: 10px; border: 1px solid var(--osx-border); border-radius: 8px; background: var(--osx-surface-raised); box-shadow: 0 1px var(--osx-highlight) inset; }.cards label.selected { border-color: var(--osx-accent); background: color-mix(in srgb,var(--osx-accent) 8%,var(--osx-surface-raised)); }.cards label:has(input:focus-visible) { outline: 3px solid var(--osx-focus); outline-offset: 1px; }.cards label:has(input:focus-visible) .radio { outline: 0; }.invalid .radio,.invalid.cards label { border-color: var(--osx-danger); }.error { color: color-mix(in srgb,var(--osx-danger) 80%,var(--osx-text)); }.disabled { opacity: .55; cursor: not-allowed; }
@media (max-width: 620px) { .horizontal .options { align-items: stretch; flex-direction: column; } }
@media (prefers-reduced-motion: reduce) { .radio i { transition: none; } }
@media (forced-colors: active) { input:checked + .radio { border: 4px solid Highlight; background: Canvas; }input:checked + .radio i { background: Highlight; }.cards label.selected { border: 3px solid Highlight; background: Canvas; } }
</style>
