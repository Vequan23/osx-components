<script setup lang="ts">
withDefaults(defineProps<{ title?: string; subtitle?: string; active?: boolean; closeable?: boolean; minimizable?: boolean; zoomable?: boolean }>(), { title: "Untitled", active: true, closeable: true, minimizable: true, zoomable: true });
const emit = defineEmits<{ close: []; minimize: []; zoom: [] }>();
</script>

<template>
  <section :class="['window', { inactive: !active }]">
    <header>
      <div class="controls" aria-label="Window controls">
        <button class="close" :disabled="!closeable" aria-label="Close window" @click="emit('close')"></button>
        <button class="minimize" :disabled="!minimizable" aria-label="Minimize window" @click="emit('minimize')"></button>
        <button class="zoom" :disabled="!zoomable" aria-label="Zoom window" @click="emit('zoom')"></button>
      </div>
      <div class="title"><strong>{{ title }}</strong><small v-if="subtitle">{{ subtitle }}</small></div>
      <div class="accessory"><slot name="accessory"></slot></div>
    </header>
    <slot name="toolbar"></slot>
    <div class="content"><slot></slot></div>
    <footer v-if="$slots.footer"><slot name="footer"></slot></footer>
  </section>
</template>

<style>
:host { display: block; color: var(--osx-text); font-family: var(--osx-font); }
.window { overflow: hidden; border: 1px solid var(--osx-border); border-radius: 9px; background: var(--osx-surface); box-shadow: var(--osx-shadow); }
header { min-height: 37px; display: grid; grid-template-columns: 1fr auto 1fr; gap: 10px; align-items: center; padding: 0 11px; border-bottom: 1px solid var(--osx-border); background: repeating-linear-gradient(0deg, transparent 0 2px, rgba(255,255,255,.16) 2px 3px), linear-gradient(var(--osx-title-start), var(--osx-title-end)); box-shadow: 0 1px var(--osx-highlight) inset; }
.controls { display: flex; gap: 7px; }
.controls button { width: 14px; height: 14px; padding: 0; border: 1px solid rgba(0,0,0,.28); border-radius: 50%; box-shadow: 0 1px rgba(255,255,255,.5) inset; cursor: pointer; }
.controls button:focus-visible { outline: 3px solid var(--osx-focus); outline-offset: 2px; }
.controls button:disabled { filter: grayscale(1); opacity: .38; }
.close { background: linear-gradient(#ff7b70, #df4d43); }.minimize { background: linear-gradient(#ffd56b, #e5a72c); }.zoom { background: linear-gradient(#71d487, #36a852); }
.title { display: grid; color: var(--osx-text); text-align: center; text-shadow: 0 1px var(--osx-highlight); }
.title strong { font-size: 13px; }.title small { color: var(--osx-muted); font-size: 12px; }
.accessory { justify-self: end; }
.content { min-height: 80px; }
footer { padding: 7px 11px; border-top: 1px solid var(--osx-border-soft); color: var(--osx-muted); background: var(--osx-surface-sunken); font-size: 12px; }
.inactive header { filter: saturate(.15); }.inactive .controls button { opacity: .46; }
@media (max-width: 620px) {
  header { grid-template-columns: auto minmax(0,1fr) auto; }
  .title { min-width: 0; }
  .title strong,.title small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
}
</style>
