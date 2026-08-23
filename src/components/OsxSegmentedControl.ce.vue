<script setup lang="ts">
import { computed, ref, watch } from "vue";
const props = withDefaults(defineProps<{ items?: string; value?: string; label?: string; disabled?: boolean }>(), { items: "", value: "", label: "View options", disabled: false });
const emit = defineEmits<{ change: [value: string] }>();
const choices = computed(() => props.items.split(",").map((item) => item.trim()).filter(Boolean));
const current = ref(props.value);
watch(() => props.value, (value) => { current.value = value; });
function select(item: string) { current.value = item; emit("change", item); }
</script>

<template>
  <div class="segments" role="radiogroup" :aria-label="label">
    <button v-for="item in choices" :key="item" type="button" role="radio" :aria-checked="item === current" :class="{ active: item === current }" :disabled="disabled" @click="select(item)">{{ item }}</button>
  </div>
</template>

<style>
:host { display: inline-block; font-family: var(--osx-font); }
.segments { display: inline-flex; overflow: hidden; border: 1px solid var(--osx-border); border-radius: 7px; background: var(--osx-surface-sunken); box-shadow: 0 1px 2px rgba(0,0,0,.14); }
button { min-height: 27px; padding: 4px 13px; border: 0; border-right: 1px solid var(--osx-border); color: var(--osx-text); background: linear-gradient(var(--osx-surface-raised), var(--osx-surface-sunken)); font: 600 12px/1.2 var(--osx-font); cursor: pointer; }
button:last-child { border-right: 0; }
button.active { color: white; background: linear-gradient(var(--osx-accent-light), var(--osx-accent)); text-shadow: 0 -1px rgba(0,0,0,.45); }
button:focus-visible { position: relative; outline: 3px solid var(--osx-focus); outline-offset: -3px; }
button:disabled { opacity: .55; cursor: not-allowed; }
</style>
