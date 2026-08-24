<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from "vue";
const props = withDefaults(defineProps<{ text?: string; placement?: "top" | "right" | "bottom" | "left"; open?: boolean; delay?: number }>(), { text: "", placement: "top", open: false, delay: 350 });
const visible = ref(props.open); let timer: number | undefined;
watch(() => props.open, (value) => { visible.value = value; });
function show() { window.clearTimeout(timer); timer = window.setTimeout(() => { visible.value = true; }, props.delay); }
function hide() { window.clearTimeout(timer); visible.value = props.open; }
onBeforeUnmount(() => window.clearTimeout(timer));
</script>
<template><span class="anchor" @mouseenter="show" @mouseleave="hide" @focusin="show" @focusout="hide"><slot></slot><Transition name="tip"><span v-if="visible && text" :class="['tooltip',placement]" role="tooltip">{{ text }}</span></Transition></span></template>
<style>
:host { display: inline-flex; font-family: var(--osx-font); }.anchor { position: relative; display: inline-flex; }.tooltip { width: max-content; max-width: 240px; position: absolute; z-index: 1200; padding: 6px 8px; border: 1px solid #10171b; border-radius: 5px; color: #f5f8fa; background: rgba(25,34,39,.96); box-shadow: 0 4px 14px rgba(0,0,0,.26); font-size: 12px; font-weight: 600; line-height: 1.35; pointer-events: none; }.top { bottom: calc(100% + 8px); left: 50%; transform: translateX(-50%); }.bottom { top: calc(100% + 8px); left: 50%; transform: translateX(-50%); }.left { top: 50%; right: calc(100% + 8px); transform: translateY(-50%); }.right { top: 50%; left: calc(100% + 8px); transform: translateY(-50%); }.tip-enter-active,.tip-leave-active { transition: opacity .12s ease; }.tip-enter-from,.tip-leave-to { opacity: 0; }@media (prefers-reduced-motion: reduce) { .tip-enter-active,.tip-leave-active { transition: none; } }
</style>
