<script setup lang="ts">
import { computed, ref } from "vue";
import IconGlyph from "./IconGlyph.vue";

const props = withDefaults(defineProps<{
  title?: string;
  description?: string;
  kind?: "file" | "document" | "code";
  filename?: string;
  version?: string;
  language?: string;
  content?: string;
  href?: string;
  copyable?: boolean;
  downloadable?: boolean;
  openable?: boolean;
  status?: "draft" | "ready" | "updated";
}>(), {
  title: "Generated artifact",
  description: "",
  kind: "file",
  filename: "artifact.txt",
  version: "",
  language: "",
  content: "",
  href: "",
  copyable: true,
  downloadable: true,
  openable: false,
  status: "ready",
});
const emit = defineEmits<{ copy: [content: string]; download: [filename: string]; open: [href: string] }>();
const copied = ref(false);
const icon = computed(() => props.kind === "code" ? "file-code" : props.kind === "document" ? "file-text" : "file");
async function copyArtifact() {
  if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(props.content);
  else {
    const field = document.createElement("textarea"); field.value = props.content; field.style.position = "fixed"; field.style.opacity = "0"; document.body.append(field); field.select(); document.execCommand("copy"); field.remove();
  }
  copied.value = true; emit("copy", props.content); window.setTimeout(() => { copied.value = false; }, 1600);
}
function downloadArtifact() {
  const url = URL.createObjectURL(new Blob([props.content], { type: "text/plain;charset=utf-8" }));
  const anchor = document.createElement("a"); anchor.href = url; anchor.download = props.filename || "artifact.txt"; anchor.click(); URL.revokeObjectURL(url);
  emit("download", anchor.download);
}
function openArtifact() {
  emit("open", props.href);
  if (props.href) window.open(props.href, "_blank", "noopener,noreferrer");
}
</script>

<template>
  <article :aria-label="`${title} artifact`">
    <header>
      <span class="icon"><IconGlyph :name="icon" :size="20" /></span>
      <span class="identity"><strong>{{ title }}</strong><small v-if="description">{{ description }}</small><code v-else-if="filename">{{ filename }}</code></span>
      <span class="metadata"><b v-if="version">{{ version }}</b><i>{{ status }}</i></span>
    </header>
    <div class="preview" :class="kind"><slot><pre v-if="content"><code>{{ content }}</code></pre><p v-else>No preview available.</p></slot></div>
    <footer>
      <span><code>{{ filename }}</code><small v-if="language">{{ language }}</small></span>
      <div>
        <button v-if="copyable" type="button" :aria-label="`Copy ${title}`" @click="copyArtifact"><IconGlyph :name="copied ? 'check' : 'copy'" :size="14" />{{ copied ? "Copied" : "Copy" }}</button>
        <button v-if="downloadable" type="button" :aria-label="`Download ${filename}`" @click="downloadArtifact"><IconGlyph name="download" :size="14" />Download</button>
        <button v-if="openable" type="button" :aria-label="`Open ${title}`" @click="openArtifact"><IconGlyph name="external" :size="14" />Open</button>
      </div>
    </footer>
  </article>
</template>

<style>
:host { display: block; min-width: 0; color: var(--osx-text); font-family: var(--osx-font); }
article { min-width: 0; overflow: hidden; border: 1px solid var(--osx-border); border-radius: 9px; background: var(--osx-surface-raised); box-shadow: 0 1px var(--osx-highlight) inset,0 2px 7px rgba(0,0,0,.1); }
header { min-height: 61px; display: grid; grid-template-columns: auto minmax(0,1fr) auto; gap: 11px; align-items: center; padding: 10px 12px; border-bottom: 1px solid var(--osx-border-soft); background: linear-gradient(var(--osx-surface-raised),var(--osx-surface)); }.icon { width: 36px; height: 36px; display: grid; place-items: center; border: 1px solid var(--osx-border); border-radius: 7px; color: var(--osx-accent-ink); background: var(--osx-surface-sunken); }.identity { min-width: 0; display: grid; gap: 3px; }.identity strong { overflow: hidden; font-size: 13px; text-overflow: ellipsis; white-space: nowrap; }.identity small,.identity code { overflow: hidden; color: var(--osx-muted); font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }.identity code { font-family: ui-monospace,monospace; }.metadata { display: grid; justify-items: end; gap: 3px; }.metadata b,.metadata i { color: var(--osx-muted); font-size: 12px; font-style: normal; }.metadata i { text-transform: capitalize; }.metadata b { padding: 2px 7px; border: 1px solid var(--osx-border); border-radius: 999px; background: var(--osx-surface-sunken); }
.preview { min-height: 84px; max-height: 320px; overflow: auto; padding: 14px; color: var(--osx-muted); background: var(--osx-surface-sunken); font-size: 13px; line-height: 1.55; }.preview pre { margin: 0; color: var(--osx-text); font: 12px/1.55 ui-monospace,SFMono-Regular,Menlo,monospace; white-space: pre-wrap; overflow-wrap: anywhere; }.preview p { margin: 0; }.preview.document { background: color-mix(in srgb,var(--osx-surface-raised) 88%,var(--osx-surface)); }
footer { min-height: 45px; display: flex; gap: 12px; align-items: center; justify-content: space-between; padding: 7px 9px 7px 12px; border-top: 1px solid var(--osx-border-soft); }.preview + footer > span { min-width: 0; display: flex; gap: 8px; align-items: center; }.preview + footer code { overflow: hidden; font: 12px ui-monospace,monospace; text-overflow: ellipsis; white-space: nowrap; }.preview + footer small { color: var(--osx-muted); font-size: 12px; }.preview + footer div { display: flex; gap: 5px; }
button { min-height: 29px; display: inline-flex; gap: 5px; align-items: center; padding: 4px 8px; border: 1px solid var(--osx-border); border-radius: 6px; color: var(--osx-text); background: linear-gradient(var(--osx-surface-raised),var(--osx-surface-sunken)); font: 700 12px var(--osx-font); cursor: pointer; }button:hover { border-color: var(--osx-accent); }button:focus-visible { outline: 3px solid var(--osx-focus); outline-offset: 1px; }
@media (max-width: 540px) { footer { align-items: stretch; flex-direction: column; }.preview + footer div { display: grid; grid-template-columns: repeat(3,1fr); }button { justify-content: center; }.metadata i { display: none; } }
</style>
