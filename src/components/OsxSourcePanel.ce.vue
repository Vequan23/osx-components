<script setup lang="ts">
import { computed } from "vue";
import IconGlyph from "./IconGlyph.vue";
import { useHostTitle } from "../native-host-attributes";

type SourceItem = { id: string; title: string; url?: string; domain?: string; snippet?: string };
const props = withDefaults(defineProps<{ sources?: string | SourceItem[]; label?: string; selected?: string; compact?: boolean }>(), { sources: "[]", label: "Response sources", selected: "", compact: false });
const title = useHostTitle("Sources");
const emit = defineEmits<{ select: [sourceId: string] }>();
const items = computed<SourceItem[]>(() => {
  if (Array.isArray(props.sources)) return props.sources;
  try { const value = JSON.parse(props.sources || "[]"); return Array.isArray(value) ? value.filter((item) => item && item.id && item.title) : []; } catch { return []; }
});
function domainOf(source: SourceItem) {
  if (source.domain) return source.domain;
  try { return source.url ? new URL(source.url).hostname.replace(/^www\./, "") : ""; } catch { return ""; }
}
function select(source: SourceItem) { emit("select", source.id); }
</script>

<template>
  <aside :class="{ compact }" :aria-label="label">
    <header><div><IconGlyph name="book" :size="17" /><strong>{{ title }}</strong></div><span>{{ items.length }}</span></header>
    <ol v-if="items.length">
      <li v-for="(source,index) in items" :key="source.id" :class="{ selected: source.id === selected }">
        <button type="button" :aria-pressed="source.id === selected" @click="select(source)">
          <span class="index">{{ index + 1 }}</span>
          <span class="copy"><strong>{{ source.title }}</strong><small v-if="domainOf(source)">{{ domainOf(source) }}</small><p v-if="source.snippet">{{ source.snippet }}</p></span>
          <IconGlyph name="chevron-right" :size="15" />
        </button>
      </li>
    </ol>
    <p v-else class="empty"><slot>No sources attached.</slot></p>
  </aside>
</template>

<style>
:host { display: block; color: var(--osx-text); font-family: var(--osx-font); }
aside { overflow: hidden; border: 1px solid var(--osx-border-soft); border-radius: 8px; background: var(--osx-surface-raised); }
header { min-height: 43px; display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 8px 11px; border-bottom: 1px solid var(--osx-border-soft); background: linear-gradient(var(--osx-surface-raised),var(--osx-surface)); }header div { display: flex; gap: 8px; align-items: center; color: var(--osx-accent-ink); }header strong { color: var(--osx-text); font-size: 13px; }header > span { min-width: 27px; padding: 2px 7px; border: 1px solid var(--osx-border); border-radius: 999px; color: var(--osx-muted); background: var(--osx-surface-sunken); font-size: 12px; font-weight: 700; text-align: center; }
ol { margin: 0; padding: 0; list-style: none; }li + li { border-top: 1px solid var(--osx-border-soft); }button { width: 100%; min-height: 68px; display: grid; grid-template-columns: auto minmax(0,1fr) auto; gap: 9px; align-items: start; padding: 10px 11px; border: 0; color: var(--osx-text); background: transparent; font-family: var(--osx-font); text-align: left; cursor: pointer; }button:hover { background: color-mix(in srgb,var(--osx-accent) 8%,transparent); }button:focus-visible { outline: 3px solid var(--osx-focus); outline-offset: -3px; }.selected button { background: color-mix(in srgb,var(--osx-accent) 13%,transparent); }.index { width: 24px; height: 24px; display: grid; place-items: center; border: 1px solid var(--osx-border); border-radius: 50%; color: var(--osx-accent-ink); background: var(--osx-surface-sunken); font-size: 12px; font-weight: 800; }.copy { min-width: 0; display: grid; gap: 3px; }.copy strong { font-size: 13px; line-height: 1.35; }.copy small { color: var(--osx-accent-ink); font-size: 12px; }.copy p { display: -webkit-box; margin: 2px 0 0; overflow: hidden; color: var(--osx-muted); font-size: 12px; line-height: 1.45; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }.empty { margin: 0; padding: 22px 12px; color: var(--osx-muted); font-size: 12px; text-align: center; }.compact .copy p { display: none; }.compact button { min-height: 48px; align-items: center; }
</style>
