<script setup lang="ts">
import IconGlyph from "./IconGlyph.vue";
withDefaults(defineProps<{
  messageRole?: "user" | "assistant" | "system";
  author?: string;
  model?: string;
  timestamp?: string;
  status?: "complete" | "streaming" | "error";
}>(), {
  messageRole: "assistant",
  author: "Agent",
  model: "",
  timestamp: "",
  status: "complete",
});
</script>

<template>
  <article :class="[messageRole,status]" :aria-label="`${author} message`" :aria-busy="status === 'streaming' || undefined">
    <header><span class="avatar"><IconGlyph :name="messageRole === 'assistant' ? 'bot' : messageRole === 'user' ? 'user' : 'info'" :size="13" /></span><strong>{{ author }}</strong><small v-if="model">{{ model }}</small><time v-if="timestamp">{{ timestamp }}</time></header>
    <div class="body"><slot></slot><span v-if="status === 'streaming'" class="cursor" role="status" aria-label="Streaming response"></span></div>
    <footer><slot name="actions"></slot></footer>
  </article>
</template>

<style>
:host { display: block; color: var(--osx-text); font-family: var(--osx-font); }
article { padding: 14px 16px; border-bottom: 1px solid var(--osx-border-soft); background: var(--osx-surface); }
article.user { background: color-mix(in srgb,var(--osx-accent) 7%,var(--osx-surface)); }
article.error { border-left: 3px solid var(--osx-danger,#c74d47); }
header { display: grid; grid-template-columns: auto auto minmax(0,1fr) auto; gap: 7px; align-items: center; }
.avatar { width: 22px; height: 22px; display: grid; place-items: center; border: 1px solid var(--osx-border); border-radius: 50%; color: var(--osx-accent); background: var(--osx-surface-raised); font-size: 12px; font-weight: 800; }
header strong { font-size: 13px; }header small,header time { overflow: hidden; color: var(--osx-muted); font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }header time { justify-self: end; }
.body { padding: 10px 0 0 29px; overflow-wrap: anywhere; font-size: 13px; line-height: 1.58; }
.body :slotted(p) { margin: 0 0 9px; }.body :slotted(pre) { max-width: 100%; overflow: auto; padding: 10px; border: 1px solid var(--osx-border-soft); border-radius: 6px; background: var(--osx-surface-sunken); font: 12px/1.5 ui-monospace,monospace; }
.cursor { width: 7px; height: 14px; display: inline-block; margin-left: 3px; background: var(--osx-accent); animation: blink .85s steps(1) infinite; vertical-align: -2px; }
footer { display: flex; gap: 6px; padding: 8px 0 0 29px; }
@keyframes blink { 50% { opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .cursor { animation: none; } }
@media (max-width: 480px) { article { padding-inline: 12px; }.body,footer { padding-left: 0; }header { grid-template-columns: auto auto 1fr; }header time { grid-column: 2 / -1; justify-self: start; } }
</style>
