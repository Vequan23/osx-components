<script setup lang="ts">
import IconGlyph from "./IconGlyph.vue";
import { useHostTitle } from "../native-host-attributes";
withDefaults(defineProps<{
  description?: string;
  risk?: "low" | "medium" | "high";
  scope?: string;
  approveLabel?: string;
  rejectLabel?: string;
  disabled?: boolean;
}>(), {
  description: "Review this action before the agent continues.",
  risk: "medium",
  scope: "",
  approveLabel: "Allow",
  rejectLabel: "Deny",
  disabled: false,
});
const title = useHostTitle("Approval required");
const emit = defineEmits<{ approve: []; reject: [] }>();
</script>

<template>
  <section :class="['approval',risk]" aria-label="Agent approval request">
    <div class="badge"><IconGlyph :name="risk === 'low' ? 'check' : 'warning'" :size="15" /></div>
    <div class="copy"><header><strong>{{ title }}</strong><span>{{ risk }} risk</span></header><p>{{ description }}</p><code v-if="scope">{{ scope }}</code><slot></slot></div>
    <footer><button type="button" :disabled="disabled" @click="emit('reject')">{{ rejectLabel }}</button><button class="approve" type="button" :disabled="disabled" @click="emit('approve')">{{ approveLabel }}</button></footer>
  </section>
</template>

<style>
:host { display: block; color: var(--osx-text); font-family: var(--osx-font); }
.approval { display: grid; grid-template-columns: auto minmax(0,1fr) auto; gap: 11px; align-items: start; padding: 12px; border: 1px solid var(--osx-border); border-left: 3px solid var(--osx-warning,#ce8a23); border-radius: 8px; background: var(--osx-surface-raised); box-shadow: 0 1px var(--osx-highlight) inset; }
.approval.high { border-left-color: var(--osx-danger,#c74d47); }.approval.low { border-left-color: var(--osx-success,#2f9951); }
.badge { width: 27px; height: 27px; display: grid; place-items: center; border: 1px solid currentColor; border-radius: 50%; color: var(--osx-warning,#ce8a23); font-size: 12px; font-weight: 800; }.high .badge { color: var(--osx-danger,#c74d47); }.low .badge { color: var(--osx-success,#2f9951); }
.copy { min-width: 0; }.copy header { display: flex; flex-wrap: wrap; gap: 6px 10px; align-items: center; }.copy strong { font-size: 13px; }.copy header span { color: var(--osx-muted); font-size: 12px; font-weight: 700; text-transform: uppercase; }
p { margin: 6px 0; color: var(--osx-muted); font-size: 12px; line-height: 1.5; }code { display: block; overflow: hidden; color: var(--osx-text); font: 12px/1.45 ui-monospace,monospace; text-overflow: ellipsis; white-space: nowrap; }
footer { display: flex; gap: 7px; }button { min-height: 28px; padding: 4px 11px; border: 1px solid var(--osx-border); border-radius: 7px; color: var(--osx-text); background: linear-gradient(var(--osx-surface-raised),var(--osx-surface-sunken)); font: 700 12px var(--osx-font); cursor: pointer; }.approve { color: white; border-color: color-mix(in srgb,var(--osx-accent) 78%,#123); background: linear-gradient(var(--osx-accent-light),var(--osx-accent)); }.approval.high .approve { border-color: var(--osx-danger,#9c3632); background: linear-gradient(#ef8179,#b9413c); }button:focus-visible { outline: 3px solid var(--osx-focus); outline-offset: 2px; }button:disabled { opacity: .5; }
@media (max-width: 560px) { .approval { grid-template-columns: auto minmax(0,1fr); }.approval footer { grid-column: 1 / -1; justify-content: flex-end; } }
</style>
