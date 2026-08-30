<script setup lang="ts">
import { computed, ref, watch } from "vue";
import IconGlyph from "./IconGlyph.vue";

export type DataTableColumn = {
  key: string;
  label: string;
  align?: "left" | "center" | "right";
  sortable?: boolean;
  searchable?: boolean;
  width?: string;
};
export type DataTableRow = Record<string, string | number | boolean | null | undefined>;
type Direction = "ascending" | "descending";
type RowEntry = { row: DataTableRow; key: string; sourceIndex: number };

const props = withDefaults(defineProps<{
  columns?: string | DataTableColumn[];
  rows?: string | DataTableRow[];
  caption?: string;
  label?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  query?: string;
  compact?: boolean;
  striped?: boolean;
  stickyHeader?: boolean;
  loading?: boolean;
  loadingLabel?: string;
  sortKey?: string;
  sortDirection?: Direction;
  page?: number;
  pageSize?: number;
  pageSizes?: string | number[];
  serverMode?: boolean;
  totalRows?: number;
  selectable?: boolean;
  selectedKeys?: string | Array<string | number>;
  rowKey?: string;
  activatable?: boolean;
  emptyMessage?: string;
  noResultsMessage?: string;
}>(), {
  columns: () => [], rows: () => [], caption: "", label: "Data table", searchable: true,
  searchPlaceholder: "Search rows…", query: "", compact: false, striped: true, stickyHeader: false,
  loading: false, loadingLabel: "Loading rows", sortKey: "", sortDirection: "ascending", page: 1,
  pageSize: 10, pageSizes: "10,25,50", serverMode: false, totalRows: 0, selectable: false,
  selectedKeys: () => [], rowKey: "id", activatable: false, emptyMessage: "No rows to display",
  noResultsMessage: "No matching rows",
});

const emit = defineEmits<{
  search: [query: string];
  sort: [key: string, direction: Direction];
  "page-change": [page: number];
  "page-size-change": [pageSize: number];
  "selection-change": [keys: string[]];
  "row-activate": [row: DataTableRow, sourceIndex: number];
}>();

