<script setup lang="ts">
import { computed, ref, useHost, useId, watch } from "vue";
import { emitElementEvent, updateElementState } from "../element-events";
import type { OsxIconName } from "../icons";
import IconGlyph from "./IconGlyph.vue";
const props = withDefaults(defineProps<{
  value?: string;
  label?: string;
  placeholder?: string;
  type?: "text" | "email" | "password" | "search" | "tel" | "url";
  name?: string;
  autocomplete?: string;
  maxlength?: number;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  invalid?: boolean;
  hint?: string;
  error?: string;
  icon?: OsxIconName;
  iconPosition?: "leading" | "trailing";
}>(), { value: "", label: "", placeholder: "", type: "text", name: "", autocomplete: "", maxlength: undefined, disabled: false, readonly: false, required: false, invalid: false, hint: "", error: "", icon: undefined, iconPosition: "leading" });
const host = useHost();
const localValue = ref(props.value);
const control = ref<HTMLInputElement | null>(null);
const descriptionId = `osx-text-field-${useId()}`;
const displayedIcon = computed<OsxIconName | undefined>(() => props.icon ?? (props.type === "search" ? "search" : undefined));
const hasError = computed(() => props.invalid || Boolean(props.error));
const description = computed(() => props.error || props.hint);
watch(() => props.value, (value) => { localValue.value = value; });
function update(event: Event) { event.stopPropagation(); localValue.value = (event.target as HTMLInputElement).value; updateElementState(host, "value", localValue.value); emitElementEvent(host, "input", [localValue.value]); }
function commit(event: Event) { event.stopPropagation(); emitElementEvent(host, "change", [localValue.value]); }
function focusControl() { if (!props.disabled) control.value?.focus({ preventScroll: true }); }
</script>

<template>
  <label :class="{ invalid: hasError, disabled }" @pointerdown="focusControl">
    <span v-if="label" class="label">{{ label }}<b v-if="required" aria-hidden="true">Required</b></span>
    <span class="field" :class="`icon-${iconPosition}`"><IconGlyph v-if="displayedIcon && iconPosition === 'leading'" class="field-icon" :name="displayedIcon" :size="15" /><input ref="control" :type="type" :value="localValue" :placeholder="placeholder" :name="name || undefined" :autocomplete="autocomplete || undefined" :maxlength="maxlength" :disabled="disabled" :readonly="readonly" :required="required" :aria-invalid="hasError ? 'true' : undefined" :aria-describedby="description ? descriptionId : undefined" @input="update" @change="commit" /><IconGlyph v-if="displayedIcon && iconPosition === 'trailing'" class="field-icon" :name="displayedIcon" :size="15" /></span>
    <small v-if="description" :id="descriptionId" :class="{ error: hasError }">{{ description }}</small>
  </label>
</template>

<style>
:host { display: inline-block; min-width: 190px; color: var(--osx-text); font-family: var(--osx-font); }
label { display: grid; gap: 5px; }
.label { display: flex; gap: 8px; align-items: baseline; justify-content: space-between; font-size: 12px; font-weight: 700; }.label b { color: var(--osx-muted); font-size: 12px; font-weight: 500; }
.field { min-height: 31px; display: flex; gap: 8px; align-items: center; padding-inline: 10px; border: 1px solid var(--osx-border); border-radius: 7px; background: var(--osx-surface-raised); box-shadow: 0 1px 3px rgba(25, 43, 54, .18) inset, 0 1px var(--osx-highlight); }
.field:focus-within { border-color: var(--osx-accent); outline: 3px solid var(--osx-focus); }
.invalid .field { border-color: var(--osx-danger); }.invalid .field:focus-within { outline-color: color-mix(in srgb,var(--osx-danger) 30%,transparent); }
input { width: 100%; min-width: 0; padding: 6px 0; border: 0; outline: 0; color: var(--osx-text); background: transparent; font: 13px/1.25 var(--osx-font); }
input::placeholder, small { color: var(--osx-muted); }
input:disabled { opacity: .55; cursor: not-allowed; }
.disabled { opacity: .55; cursor: not-allowed; }input:read-only:not(:disabled) { color: var(--osx-muted); }
.field-icon { flex: 0 0 auto; color: var(--osx-muted); }.icon-trailing input { order: 0; }.icon-trailing .field-icon { order: 1; }
small { font-size: 12px; line-height: 1.35; }.error { color: color-mix(in srgb,var(--osx-danger) 80%,var(--osx-text)); }
</style>
