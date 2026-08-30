<script setup lang="ts">
import { computed, ref, watch } from "vue";
import IconGlyph from "./IconGlyph.vue";

type DiffLine = { kind: "context" | "add" | "remove" | "hunk"; content: string; oldNumber?: number; newNumber?: number };
type SplitRow = { kind: DiffLine["kind"]; hunk?: string; left?: DiffLine; right?: DiffLine };
const props = withDefaults(defineProps<{
  file?: string;
  patch?: string;
  view?: "unified" | "split";
  language?: string;
  additions?: number;
  deletions?: number;
  label?: string;
}>(), { file: "Untitled", patch: "", view: "unified", language: "text", additions: -1, deletions: -1, label: "Code changes" });
const emit = defineEmits<{ "view-change": [view: "unified" | "split"]; copy: [patch: string] }>();
const currentView = ref(props.view);
watch(() => props.view, (view) => { currentView.value = view; });
const lines = computed<DiffLine[]>(() => {
  let oldNumber = 0;
  let newNumber = 0;
  return props.patch.split("\n").flatMap<DiffLine>((raw): DiffLine[] => {
    if (raw.startsWith("---") || raw.startsWith("+++")) return [];
    const hunk = raw.match(/^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@(.*)$/);
    if (hunk) {
      oldNumber = Number(hunk[1]);
      newNumber = Number(hunk[2]);
      return [{ kind: "hunk" as const, content: raw }];
    }
    if (raw.startsWith("+")) return [{ kind: "add" as const, content: raw.slice(1), newNumber: newNumber++ }];
    if (raw.startsWith("-")) return [{ kind: "remove" as const, content: raw.slice(1), oldNumber: oldNumber++ }];
    return [{ kind: "context" as const, content: raw.startsWith(" ") ? raw.slice(1) : raw, oldNumber: oldNumber++, newNumber: newNumber++ }];
  });
});
const totals = computed(() => ({
  additions: props.additions >= 0 ? props.additions : lines.value.filter((line) => line.kind === "add").length,
  deletions: props.deletions >= 0 ? props.deletions : lines.value.filter((line) => line.kind === "remove").length,
}));
const splitRows = computed<SplitRow[]>(() => {
  const rows: SplitRow[] = [];
  for (let index = 0; index < lines.value.length;) {
    const line = lines.value[index];
    if (line.kind === "hunk") { rows.push({ kind: "hunk", hunk: line.content }); index += 1; continue; }
    if (line.kind === "context") { rows.push({ kind: "context", left: line, right: line }); index += 1; continue; }
    if (line.kind === "remove") {
      const removed: DiffLine[] = [];
      const added: DiffLine[] = [];
      while (lines.value[index]?.kind === "remove") removed.push(lines.value[index++]);
      while (lines.value[index]?.kind === "add") added.push(lines.value[index++]);
      const length = Math.max(removed.length, added.length);
      for (let pair = 0; pair < length; pair += 1) rows.push({ kind: removed[pair] && added[pair] ? "context" : removed[pair] ? "remove" : "add", left: removed[pair], right: added[pair] });
      continue;
    }
    rows.push({ kind: "add", right: line });
    index += 1;
  }
  return rows;
});
function setView(view: "unified" | "split") { currentView.value = view; emit("view-change", view); }
</script>

<template>
  <section :aria-label="label" class="viewer">
    <header><div class="file"><IconGlyph name="file-code" :size="17" /><strong>{{ file }}</strong><small>{{ language }}</small></div><div class="stats"><b>+{{ totals.additions }}</b><i>−{{ totals.deletions }}</i></div><div class="actions"><div class="segments" role="radiogroup" aria-label="Diff layout"><button type="button" role="radio" :aria-checked="currentView === 'unified'" :class="{ active: currentView === 'unified' }" @click="setView('unified')">Unified</button><button type="button" role="radio" :aria-checked="currentView === 'split'" :class="{ active: currentView === 'split' }" @click="setView('split')">Split</button></div><button class="copy" type="button" @click="emit('copy',patch)"><IconGlyph name="copy" :size="14" /> Copy</button></div></header>
    <div v-if="!patch" class="empty">No changes to display</div>
    <div v-else-if="currentView === 'unified'" class="code unified" role="table" aria-label="Unified diff" tabindex="0">
      <div v-for="(line,index) in lines" :key="index" :class="['line',line.kind]" role="row"><span class="number old" role="cell">{{ line.oldNumber ?? '' }}</span><span class="number" role="cell">{{ line.newNumber ?? '' }}</span><span class="marker" aria-hidden="true">{{ line.kind === 'add' ? '+' : line.kind === 'remove' ? '−' : line.kind === 'hunk' ? '••' : '' }}</span><code role="cell">{{ line.content || ' ' }}</code></div>
    </div>
    <div v-else class="code split" role="table" aria-label="Split diff" tabindex="0">
      <div v-for="(row,index) in splitRows" :key="index" :class="['split-row',row.kind]" role="row">
        <template v-if="row.kind === 'hunk'"><code class="hunk-cell" role="cell">{{ row.hunk }}</code></template>
        <template v-else><span class="number" role="cell">{{ row.left?.oldNumber ?? '' }}</span><code :class="{ remove: row.left?.kind === 'remove' }" role="cell">{{ row.left?.content ?? ' ' }}</code><span class="number" role="cell">{{ row.right?.newNumber ?? '' }}</span><code :class="{ add: row.right?.kind === 'add' }" role="cell">{{ row.right?.content ?? ' ' }}</code></template>
      </div>
    </div>
  </section>
