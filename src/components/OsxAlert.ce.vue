<script setup lang="ts">
import { computed } from "vue";
import IconGlyph from "./IconGlyph.vue";
const props = withDefaults(defineProps<{ tone?: "info" | "success" | "warning" | "error"; title?: string; description?: string; dismissible?: boolean; label?: string }>(), { tone: "info", title: "Notice", description: "", dismissible: false, label: "" });
const emit = defineEmits<{ dismiss: [] }>();
const glyph = computed(() => ({ info: "info", success: "check", warning: "warning", error: "close" } as const)[props.tone]);
const liveRole = computed(() => props.tone === "error" ? "alert" : "status");
</script>

<template>
  <section :class="['alert', tone]" :role="liveRole" :aria-label="label || title">
    <span class="glyph"><IconGlyph :name="glyph" :size="16" /></span>
    <div><strong>{{ title }}</strong><p v-if="description">{{ description }}</p><div class="content"><slot></slot></div><div class="actions"><slot name="actions"></slot></div></div>
    <button v-if="dismissible" type="button" aria-label="Dismiss alert" @click="emit('dismiss')"><IconGlyph name="close" :size="18" /></button>
  </section>
</template>

<style>
:host { display: block; color: var(--osx-text); font-family: var(--osx-font); }
.alert { --tone: var(--osx-accent); display: grid; grid-template-columns: 30px minmax(0,1fr) auto; gap: 10px; align-items: start; padding: 12px 13px; border: 1px solid color-mix(in srgb,var(--tone) 55%,var(--osx-border)); border-radius: 8px; background: color-mix(in srgb,var(--tone) 11%,var(--osx-surface-raised)); box-shadow: 0 1px 2px rgba(0,0,0,.08); }
.success { --tone: var(--osx-success,#2f9951); }.warning { --tone: var(--osx-warning,#c28519); }.error { --tone: var(--osx-danger,#c74d47); }
.glyph { width: 27px; height: 27px; display: grid; place-items: center; border: 1px solid color-mix(in srgb,var(--tone) 75%,#222); border-radius: 50%; color: white; background: linear-gradient(color-mix(in srgb,var(--tone) 75%,white),var(--tone)); font: 800 16px Georgia,serif; text-shadow: 0 -1px rgba(0,0,0,.35); }
strong { display: block; font-size: 13px; line-height: 1.35; }p,.content { margin: 3px 0 0; color: var(--osx-muted); font-size: 12px; line-height: 1.5; }.content:empty,.actions:empty { display: none; }.actions { display: flex; gap: 8px; margin-top: 9px; }
button { width: 28px; height: 28px; display: grid; place-items: center; border: 0; border-radius: 5px; color: var(--osx-muted); background: transparent; font: 500 20px/1 var(--osx-font); cursor: pointer; }button:hover { color: var(--osx-text); background: color-mix(in srgb,var(--osx-text) 8%,transparent); }button:focus-visible { outline: 3px solid var(--osx-focus); outline-offset: 1px; }
</style>
