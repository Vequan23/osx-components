<script setup lang="ts">
import { computed, ref, watch } from "vue";
import IconGlyph from "./IconGlyph.vue";
import type { OsxIconName } from "../icons";
type TreeNode = { name: string; path: string; directory: boolean; children: TreeNode[] };
type TreeRow = TreeNode & { depth: number };
const props = withDefaults(defineProps<{
  files?: string;
  selected?: string;
  statuses?: string;
  label?: string;
  filterable?: boolean;
}>(), { files: "", selected: "", statuses: "{}", label: "Repository files", filterable: true });
const emit = defineEmits<{ select: [path: string]; toggle: [path: string, open: boolean] }>();
const current = ref(props.selected);
const query = ref("");
const collapsed = ref(new Set<string>());
watch(() => props.selected, (selected) => { current.value = selected; });
const statusMap = computed<Record<string,string>>(() => { try { return JSON.parse(props.statuses || "{}"); } catch { return {}; } });
const roots = computed<TreeNode[]>(() => {
  const root: TreeNode = { name: "", path: "", directory: true, children: [] };
  const paths = props.files.split(/[\n,]+/).map((path) => path.trim()).filter(Boolean);
  for (const path of paths) {
    let parent = root;
    const parts = path.split("/").filter(Boolean);
    parts.forEach((part,index) => {
      const nodePath = parts.slice(0,index + 1).join("/");
      let node = parent.children.find((child) => child.name === part);
      if (!node) { node = { name: part, path: nodePath, directory: index < parts.length - 1, children: [] }; parent.children.push(node); }
      parent = node;
    });
  }
  const sort = (nodes: TreeNode[]) => nodes.sort((a,b) => Number(b.directory) - Number(a.directory) || a.name.localeCompare(b.name)).forEach((node) => sort(node.children));
  sort(root.children);
  return root.children;
});
function matches(node: TreeNode): boolean { const value = query.value.trim().toLowerCase(); return !value || node.path.toLowerCase().includes(value) || node.children.some(matches); }
const rows = computed<TreeRow[]>(() => {
  const result: TreeRow[] = [];
  const visit = (nodes: TreeNode[], depth: number) => nodes.forEach((node) => {
    if (!matches(node)) return;
    result.push({ ...node, depth });
    if (node.directory && (!collapsed.value.has(node.path) || query.value)) visit(node.children,depth + 1);
  });
  visit(roots.value,0);
  return result;
});
function activate(node: TreeNode) {
  if (node.directory) {
    const next = new Set(collapsed.value);
    const open = next.has(node.path);
    open ? next.delete(node.path) : next.add(node.path);
    collapsed.value = next;
    emit("toggle",node.path,open);
    return;
  }
  current.value = node.path;
  emit("select",node.path);
}
function fileIcon(node: TreeNode): OsxIconName {
  if (node.directory) return collapsed.value.has(node.path) ? "folder" : "folder-open";
  if (/\.(?:ts|tsx|js|jsx|vue|css|html|java|py|go|rs|rb|php)$/i.test(node.name)) return "file-code";
  if (/\.(?:md|txt|json|ya?ml|toml|xml)$/i.test(node.name)) return "file-text";
  return "file";
}
</script>

<template>
  <section :aria-label="label" class="tree">
    <label v-if="filterable" class="filter"><IconGlyph class="filter-icon" name="search" :size="16" /><input v-model="query" type="search" placeholder="Filter files" aria-label="Filter files" /></label>
    <div class="rows" role="tree" :aria-label="label">
      <button v-for="node in rows" :key="node.path" type="button" role="treeitem" :title="node.path" :aria-level="node.depth + 1" :aria-expanded="node.directory ? !collapsed.has(node.path) : undefined" :aria-selected="!node.directory ? node.path === current : undefined" :class="[{ selected: node.path === current }, node.directory ? 'directory' : 'file']" :style="{ '--depth': node.depth }" @click="activate(node)"><IconGlyph class="disclosure" :name="node.directory ? (collapsed.has(node.path) ? 'chevron-right' : 'chevron-down') : 'circle'" :size="node.directory ? 14 : 5" /><IconGlyph class="file-icon" :name="fileIcon(node)" :size="16" /><strong>{{ node.name }}</strong><b v-if="statusMap[node.path]" :class="statusMap[node.path].toLowerCase()">{{ statusMap[node.path].slice(0,1).toUpperCase() }}</b></button>
      <p v-if="!rows.length">No matching files</p>
    </div>
  </section>
</template>

<style>
:host { display: block; min-width: 0; color: var(--osx-text); font-family: var(--osx-font); }
.tree { min-width: 0; background: var(--osx-surface-sunken); }.filter { min-height: 36px; display: flex; gap: 9px; align-items: center; margin: 12px; padding: 0 10px; border: 1px solid var(--osx-border); border-radius: 8px; background: var(--osx-surface-raised); box-shadow: 0 1px 2px rgba(0,0,0,.1) inset; }.filter-icon { flex: 0 0 auto; color: var(--osx-muted); }input { width: 100%; min-width: 0; height: 34px; padding: 6px 0; border: 0; outline: 0; color: var(--osx-text); background: transparent; font: 12px var(--osx-font); }.filter:focus-within { border-color: var(--osx-accent); outline: 3px solid var(--osx-focus); outline-offset: 1px; }
.rows { display: grid; align-content: start; gap: 1px; padding: 3px 6px 9px; }button { width: 100%; min-width: 0; min-height: 28px; display: grid; grid-template-columns: 13px 16px minmax(0,1fr) auto; gap: 4px; align-items: center; padding: 4px 7px 4px calc(7px + var(--depth) * 13px); border: 0; border-radius: 5px; color: var(--osx-text); background: transparent; font: 600 12px var(--osx-font); text-align: left; cursor: pointer; }button:hover { background: color-mix(in srgb,var(--osx-accent) 9%,transparent); }button.selected { color: white; background: linear-gradient(var(--osx-accent-light),var(--osx-accent)); text-shadow: 0 -1px rgba(0,0,0,.4); }button:focus-visible { outline: 3px solid var(--osx-focus); outline-offset: 0; }.disclosure { color: var(--osx-muted); font-size: 16px; line-height: 1; text-align: center; }.selected .disclosure { color: white; }button i { width: 12px; height: 14px; position: relative; border: 1px solid var(--osx-border); border-radius: 2px; background: var(--osx-surface-raised); }.directory i { height: 10px; border-color: color-mix(in srgb,var(--osx-accent) 72%,var(--osx-border)); background: color-mix(in srgb,var(--osx-accent) 24%,var(--osx-surface-raised)); }.directory i::before { width: 6px; height: 3px; position: absolute; top: -4px; left: -1px; border: 1px solid color-mix(in srgb,var(--osx-accent) 72%,var(--osx-border)); border-bottom: 0; border-radius: 2px 2px 0 0; background: inherit; content: ""; }button strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }button b { font-size: 12px; }.modified { color: var(--osx-warning); }.added { color: var(--osx-success); }.deleted { color: var(--osx-danger); }.selected b { color: white; }.rows > p { padding: 24px 8px; color: var(--osx-muted); font-size: 12px; text-align: center; }
</style>