function parseArray<T>(value: string | T[], fallback: T[]): T[] {
  if (Array.isArray(value)) return value;
  try { const parsed = JSON.parse(value || "[]"); return Array.isArray(parsed) ? parsed : fallback; }
  catch { return fallback; }
}
function parseNumberList(value: string | number[]): number[] {
  const values = Array.isArray(value) ? value : value.split(",");
  const parsed = values.map(Number).filter((item) => Number.isInteger(item) && item > 0);
  return [...new Set(parsed.length ? parsed : [10, 25, 50])].sort((a, b) => a - b);
}
function parseKeys(value: string | Array<string | number>): string[] {
  if (Array.isArray(value)) return value.map(String);
  try { const parsed = JSON.parse(value || "[]"); if (Array.isArray(parsed)) return parsed.map(String); }
  catch { /* A comma-delimited attribute remains a valid convenience form. */ }
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

const parsedColumns = computed(() => parseArray<DataTableColumn>(props.columns, []));
const parsedRows = computed(() => parseArray<DataTableRow>(props.rows, []));
const availablePageSizes = computed(() => parseNumberList(props.pageSizes));
const localQuery = ref(props.query);
const currentKey = ref(props.sortKey);
const currentDirection = ref<Direction>(props.sortDirection);
const currentPage = ref(Math.max(1, props.page));
const currentPageSize = ref(Math.max(1, props.pageSize));
const currentSelection = ref<string[]>(parseKeys(props.selectedKeys));

watch(() => props.query, (value) => { localQuery.value = value; });
watch(() => props.sortKey, (value) => { currentKey.value = value; });
watch(() => props.sortDirection, (value) => { currentDirection.value = value; });
watch(() => props.page, (value) => { currentPage.value = Math.max(1, value); });
watch(() => props.pageSize, (value) => { currentPageSize.value = Math.max(1, value); });
watch(() => props.selectedKeys, (value) => { currentSelection.value = parseKeys(value); }, { deep: true });

const rowEntries = computed<RowEntry[]>(() => parsedRows.value.map((row, sourceIndex) => ({
  row,
  sourceIndex,
  key: String(row[props.rowKey] ?? sourceIndex),
})));
const matchingRows = computed(() => {
  if (props.serverMode || !props.searchable || !localQuery.value.trim()) return rowEntries.value;
  const query = localQuery.value.trim().toLocaleLowerCase();
  const keys = parsedColumns.value.filter((column) => column.searchable !== false).map((column) => column.key);
  return rowEntries.value.filter(({ row }) => keys.some((key) => String(row[key] ?? "").toLocaleLowerCase().includes(query)));
});
const sortedRows = computed(() => {
  if (props.serverMode || !currentKey.value) return matchingRows.value;
  const direction = currentDirection.value === "ascending" ? 1 : -1;
  const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });
  return [...matchingRows.value].sort((left, right) => collator.compare(String(left.row[currentKey.value] ?? ""), String(right.row[currentKey.value] ?? "")) * direction);
});
const total = computed(() => props.serverMode ? Math.max(props.totalRows, parsedRows.value.length) : sortedRows.value.length);
const pageCount = computed(() => Math.max(1, Math.ceil(total.value / currentPageSize.value)));
watch(pageCount, (value) => { if (currentPage.value > value) currentPage.value = value; });
const displayedRows = computed(() => {
  if (props.serverMode) return sortedRows.value;
  const start = (currentPage.value - 1) * currentPageSize.value;
  return sortedRows.value.slice(start, start + currentPageSize.value);
});
const rangeStart = computed(() => total.value ? (currentPage.value - 1) * currentPageSize.value + 1 : 0);
const rangeEnd = computed(() => total.value ? Math.min(rangeStart.value + displayedRows.value.length - 1, total.value) : 0);
const selectedSet = computed(() => new Set(currentSelection.value));
const selectedOnPage = computed(() => displayedRows.value.filter((entry) => selectedSet.value.has(entry.key)).length);
const allOnPageSelected = computed(() => displayedRows.value.length > 0 && selectedOnPage.value === displayedRows.value.length);
const someOnPageSelected = computed(() => selectedOnPage.value > 0 && !allOnPageSelected.value);

function updateQuery(event: Event) {
  localQuery.value = (event.target as HTMLInputElement).value;
  if (currentPage.value !== 1) currentPage.value = 1;
  emit("search", localQuery.value);
  emit("page-change", 1);
}
function clearQuery() {
  localQuery.value = "";
  currentPage.value = 1;
  emit("search", "");
  emit("page-change", 1);
}
function sort(column: DataTableColumn) {
  if (!column.sortable || props.loading) return;
  currentDirection.value = currentKey.value === column.key && currentDirection.value === "ascending" ? "descending" : "ascending";
  currentKey.value = column.key;
  currentPage.value = 1;
  emit("sort", column.key, currentDirection.value);
  emit("page-change", 1);
}
function setPage(nextPage: number) {
  const page = Math.min(Math.max(1, nextPage), pageCount.value);
  if (page === currentPage.value) return;
  currentPage.value = page;
  emit("page-change", page);
}
function setPageSize(event: Event) {
  const size = Math.max(1, Number((event.target as HTMLSelectElement).value));
  currentPageSize.value = size;
  currentPage.value = 1;
  emit("page-size-change", size);
  emit("page-change", 1);
}
function emitSelection(next: Set<string>) {
  currentSelection.value = [...next];
  emit("selection-change", currentSelection.value);
}
function toggleRow(entry: RowEntry) {
  const next = new Set(currentSelection.value);
  next.has(entry.key) ? next.delete(entry.key) : next.add(entry.key);
  emitSelection(next);
}
function togglePage() {
  const next = new Set(currentSelection.value);
  if (allOnPageSelected.value) displayedRows.value.forEach((entry) => next.delete(entry.key));
  else displayedRows.value.forEach((entry) => next.add(entry.key));
  emitSelection(next);
}
function activate(entry: RowEntry) { if (props.activatable && !props.loading) emit("row-activate", entry.row, entry.sourceIndex); }
function activateFromKeyboard(event: KeyboardEvent, entry: RowEntry) {
  if (!props.activatable || !["Enter", " "].includes(event.key)) return;
  event.preventDefault();
  activate(entry);
}
</script>

