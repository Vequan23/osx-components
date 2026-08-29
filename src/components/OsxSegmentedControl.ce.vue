<script setup lang="ts">
import { computed, ref, useHost, watch } from "vue";
import { emitElementEvent, updateElementState } from "../element-events";
const props = withDefaults(defineProps<{ items?: string; value?: string; label?: string; disabled?: boolean }>(), { items: "", value: "", label: "View options", disabled: false });
const host = useHost();
const choices = computed(() => props.items.split(",").map((item) => item.trim()).filter(Boolean));
const current = ref(props.value);
watch(() => props.value, (value) => { current.value = value; });
function select(item: string) {
  if (props.disabled || item === current.value) return;
  current.value = item;
  updateElementState(host, "value", item);
  emitElementEvent(host, "change", [item]);
}
function tabIndex(item: string, index: number) {
  return item === current.value || (!choices.value.includes(current.value) && index === 0) ? 0 : -1;
}
function navigate(event: KeyboardEvent, index: number) {
  if (props.disabled || !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
  event.preventDefault();
  let next = index;
  if (event.key === "Home") next = 0;
  else if (event.key === "End") next = choices.value.length - 1;
  else if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % choices.value.length;
  else next = (index - 1 + choices.value.length) % choices.value.length;
  const item = choices.value[next];
  select(item);
  (event.currentTarget as HTMLElement).parentElement?.querySelectorAll<HTMLButtonElement>("button")[next]?.focus();
}
</script>

<template>
  <div class="segments" role="radiogroup" :aria-label="label">
    <button v-for="(item, index) in choices" :key="item" type="button" role="radio" :aria-checked="item === current" :class="{ active: item === current }" :disabled="disabled" :tabindex="tabIndex(item, index)" @click="select(item)" @keydown="navigate($event, index)">{{ item }}</button>
  </div>
</template>

<style>
:host { display: inline-block; font-family: var(--osx-font); }
.segments { display: inline-flex; overflow: hidden; border: 1px solid var(--osx-border); border-radius: 7px; background: var(--osx-surface-sunken); box-shadow: 0 1px 2px rgba(0,0,0,.14); }
button { min-width: 0; min-height: 27px; padding: 4px 13px; border: 0; border-right: 1px solid var(--osx-border); overflow: hidden; color: var(--osx-text); background: linear-gradient(var(--osx-surface-raised), var(--osx-surface-sunken)); font: 600 12px/1.2 var(--osx-font); text-overflow: ellipsis; white-space: nowrap; cursor: pointer; }
button:last-child { border-right: 0; }
button.active { color: white; background: linear-gradient(var(--osx-accent-light), var(--osx-accent)); text-shadow: 0 -1px rgba(0,0,0,.45); }
button:focus-visible { position: relative; outline: 3px solid var(--osx-focus); outline-offset: -3px; }
button:disabled { opacity: .55; cursor: not-allowed; }
@media (forced-colors: active) { button.active { border: 3px solid Highlight; color: HighlightText; background: Highlight; text-shadow: none; } }
@media (max-width: 620px) {
  :host { max-width: 100%; }
  .segments { max-width: 100%; }
  button { flex: 1 1 auto; padding-inline: 11px; }
}
</style>
