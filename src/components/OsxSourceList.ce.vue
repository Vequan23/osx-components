<script setup lang="ts">
import { computed, ref, watch } from "vue";
const props = withDefaults(defineProps<{ items?: string; value?: string; label?: string; heading?: string; compact?: boolean }>(), { items: "", value: "", label: "Source list", heading: "Places", compact: false });
const emit = defineEmits<{ change: [value: string] }>();
const choices = computed(() => props.items.split(",").map((item) => item.trim()).filter(Boolean));
const current = ref(props.value);
watch(() => props.value, (value) => { current.value = value; });
function select(item: string) { current.value = item; emit("change", item); }
</script>

<template>
  <nav :class="{ compact }" :aria-label="label"><h3 v-if="heading">{{ heading }}</h3><button v-for="(item, index) in choices" :key="item" type="button" :class="{ active: item === current }" :aria-current="item === current ? 'page' : undefined" @click="select(item)"><span aria-hidden="true">{{ index % 3 === 0 ? '▰' : index % 3 === 1 ? '◆' : '●' }}</span><strong>{{ item }}</strong></button><slot></slot></nav>
</template>

<style>
:host { display: block; color: var(--osx-text); background: var(--osx-surface-sunken); font-family: var(--osx-font); }
nav { min-height: 100%; display: grid; align-content: start; gap: 2px; padding: 12px 8px; }h3 { margin: 0 8px 6px; color: var(--osx-muted); font-size: 12px; letter-spacing: .08em; text-transform: uppercase; }
button { width: 100%; min-height: 31px; display: grid; grid-template-columns: 21px minmax(0,1fr); gap: 6px; align-items: center; padding: 5px 8px; border: 0; border-radius: 5px; color: var(--osx-text); background: transparent; font: 600 13px var(--osx-font); text-align: left; cursor: pointer; }
button:hover { background: color-mix(in srgb, var(--osx-accent) 10%, transparent); }button.active { color: white; background: linear-gradient(var(--osx-accent-light), var(--osx-accent)); box-shadow: 0 1px rgba(255,255,255,.28) inset; text-shadow: 0 -1px rgba(0,0,0,.42); }button:focus-visible { outline: 3px solid var(--osx-focus); outline-offset: 1px; }
button span { color: var(--osx-accent); text-align: center; }button.active span { color: white; }button strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }.compact button { min-height: 26px; font-size: 12px; }
</style>