</template>

<style>
:host { display: block; min-width: 0; color: var(--osx-text); font-family: var(--osx-font); }
.viewer { min-width: 0; overflow: hidden; border: 1px solid var(--osx-border); border-radius: 8px; background: var(--osx-surface-sunken); }
header { min-height: 43px; display: flex; gap: 12px; align-items: center; padding: 7px 9px; border-bottom: 1px solid var(--osx-border); background: linear-gradient(var(--osx-title-start),var(--osx-title-end)); box-shadow: 0 1px var(--osx-highlight) inset; }
.file { min-width: 0; display: flex; gap: 7px; align-items: center; }.file strong { overflow: hidden; font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }.file small { color: var(--osx-muted); font-size: 12px; }.stats { display: flex; gap: 7px; margin-left: auto; font-size: 12px; }.stats b { color: var(--osx-success); }.stats i { color: var(--osx-danger); font-style: normal; font-weight: 700; }.actions { display: flex; gap: 7px; align-items: center; }
.segments { display: flex; overflow: hidden; border: 1px solid var(--osx-border); border-radius: 6px; }.segments button { border: 0; border-right: 1px solid var(--osx-border); border-radius: 0; }.segments button:last-child { border-right: 0; }.segments button.active { color: white; background: linear-gradient(var(--osx-accent-light),var(--osx-accent)); }
button { min-height: 25px; display: inline-flex; gap: 5px; align-items: center; padding: 3px 8px; border: 1px solid var(--osx-border); border-radius: 6px; color: var(--osx-text); background: linear-gradient(var(--osx-surface-raised),var(--osx-surface-sunken)); font: 700 12px var(--osx-font); cursor: pointer; }button:focus-visible { outline: 3px solid var(--osx-focus); outline-offset: 1px; }
.code { max-height: 360px; overflow: auto; font: 12px/1.55 ui-monospace,SFMono-Regular,Consolas,monospace; }.line { min-width: max-content; display: grid; grid-template-columns: 42px 42px 24px minmax(400px,1fr); }.line > * { padding-block: 2px; }.number { padding-inline: 7px; color: var(--osx-muted); background: color-mix(in srgb,var(--osx-surface-sunken) 86%,transparent); text-align: right; user-select: none; }.marker { text-align: center; user-select: none; }.line code { padding-inline: 8px 18px; white-space: pre; }.line.add,.split code.add { background: color-mix(in srgb,var(--osx-success) 16%,var(--osx-surface)); }.line.remove,.split code.remove { background: color-mix(in srgb,var(--osx-danger) 15%,var(--osx-surface)); }.line.add .marker { color: var(--osx-success); }.line.remove .marker { color: var(--osx-danger); }.line.hunk { grid-template-columns: 42px 42px 24px minmax(400px,1fr); color: var(--osx-accent-ink); background: color-mix(in srgb,var(--osx-accent) 10%,var(--osx-surface)); }
.split-row { min-width: 760px; display: grid; grid-template-columns: 42px minmax(330px,1fr) 42px minmax(330px,1fr); border-bottom: 1px solid color-mix(in srgb,var(--osx-border-soft) 55%,transparent); }.split-row > * { padding-block: 2px; }.split-row code { padding-inline: 8px; white-space: pre; }.hunk-cell { grid-column: 1 / -1; color: var(--osx-accent-ink); background: color-mix(in srgb,var(--osx-accent) 10%,var(--osx-surface)); }.empty { padding: 38px 16px; color: var(--osx-muted); font-size: 12px; text-align: center; }
@media (max-width: 620px) { header { align-items: flex-start; flex-wrap: wrap; }.file { flex: 1 1 180px; }.stats { margin-left: 0; }.actions { width: 100%; justify-content: space-between; }.code { max-height: 300px; } }
</style>