<template>
  <section class="data-table" :class="{ compact, striped, sticky: stickyHeader, loading }" role="region" :aria-label="label" :aria-busy="loading || undefined">
    <header class="toolbar">
      <div class="title"><strong>{{ caption || label }}</strong><span>{{ total }} row{{ total === 1 ? "" : "s" }}</span></div>
      <slot name="actions"></slot>
      <label v-if="searchable" class="search">
        <span class="visually-hidden">Search {{ label }}</span>
        <IconGlyph name="search" :size="16" />
        <input type="search" :value="localQuery" :placeholder="searchPlaceholder" :disabled="loading" @input="updateQuery" />
        <button v-if="localQuery" type="button" aria-label="Clear search" :disabled="loading" @click="clearQuery"><IconGlyph name="close" :size="15" /></button>
      </label>
    </header>

    <div class="table-scroll" tabindex="0">
      <table>
        <caption class="visually-hidden">{{ caption || label }}</caption>
        <thead><tr>
          <th v-if="selectable" class="select-cell" scope="col">
            <label class="check"><span class="visually-hidden">Select all rows on this page</span><input type="checkbox" :checked="allOnPageSelected" :disabled="loading || !displayedRows.length" :aria-checked="someOnPageSelected ? 'mixed' : allOnPageSelected" @change="togglePage" /><span aria-hidden="true"><IconGlyph v-if="someOnPageSelected" name="minus" :size="11" :stroke-width="2.6" /><IconGlyph v-else-if="allOnPageSelected" name="check" :size="11" :stroke-width="2.6" /></span></label>
          </th>
          <th v-for="column in parsedColumns" :key="column.key" scope="col" :style="{ width: column.width, textAlign: column.align || 'left' }" :aria-sort="currentKey === column.key ? currentDirection : undefined">
            <button v-if="column.sortable" type="button" :disabled="loading" @click="sort(column)"><span>{{ column.label }}</span><span class="sort" :class="{ inactive: currentKey !== column.key }" aria-hidden="true"><IconGlyph :name="currentKey === column.key && currentDirection === 'ascending' ? 'chevron-up' : 'chevron-down'" :size="13" :stroke-width="2.5" /></span></button>
            <span v-else>{{ column.label }}</span>
          </th>
        </tr></thead>
        <tbody>
          <tr v-for="entry in displayedRows" :key="entry.key" :class="{ activatable, selected: selectedSet.has(entry.key) }" :tabindex="activatable ? 0 : undefined" :aria-selected="selectable ? selectedSet.has(entry.key) : undefined" @dblclick="activate(entry)" @keydown="activateFromKeyboard($event, entry)">
            <td v-if="selectable" class="select-cell"><label class="check"><span class="visually-hidden">Select row {{ entry.sourceIndex + 1 }}</span><input type="checkbox" :checked="selectedSet.has(entry.key)" :disabled="loading" @click.stop @change="toggleRow(entry)" /><span aria-hidden="true"><IconGlyph v-if="selectedSet.has(entry.key)" name="check" :size="11" :stroke-width="2.6" /></span></label></td>
            <td v-for="column in parsedColumns" :key="column.key" :style="{ textAlign: column.align || 'left' }"><slot :name="`cell-${column.key}`" :row="entry.row" :value="entry.row[column.key]">{{ entry.row[column.key] }}</slot></td>
          </tr>
          <tr v-if="loading"><td class="state" :colspan="Math.max(parsedColumns.length + (selectable ? 1 : 0), 1)"><span class="spinner" aria-hidden="true"></span><span role="status">{{ loadingLabel }}</span></td></tr>
          <tr v-else-if="!displayedRows.length"><td class="state" :colspan="Math.max(parsedColumns.length + (selectable ? 1 : 0), 1)"><slot name="empty"><IconGlyph :name="localQuery ? 'search' : 'inbox'" :size="22" /><strong>{{ localQuery ? noResultsMessage : emptyMessage }}</strong><button v-if="localQuery" type="button" @click="clearQuery">Clear search</button></slot></td></tr>
        </tbody>
      </table>
    </div>

    <footer class="pagination">
      <label class="page-size"><span>Rows per page</span><select :value="currentPageSize" :disabled="loading" @change="setPageSize"><option v-for="size in availablePageSizes" :key="size" :value="size">{{ size }}</option></select></label>
      <span class="range" aria-live="polite">{{ rangeStart }}–{{ rangeEnd }} of {{ total }}</span>
      <nav aria-label="Table pagination"><button type="button" aria-label="Previous page" :disabled="loading || currentPage <= 1" @click="setPage(currentPage - 1)"><IconGlyph name="chevron-left" :size="17" /></button><span>Page {{ currentPage }} of {{ pageCount }}</span><button type="button" aria-label="Next page" :disabled="loading || currentPage >= pageCount" @click="setPage(currentPage + 1)"><IconGlyph name="chevron-right" :size="17" /></button></nav>
    </footer>
  </section>
