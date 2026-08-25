<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { OsxIconName } from "../icons";
import IconGlyph from "./IconGlyph.vue";
const props = withDefaults(defineProps<{ value?: string; label?: string; placeholder?: string; type?: "text" | "email" | "password" | "search"; disabled?: boolean; hint?: string; icon?: OsxIconName; iconPosition?: "leading" | "trailing" }>(), { value: "", type: "text", disabled: false, icon: undefined, iconPosition: "leading" });
const emit = defineEmits<{ input: [value: string]; change: [value: string] }>();
const localValue = ref(props.value);
const displayedIcon = computed<OsxIconName | undefined>(() => props.icon ?? (props.type === "search" ? "search" : undefined));
watch(() => props.value, (value) => { localValue.value = value; });
function update(event: Event) { localValue.value = (event.target as HTMLInputElement).value; emit("input", localValue.value); }
</script>

<template>
  <label>
    <span v-if="label" class="label">{{ label }}</span>
    <span class="field" :class="`icon-${iconPosition}`"><IconGlyph v-if="displayedIcon && iconPosition === 'leading'" class="field-icon" :name="displayedIcon" :size="15" /><input :type="type" :value="localValue" :placeholder="placeholder" :disabled="disabled" @input="update" @change="emit('change', localValue)" /><IconGlyph v-if="displayedIcon && iconPosition === 'trailing'" class="field-icon" :name="displayedIcon" :size="15" /></span>
    <small v-if="hint">{{ hint }}</small>
  </label>
</template>

<style>
:host { display: inline-block; min-width: 190px; color: var(--osx-text); font-family: var(--osx-font); }
label { display: grid; gap: 5px; }
.label { font-size: 12px; font-weight: 700; }
.field { min-height: 31px; display: flex; gap: 8px; align-items: center; padding-inline: 10px; border: 1px solid var(--osx-border); border-radius: 7px; background: var(--osx-surface-raised); box-shadow: 0 1px 3px rgba(25, 43, 54, .18) inset, 0 1px var(--osx-highlight); }
.field:focus-within { border-color: var(--osx-accent); outline: 3px solid var(--osx-focus); }
input { width: 100%; min-width: 0; padding: 6px 0; border: 0; outline: 0; color: var(--osx-text); background: transparent; font: 13px/1.25 var(--osx-font); }
input::placeholder, small { color: var(--osx-muted); }
input:disabled { opacity: .55; cursor: not-allowed; }
.field-icon { flex: 0 0 auto; color: var(--osx-muted); }.icon-trailing input { order: 0; }.icon-trailing .field-icon { order: 1; }
small { font-size: 12px; }
</style>
