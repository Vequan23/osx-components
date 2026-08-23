<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
const props = withDefaults(defineProps<{ open?: boolean; tone?: "info" | "success" | "warning" | "error"; title?: string; message?: string; duration?: number; placement?: "top-right" | "top-left" | "bottom-right" | "bottom-left"; dismissible?: boolean; contained?: boolean }>(), { open: false, tone: "info", title: "Notification", message: "", duration: 4500, placement: "top-right", dismissible: true, contained: false });
const emit = defineEmits<{ dismiss: [reason: "manual" | "timeout"] }>();
const visible = ref(props.open);
let timer: number | undefined;
const glyph = computed(() => ({ info: "i", success: "✓", warning: "!", error: "×" })[props.tone]);
function close(reason: "manual" | "timeout") { visible.value = false; emit("dismiss", reason); }
function schedule() { window.clearTimeout(timer); if (visible.value && props.duration > 0) timer = window.setTimeout(() => close("timeout"), props.duration); }
watch(() => [props.open, props.duration], () => { visible.value = props.open; schedule(); }, { immediate: true });
onBeforeUnmount(() => window.clearTimeout(timer));
</script>
<template>
  <Transition name="toast"><aside v-if="visible" :class="['toast',tone,placement,{ contained }]" :role="tone === 'error' ? 'alert' : 'status'" :aria-live="tone === 'error' ? 'assertive' : 'polite'">
    <span class="glyph" aria-hidden="true">{{ glyph }}</span><div><strong>{{ title }}</strong><p v-if="message">{{ message }}</p><div class="content"><slot></slot></div></div><button v-if="dismissible" type="button" aria-label="Dismiss notification" @click="close('manual')">×</button>
  </aside></Transition>
</template>
<style>
:host { color: var(--osx-text); font-family: var(--osx-font); }
.toast { --tone: var(--osx-accent); width: min(360px,calc(100vw - 32px)); position: fixed; z-index: 1100; display: grid; grid-template-columns: 28px minmax(0,1fr) auto; gap: 10px; align-items: start; padding: 12px; border: 1px solid color-mix(in srgb,var(--tone) 45%,var(--osx-border)); border-radius: 9px; background: color-mix(in srgb,var(--tone) 8%,var(--osx-surface-raised)); box-shadow: 0 10px 35px rgba(0,0,0,.2); }.success { --tone: var(--osx-success,#2f9951); }.warning { --tone: var(--osx-warning,#c28519); }.error { --tone: var(--osx-danger,#c74d47); }.top-right { top: 18px; right: 18px; }.top-left { top: 18px; left: 18px; }.bottom-right { right: 18px; bottom: 18px; }.bottom-left { bottom: 18px; left: 18px; }.contained { position: absolute; }
.glyph { width: 27px; height: 27px; display: grid; place-items: center; border-radius: 50%; color: white; background: var(--tone); font: 800 16px Georgia,serif; }strong { display: block; font-size: 13px; line-height: 1.35; }p,.content { margin: 3px 0 0; color: var(--osx-muted); font-size: 12px; line-height: 1.45; }.content:empty { display: none; }button { width: 27px; height: 27px; border: 0; border-radius: 5px; color: var(--osx-muted); background: transparent; font: 500 20px/1 var(--osx-font); cursor: pointer; }button:hover { background: color-mix(in srgb,var(--osx-text) 8%,transparent); }button:focus-visible { outline: 3px solid var(--osx-focus); outline-offset: 1px; }
.toast-enter-active,.toast-leave-active { transition: opacity .16s ease,transform .16s ease; }.toast-enter-from,.toast-leave-to { opacity: 0; transform: translateY(-8px) scale(.98); }@media (prefers-reduced-motion: reduce) { .toast-enter-active,.toast-leave-active { transition: none; } }
</style>