</template>

<style>
:host { display: block; min-width: 0; color: var(--osx-text); font-family: var(--osx-font); }
.data-table { max-width: 100%; overflow: hidden; border: 1px solid var(--osx-border); border-radius: 9px; background: var(--osx-surface); box-shadow: 0 1px var(--osx-highlight) inset, 0 2px 6px rgba(0,0,0,.08); }
.toolbar { min-height: 54px; display: flex; gap: 12px; align-items: center; padding: 9px 11px; border-bottom: 1px solid var(--osx-border); background: linear-gradient(var(--osx-surface-raised),var(--osx-surface-sunken)); }.title { min-width: 0; display: grid; margin-right: auto; }.title strong { overflow: hidden; font-size: 13px; text-overflow: ellipsis; white-space: nowrap; }.title span { color: var(--osx-muted); font-size: 12px; }
.search { width: min(280px,42%); min-height: 33px; display: flex; gap: 8px; align-items: center; padding: 0 9px; border: 1px solid var(--osx-border); border-radius: 17px; color: var(--osx-muted); background: var(--osx-surface-raised); box-shadow: 0 1px 3px rgba(25,43,54,.16) inset, 0 1px var(--osx-highlight); }.search:focus-within { border-color: var(--osx-accent); outline: 3px solid var(--osx-focus); }.search input { width: 100%; min-width: 0; padding: 6px 0; border: 0; outline: 0; color: var(--osx-text); background: transparent; font: 13px/1.3 var(--osx-font); }.search input::placeholder { color: var(--osx-muted); }.search button { width: 24px; height: 24px; flex: 0 0 auto; display: grid; place-items: center; padding: 0; border: 0; border-radius: 50%; color: var(--osx-muted); background: transparent; cursor: pointer; }.search button:hover { color: var(--osx-text); background: var(--osx-surface-sunken); }
.table-scroll { max-width: 100%; overflow: auto; }.table-scroll:focus-visible { outline: 3px solid var(--osx-focus); outline-offset: -3px; }table { width: 100%; min-width: 560px; border-collapse: separate; border-spacing: 0; font-size: 12px; }th { padding: 8px 11px; border-bottom: 1px solid var(--osx-border); color: var(--osx-muted); background: color-mix(in srgb,var(--osx-surface-sunken) 78%,var(--osx-surface-raised)); font-weight: 800; white-space: nowrap; }th + th, td + td { border-left: 1px solid var(--osx-border-soft); }th button { width: 100%; min-height: 24px; display: inline-flex; gap: 8px; align-items: center; justify-content: space-between; padding: 0; border: 0; color: inherit; background: transparent; font: inherit; cursor: pointer; }th button:focus-visible { border-radius: 3px; outline: 3px solid var(--osx-focus); outline-offset: 1px; }.sort { min-width: 13px; display: inline-grid; place-items: center; color: var(--osx-accent-ink); }.sort.inactive { color: var(--osx-muted); opacity: .55; }
td { max-width: 420px; padding: 9px 11px; border-bottom: 1px solid var(--osx-border-soft); overflow-wrap: anywhere; }tbody tr:last-child td { border-bottom: 0; }.striped tbody tr:nth-child(even):not(.selected) { background: color-mix(in srgb,var(--osx-accent) 4%,transparent); }.compact th,.compact td { padding-block: 6px; }.sticky thead { position: sticky; top: 0; z-index: 2; }.activatable { cursor: pointer; }.activatable:hover,.activatable:focus-visible { outline: 0; background: color-mix(in srgb,var(--osx-accent) 9%,transparent); }.selected { background: color-mix(in srgb,var(--osx-accent) 15%,transparent); }
.select-cell { width: 42px; max-width: 42px; padding-inline: 12px; text-align: center; }.check { display: inline-grid; place-items: center; cursor: pointer; }.check input { width: 1px; height: 1px; position: absolute; opacity: 0; }.check > span:last-child { width: 15px; height: 15px; display: grid; place-items: center; border: 1px solid var(--osx-border); border-radius: 4px; color: white; background: linear-gradient(var(--osx-surface-raised),var(--osx-surface-sunken)); box-shadow: 0 1px var(--osx-highlight) inset; }.check input:checked + span,.check input[aria-checked="mixed"] + span { border-color: color-mix(in srgb,var(--osx-accent) 80%,#123); background: linear-gradient(var(--osx-accent-light),var(--osx-accent)); }.check input:focus-visible + span { outline: 3px solid var(--osx-focus); outline-offset: 2px; }
.state { height: 150px; color: var(--osx-muted); text-align: center; }.state > * { vertical-align: middle; }.state strong { display: block; margin-top: 8px; color: var(--osx-text); font-size: 13px; }.state button { margin-top: 10px; padding: 5px 10px; border: 1px solid var(--osx-border); border-radius: 6px; color: var(--osx-text); background: linear-gradient(var(--osx-surface-raised),var(--osx-surface-sunken)); font: 700 12px var(--osx-font); cursor: pointer; }.spinner { width: 16px; height: 16px; display: inline-block; margin-right: 8px; border: 2px solid var(--osx-muted); border-right-color: var(--osx-accent); border-radius: 50%; animation: spin .7s linear infinite; }
.pagination { min-height: 47px; display: grid; grid-template-columns: 1fr auto 1fr; gap: 12px; align-items: center; padding: 7px 11px; border-top: 1px solid var(--osx-border); background: var(--osx-surface-sunken); color: var(--osx-muted); font-size: 12px; }.page-size { display: flex; gap: 7px; align-items: center; }.page-size select { min-height: 29px; padding: 4px 24px 4px 7px; border: 1px solid var(--osx-border); border-radius: 6px; color: var(--osx-text); background: var(--osx-surface-raised); font: 700 12px var(--osx-font); }.range { text-align: center; }.pagination nav { display: flex; gap: 8px; align-items: center; justify-content: end; }.pagination nav button { width: 30px; height: 30px; display: grid; place-items: center; padding: 0; border: 1px solid var(--osx-border); border-radius: 6px; color: var(--osx-text); background: linear-gradient(var(--osx-surface-raised),var(--osx-surface-sunken)); cursor: pointer; }.pagination button:focus-visible,.page-size select:focus-visible,.state button:focus-visible,.search button:focus-visible { outline: 3px solid var(--osx-focus); outline-offset: 2px; }.pagination button:disabled,.page-size select:disabled,.search button:disabled { opacity: .48; cursor: not-allowed; }
.visually-hidden { width: 1px; height: 1px; position: absolute; overflow: hidden; clip: rect(0 0 0 0); clip-path: inset(50%); white-space: nowrap; }
@keyframes spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .spinner { animation: none; } }
@media (max-width: 620px) { .toolbar { align-items: stretch; flex-direction: column; }.search { width: 100%; }.pagination { grid-template-columns: 1fr auto; }.page-size { grid-column: 1/-1; justify-content: space-between; }.range { text-align: left; }.pagination nav { justify-content: end; } }
</style>
