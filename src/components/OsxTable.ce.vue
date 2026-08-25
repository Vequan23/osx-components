<script setup lang="ts">
import { computed, ref, watch } from "vue";
import IconGlyph from "./IconGlyph.vue";

export type TableColumn = { key: string; label: string; align?: "left" | "center" | "right"; sortable?: boolean; width?: string };
export type TableRow = Record<string, string | number | boolean | null | undefined>;
const props = withDefaults(defineProps<{
  columns?: string | TableColumn[];
  rows?: string | TableRow[];
  caption?: string;
  label?: string;
  compact?: boolean;
  striped?: boolean;
  stickyHeader?: boolean;
  sortKey?: string;
  sortDirection?: "ascending" | "descending";
  emptyMessage?: string;
}>(), { columns: () => [], rows: () => [], caption: "", label: "Data table", compact: false, striped: false, stickyHeader: false, sortKey: "", sortDirection: "ascending", emptyMessage: "No rows to display" });
const emit = defineEmits<{ sort: [key: string, direction: "ascending" | "descending"] }>();
function parse<T>(value: string | T[], fallback: T[]): T[] { if (Array.isArray(value)) return value; try { const parsed = JSON.parse(value || "[]"); return Array.isArray(parsed) ? parsed : fallback; } catch { return fallback; } }
const parsedColumns = computed(() => parse<TableColumn>(props.columns, []));
const parsedRows = computed(() => parse<TableRow>(props.rows, []));
const currentKey = ref(props.sortKey);
const currentDirection = ref<"ascending" | "descending">(props.sortDirection);
watch(() => props.sortKey, (value) => { currentKey.value = value; });
watch(() => props.sortDirection, (value) => { currentDirection.value = value; });
const sortedRows = computed(() => {
  if (!currentKey.value) return parsedRows.value;
  const direction = currentDirection.value === "ascending" ? 1 : -1;
  return [...parsedRows.value].sort((a, b) => String(a[currentKey.value] ?? "").localeCompare(String(b[currentKey.value] ?? ""), undefined, { numeric: true }) * direction);
});
function sort(column: TableColumn) {
  if (!column.sortable) return;
  currentDirection.value = currentKey.value === column.key && currentDirection.value === "ascending" ? "descending" : "ascending";
  currentKey.value = column.key;
  emit("sort", column.key, currentDirection.value);
}
</script>

<template>
  <div class="table-region" :class="{ compact, striped, sticky: stickyHeader }" role="region" :aria-label="label" tabindex="0">
    <table>
      <caption v-if="caption">{{ caption }}</caption>
      <thead><tr><th v-for="column in parsedColumns" :key="column.key" scope="col" :style="{ width: column.width, textAlign: column.align || 'left' }" :aria-sort="currentKey === column.key ? currentDirection : undefined"><button v-if="column.sortable" type="button" @click="sort(column)"><span>{{ column.label }}</span><span class="sort" :class="{ inactive: currentKey !== column.key }" aria-hidden="true"><IconGlyph :name="currentKey === column.key && currentDirection === 'ascending' ? 'chevron-up' : 'chevron-down'" :size="13" :stroke-width="2.5" /></span></button><span v-else>{{ column.label }}</span></th></tr></thead>
      <tbody><tr v-for="(row, index) in sortedRows" :key="index"><td v-for="column in parsedColumns" :key="column.key" :style="{ textAlign: column.align || 'left' }"><slot :name="`cell-${column.key}`" :row="row" :value="row[column.key]">{{ row[column.key] }}</slot></td></tr><tr v-if="!sortedRows.length"><td class="empty" :colspan="Math.max(parsedColumns.length, 1)"><slot name="empty">{{ emptyMessage }}</slot></td></tr></tbody>
    </table>
  </div>
</template>

<style>
:host { display: block; min-width: 0; color: var(--osx-text); font-family: var(--osx-font); }.table-region { max-width: 100%; overflow: auto; border: 1px solid var(--osx-border); border-radius: 8px; background: var(--osx-surface); box-shadow: 0 1px var(--osx-highlight) inset; }.table-region:focus-visible { outline: 3px solid var(--osx-focus); outline-offset: 2px; }table { width: 100%; min-width: 480px; border-collapse: separate; border-spacing: 0; font-size: 12px; }caption { padding: 10px 12px; border-bottom: 1px solid var(--osx-border-soft); font-size: 13px; font-weight: 700; text-align: left; }th { padding: 8px 11px; border-bottom: 1px solid var(--osx-border); color: var(--osx-muted); background: linear-gradient(var(--osx-surface-raised), var(--osx-surface-sunken)); font-weight: 700; white-space: nowrap; }th + th, td + td { border-left: 1px solid var(--osx-border-soft); }th button { width: 100%; display: inline-flex; gap: 8px; align-items: center; justify-content: space-between; padding: 0; border: 0; color: inherit; background: transparent; font: inherit; cursor: pointer; }th button:focus-visible { border-radius: 3px; outline: 3px solid var(--osx-focus); outline-offset: 2px; }.sort { min-width: 13px; display: inline-grid; place-items: center; color: var(--osx-accent); }.sort.inactive { color: var(--osx-muted); opacity: .55; }td { max-width: 360px; padding: 9px 11px; border-bottom: 1px solid var(--osx-border-soft); overflow-wrap: anywhere; }tbody tr:last-child td { border-bottom: 0; }.striped tbody tr:nth-child(even) { background: color-mix(in srgb, var(--osx-accent) 5%, transparent); }.compact th, .compact td { padding-block: 6px; }.sticky thead { position: sticky; top: 0; z-index: 1; }.empty { padding: 24px; color: var(--osx-muted); text-align: center; }
</style>
