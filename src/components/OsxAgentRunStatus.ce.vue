<script setup lang="ts">
import { computed } from "vue";
import IconGlyph from "./IconGlyph.vue";
const props = withDefaults(defineProps<{
  phase?: "planning" | "working" | "verifying" | "complete" | "error";
  label?: string;
  detail?: string;
}>(), { phase: "working", label: "Agent run", detail: "" });
const phases = ["Plan", "Work", "Verify", "Done"];
const activeIndex = computed(() => ({ planning: 0, working: 1, verifying: 2, complete: 3, error: 2 })[props.phase]);
</script>

<template>
  <section :class="['run',phase]" :aria-label="label" :aria-busy="!['complete','error'].includes(phase)">
    <header><strong>{{ label }}</strong><span>{{ detail }}</span></header>
    <ol><li v-for="(item,index) in phases" :key="item" :class="{ active: index === activeIndex, done: index < activeIndex || phase === 'complete', failed: phase === 'error' && index === activeIndex }"><i aria-hidden="true"><IconGlyph v-if="index < activeIndex || phase === 'complete'" name="check" :size="13" /><template v-else>{{ index + 1 }}</template></i><span>{{ item }}</span></li></ol>
  </section>
</template>

<style>
:host { display: block; color: var(--osx-text); font-family: var(--osx-font); }
.run { padding: 11px 12px; border: 1px solid var(--osx-border-soft); border-radius: 8px; background: var(--osx-surface-raised); }
header { display: flex; gap: 10px; justify-content: space-between; margin-bottom: 11px; }header strong { font-size: 13px; }header span { overflow: hidden; color: var(--osx-muted); font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
ol { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); margin: 0; padding: 0; list-style: none; }li { position: relative; display: grid; gap: 4px; justify-items: center; color: var(--osx-muted); font-size: 12px; }li::before { height: 1px; position: absolute; top: 11px; right: 50%; left: -50%; background: var(--osx-border-soft); content: ""; }li:first-child::before { display: none; }i { width: 23px; height: 23px; z-index: 1; display: grid; place-items: center; border: 1px solid var(--osx-border); border-radius: 50%; background: var(--osx-surface-sunken); font-style: normal; font-size: 12px; font-weight: 800; }.active i { color: white; border-color: var(--osx-accent); background: var(--osx-accent); }.done i { color: white; border-color: var(--osx-success,#2f9951); background: var(--osx-success,#2f9951); }.failed i { color: white; border-color: var(--osx-danger,#c74d47); background: var(--osx-danger,#c74d47); }.active span,.done span,.failed span { color: var(--osx-text); font-weight: 700; }
</style>
