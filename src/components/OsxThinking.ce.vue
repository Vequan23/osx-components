<script setup lang="ts">
import { ref, watch } from "vue";
import IconGlyph from "./IconGlyph.vue";
import { useHostTitle } from "../native-host-attributes";

const props = withDefaults(defineProps<{
  summary?: string;
  status?: "idle" | "streaming" | "complete" | "error";
  open?: boolean;
  label?: string;
}>(), {
  summary: "",
  status: "idle",
  open: false,
  label: "Reasoning summary",
});
const title = useHostTitle("Reasoning");

const emit = defineEmits<{ toggle: [open: boolean] }>();
const expanded = ref(props.open);
watch(() => props.open, (value) => { expanded.value = value; });
function onToggle(event: Event) {
  expanded.value = (event.currentTarget as HTMLDetailsElement).open;
  emit("toggle", expanded.value);
}
function iconName() {
  if (props.status === "streaming") return "loader";
  if (props.status === "complete") return "check";
  if (props.status === "error") return "warning";
  return "sparkle";
}
</script>

<template>
  <details :open="expanded" :class="status" :aria-label="label" :aria-busy="status === 'streaming' || undefined" @toggle="onToggle">
    <summary>
      <span class="state"><IconGlyph :name="iconName()" :size="15" /></span>
      <span class="copy"><strong>{{ title }}</strong><small v-if="summary">{{ summary }}</small></span>
      <span v-if="status === 'streaming'" class="stream-label" role="status">Thinking</span>
      <IconGlyph class="chevron" name="chevron-down" :size="16" />
    </summary>
    <div class="content"><slot></slot></div>
  </details>
</template>

<style>
:host { display: block; color: var(--osx-text); font-family: var(--osx-font); }
details { overflow: hidden; border: 1px solid var(--osx-border-soft); border-radius: 8px; background: color-mix(in srgb,var(--osx-accent) 4%,var(--osx-surface-raised)); }
summary { min-height: 46px; display: grid; grid-template-columns: auto minmax(0,1fr) auto auto; gap: 9px; align-items: center; padding: 8px 11px; cursor: pointer; list-style: none; }
summary::-webkit-details-marker { display: none; }
summary:focus-visible { outline: 3px solid var(--osx-focus); outline-offset: -3px; }
.state { width: 27px; height: 27px; display: grid; place-items: center; border: 1px solid var(--osx-border); border-radius: 50%; color: var(--osx-accent-ink); background: var(--osx-surface-sunken); }
.streaming .state { animation: pulse 1.35s ease-in-out infinite; }
.complete .state { color: var(--osx-success); border-color: color-mix(in srgb,var(--osx-success) 65%,var(--osx-border)); }
.error .state { color: var(--osx-danger); border-color: color-mix(in srgb,var(--osx-danger) 65%,var(--osx-border)); }
.copy { min-width: 0; display: grid; gap: 2px; }.copy strong { font-size: 13px; }.copy small,.stream-label { overflow: hidden; color: var(--osx-muted); font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
.stream-label { color: var(--osx-accent-ink); font-weight: 700; }.chevron { color: var(--osx-muted); transition: transform .16s ease; }details[open] .chevron { transform: rotate(180deg); }
.content { padding: 12px 14px 14px 47px; border-top: 1px solid var(--osx-border-soft); color: var(--osx-muted); background: var(--osx-surface-sunken); font-size: 13px; line-height: 1.58; overflow-wrap: anywhere; }
@keyframes pulse { 50% { opacity: .45; transform: scale(.9); } }
@media (prefers-reduced-motion: reduce) { .streaming .state { animation: none; }.chevron { transition: none; } }
@media (max-width: 480px) { summary { grid-template-columns: auto minmax(0,1fr) auto; }.stream-label { display: none; }.content { padding-left: 14px; } }
</style>
