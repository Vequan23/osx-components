<script setup lang="ts">
import { ref, watch } from "vue";

const props = withDefaults(defineProps<{
  value?: string;
  placeholder?: string;
  model?: string;
  busy?: boolean;
  disabled?: boolean;
  rows?: number;
}>(), {
  value: "",
  placeholder: "Ask the agent to explain, plan, or change something…",
  model: "",
  busy: false,
  disabled: false,
  rows: 3,
});
const emit = defineEmits<{ input: [value: string]; submit: [value: string]; stop: [] }>();
const current = ref(props.value);
watch(() => props.value, (value) => { current.value = value; });
function update(event: Event) {
  current.value = (event.target as HTMLTextAreaElement).value;
  emit("input", current.value);
}
function submit() {
  const prompt = current.value.trim();
  if (!prompt || props.busy || props.disabled) return;
  emit("submit", prompt);
}
function onKeydown(event: KeyboardEvent) {
  if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
    event.preventDefault();
    submit();
  }
}
</script>

<template>
  <form aria-label="Agent prompt" @submit.prevent="submit">
    <textarea :value="current" :rows="rows" :placeholder="placeholder" :disabled="disabled" aria-label="Message to agent" @input="update" @keydown="onKeydown"></textarea>
    <footer>
      <div><slot name="tools"></slot><span v-if="model">{{ model }}</span></div>
      <button v-if="busy" class="stop" type="button" aria-label="Stop agent" @click="emit('stop')">■ Stop</button>
      <button v-else class="send" type="submit" :disabled="disabled || !current.trim()">Send <span aria-hidden="true">↵</span></button>
    </footer>
  </form>
</template>

<style>
:host { display: block; color: var(--osx-text); font-family: var(--osx-font); }
form { padding: 10px; }
textarea { width: 100%; min-height: 74px; resize: vertical; padding: 10px 11px; border: 1px solid var(--osx-border); border-radius: 8px; color: var(--osx-text); background: var(--osx-surface-sunken); box-shadow: 0 1px 2px rgba(0,0,0,.15) inset; font: 13px/1.5 var(--osx-font); }
textarea::placeholder { color: var(--osx-muted); }
textarea:focus-visible { outline: 3px solid var(--osx-focus); outline-offset: 1px; }
footer { display: flex; gap: 10px; align-items: center; justify-content: space-between; padding-top: 8px; }
footer div { min-width: 0; display: flex; gap: 8px; align-items: center; color: var(--osx-muted); font-size: 12px; }
button { min-height: 28px; padding: 4px 12px; border: 1px solid var(--osx-border); border-radius: 7px; color: var(--osx-text); background: linear-gradient(var(--osx-surface-raised),var(--osx-surface-sunken)); font: 700 12px var(--osx-font); cursor: pointer; }
button:focus-visible { outline: 3px solid var(--osx-focus); outline-offset: 2px; }
button:disabled { opacity: .5; cursor: not-allowed; }
.send { color: white; border-color: color-mix(in srgb,var(--osx-accent) 78%,#123); background: linear-gradient(var(--osx-accent-light),var(--osx-accent)); text-shadow: 0 -1px rgba(0,0,0,.4); }
.stop { color: white; border-color: var(--osx-danger,#9c3632); background: linear-gradient(#ef8179,#b9413c); }
</style>
