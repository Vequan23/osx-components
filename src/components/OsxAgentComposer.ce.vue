<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useHost, useId, watch } from "vue";
import type { OsxIconName } from "../icons";
import { emitElementEvent, updateElementState } from "../element-events";
import IconGlyph from "./IconGlyph.vue";

defineOptions({ inheritAttrs: false });

type ComposerState = "idle" | "submitting" | "streaming" | "stopping" | "error";
type ComposerTrigger = "/" | "$" | "@";
type ComposerSuggestion = {
  id: string;
  kind: "command" | "skill" | "file" | "folder" | "tool" | "custom";
  trigger: ComposerTrigger;
  label: string;
  description?: string;
  icon?: OsxIconName;
  badge?: string;
  group?: string;
  keywords?: string[];
  disabled?: boolean;
  disabledReason?: string;
  insertText?: string;
  selectionBehavior?: "insert" | "attach" | "emit";
};
type ComposerOption = {
  id: string;
  label: string;
  description?: string;
  icon?: OsxIconName;
  badge?: string;
  disabled?: boolean;
  disabledReason?: string;
};
type ComposerContextItem = {
  id: string;
  label: string;
  kind?: ComposerSuggestion["kind"];
  description?: string;
  icon?: OsxIconName;
  removable?: boolean;
};
type ComposerAttachment = {
  id: string;
  name: string;
  kind?: "image" | "file";
  mediaType?: string;
  previewUrl?: string;
  status?: "ready" | "loading" | "error";
  progress?: number;
  error?: string;
  removable?: boolean;
  retryable?: boolean;
};
type ControlName = "model" | "reasoning" | "access";
type QueryState = { trigger: ComposerTrigger; query: string; start: number; end: number };
const controlEventNames = { model: "model-change", reasoning: "reasoning-change", access: "access-mode-change" } as const;

const props = withDefaults(defineProps<{
  value?: string;
  placeholder?: string;
  label?: string;
  model?: string;
  reasoning?: string;
  accessMode?: string;
  modelId?: string;
  reasoningId?: string;
  accessModeId?: string;
  models?: ComposerOption[];
  reasoningOptions?: ComposerOption[];
  accessModes?: ComposerOption[];
  suggestions?: ComposerSuggestion[];
  suggestionsLoading?: boolean;
  suggestionsError?: string;
  contextItems?: ComposerContextItem[];
  attachments?: ComposerAttachment[];
  state?: ComposerState;
  statusText?: string;
  error?: string;
  busy?: boolean;
  disabled?: boolean;
  rows?: number;
  maxRows?: number;
  submitShortcut?: "enter" | "mod-enter";
  allowAttachments?: boolean;
  allowVoice?: boolean;
  attachmentAccept?: string;
}>(), {
  value: "",
  placeholder: "Ask anything. @ add context, $ use skills, / run commands.",
  label: "Message to agent",
  model: "",
  reasoning: "",
  accessMode: "",
  modelId: "",
  reasoningId: "",
  accessModeId: "",
  models: () => [],
  reasoningOptions: () => [],
  accessModes: () => [],
  suggestions: () => [],
  suggestionsLoading: false,
  suggestionsError: "",
  contextItems: () => [],
  attachments: () => [],
  state: "idle",
  statusText: "",
  error: "",
  busy: false,
  disabled: false,
  rows: 3,
  maxRows: 10,
  submitShortcut: "enter",
  allowAttachments: true,
  allowVoice: false,
  attachmentAccept: "",
});

const host = useHost();
const instanceId = `osx-composer-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
const textareaId = `${instanceId}-input`;
const paletteId = `${instanceId}-suggestions`;
const statusId = `${instanceId}-status`;
const textarea = ref<HTMLTextAreaElement | null>(null);
const current = ref(props.value);
const currentContext = ref<ComposerContextItem[]>([...props.contextItems]);
const currentAttachments = ref<ComposerAttachment[]>([...props.attachments]);
const queryState = ref<QueryState | null>(null);
const activeSuggestion = ref(0);
const openControl = ref<ControlName | null>(null);
const dragging = ref(false);
const announcement = ref("");
let lastQueryKey = "";
let dismissedQueryKey = "";

const running = computed(() => props.busy || ["submitting", "streaming", "stopping"].includes(props.state));
const canSubmit = computed(() => !props.disabled && !running.value && Boolean(current.value.trim() || currentContext.value.length || currentAttachments.value.length));
const paletteOpen = computed(() => Boolean(queryState.value));
const activeDescendant = computed(() => {
  const item = visibleSuggestions.value[activeSuggestion.value];
  return item ? `${paletteId}-${safeId(item.id)}` : undefined;
});

const visibleSuggestions = computed(() => {
  const active = queryState.value;
  if (!active) return [];
  const query = active.query.toLocaleLowerCase();
  return props.suggestions.filter((item) => {
    if (item.trigger !== active.trigger) return false;
    if (!query) return true;
    return [item.label, item.description, ...(item.keywords ?? [])].filter(Boolean).join(" ").toLocaleLowerCase().includes(query);
  });
});

const suggestionGroups = computed(() => {
  const groups: Array<{ label: string; items: ComposerSuggestion[] }> = [];
  for (const item of visibleSuggestions.value) {
    const label = item.group || suggestionKindLabel(item.kind);
    const currentGroup = groups.at(-1);
    if (!currentGroup || currentGroup.label !== label) groups.push({ label, items: [item] });
    else currentGroup.items.push(item);
  }
  return groups;
});

const selectedModel = computed(() => selectedOption(props.models, props.modelId));
const selectedReasoning = computed(() => selectedOption(props.reasoningOptions, props.reasoningId));
const selectedAccess = computed(() => selectedOption(props.accessModes, props.accessModeId));

watch(() => props.value, (value) => {
  current.value = value;
  void nextTick(resizeTextarea);
});
watch(() => props.contextItems, (items) => { currentContext.value = [...items]; });
watch(() => props.attachments, (items) => { currentAttachments.value = [...items]; });
watch(visibleSuggestions, (items) => {
  activeSuggestion.value = firstEnabledIndex(items);
  if (queryState.value) announceSuggestionCount();
});
watch(() => [props.rows, props.maxRows], () => { void nextTick(resizeTextarea); });

onMounted(() => {
  resizeTextarea();
  document.addEventListener("pointerdown", onDocumentPointerDown);
});
onBeforeUnmount(() => document.removeEventListener("pointerdown", onDocumentPointerDown));

function safeId(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, "-");
}

function suggestionKindLabel(kind: ComposerSuggestion["kind"]): string {
  return ({ command: "Commands", skill: "Skills", file: "Files", folder: "Folders", tool: "Tools", custom: "Suggestions" })[kind];
}

function suggestionIcon(item: ComposerSuggestion): OsxIconName {
  if (item.icon) return item.icon;
  return ({ command: "command", skill: "sparkle", file: "file", folder: "folder", tool: "boxes", custom: "circle" } as const)[item.kind];
}

function contextIcon(item: ComposerContextItem): OsxIconName {
  if (item.icon) return item.icon;
  return ({ command: "command", skill: "sparkle", file: "file", folder: "folder", tool: "boxes", custom: "circle" } as const)[item.kind ?? "custom"];
}

function selectedOption(options: ComposerOption[], id: string): ComposerOption | undefined {
  return options.find((item) => item.id === id) ?? options.find((item) => !item.disabled) ?? options[0];
}

function firstEnabledIndex(items: ComposerSuggestion[]): number {
  const index = items.findIndex((item) => !item.disabled);
  return index < 0 ? 0 : index;
}

function update(event: Event) {
  event.stopPropagation();
  dismissedQueryKey = "";
  current.value = (event.target as HTMLTextAreaElement).value;
  updateElementState(host, "value", current.value);
  emitElementEvent(host, "input", [current.value]);
  resizeTextarea();
  detectQuery();
}

function setCurrentValue(value: string, caret?: number) {
  current.value = value;
  updateElementState(host, "value", value);
  emitElementEvent(host, "input", [value]);
  void nextTick(() => {
    resizeTextarea();
    if (caret !== undefined && textarea.value) textarea.value.setSelectionRange(caret, caret);
  });
}

function resizeTextarea() {
  const field = textarea.value;
  if (!field) return;
  field.style.height = "auto";
  const styles = getComputedStyle(field);
  const lineHeight = Number.parseFloat(styles.lineHeight) || 22;
  const padding = Number.parseFloat(styles.paddingTop) + Number.parseFloat(styles.paddingBottom);
  const maxHeight = Math.max(props.rows, props.maxRows) * lineHeight + padding;
  field.style.height = `${Math.min(field.scrollHeight, maxHeight)}px`;
  field.style.overflowY = field.scrollHeight > maxHeight ? "auto" : "hidden";
}

function detectQuery() {
  const field = textarea.value;
  if (!field || props.disabled) return closePalette();
  const end = field.selectionStart ?? current.value.length;
  const beforeCaret = current.value.slice(0, end);
  const match = beforeCaret.match(/(?:^|\s)([/@$])([^\s/@$]*)$/);
  if (!match) return closePalette();
  const trigger = match[1] as ComposerTrigger;
  const query = match[2] ?? "";
  const start = beforeCaret.lastIndexOf(trigger);
  const fullKey = `${trigger}:${query}:${start}:${end}`;
  if (fullKey === dismissedQueryKey) return;
  const previous = queryState.value;
  if (previous && previous.trigger === trigger && previous.query === query && previous.start === start && previous.end === end) return;
  queryState.value = { trigger, query, start, end };
  const key = `${trigger}:${query}`;
  if (key !== lastQueryKey) {
    lastQueryKey = key;
    emitElementEvent(host, "suggestion-query", [{ trigger, query }]);
  }
}

function closePalette() {
  queryState.value = null;
  activeSuggestion.value = 0;
  lastQueryKey = "";
}

function dismissPalette() {
  const query = queryState.value;
  if (query) dismissedQueryKey = `${query.trigger}:${query.query}:${query.start}:${query.end}`;
  closePalette();
}

function announceSuggestionCount() {
  if (!queryState.value) return;
  if (props.suggestionsLoading) announcement.value = `Loading ${suggestionKindLabelForTrigger(queryState.value.trigger).toLocaleLowerCase()}.`;
  else if (props.suggestionsError) announcement.value = props.suggestionsError;
  else if (!visibleSuggestions.value.length) announcement.value = `No ${suggestionKindLabelForTrigger(queryState.value.trigger).toLocaleLowerCase()} match.`;
  else announcement.value = `${visibleSuggestions.value.length} ${visibleSuggestions.value.length === 1 ? "suggestion" : "suggestions"} available.`;
}

function suggestionKindLabelForTrigger(trigger: ComposerTrigger): string {
  return ({ "/": "Commands", "$": "Skills", "@": "Context items" })[trigger];
}

function moveSuggestion(direction: 1 | -1 | "first" | "last") {
  const items = visibleSuggestions.value;
  if (!items.length) return;
  let index = direction === "first" ? 0 : direction === "last" ? items.length - 1 : activeSuggestion.value;
  for (let attempts = 0; attempts < items.length; attempts += 1) {
    if (typeof direction === "number") index = (index + direction + items.length) % items.length;
    if (!items[index]?.disabled) {
      activeSuggestion.value = index;
      announcement.value = `${items[index]?.label}. ${items[index]?.description ?? ""}`.trim();
      host?.shadowRoot?.getElementById(`${paletteId}-${safeId(items[index]!.id)}`)?.scrollIntoView({ block: "nearest" });
      return;
    }
    if (direction === "first") index = (index + 1) % items.length;
    else if (direction === "last") index = (index - 1 + items.length) % items.length;
  }
}

function chooseSuggestion(item: ComposerSuggestion) {
  const query = queryState.value;
  if (!query || item.disabled) return;
  const behavior = item.selectionBehavior ?? (item.kind === "skill" || item.kind === "file" || item.kind === "folder" ? "attach" : "emit");
  let replacement = "";
  if (behavior === "insert") replacement = item.insertText ?? `${item.trigger}${item.label} `;
  const value = `${current.value.slice(0, query.start)}${replacement}${current.value.slice(query.end)}`;
  const caret = query.start + replacement.length;
  closePalette();
  setCurrentValue(value, caret);
  if (behavior === "attach") addContext(item);
  announcement.value = `${item.label} selected.`;
  emitElementEvent(host, "suggestion-select", [item]);
  void nextTick(() => textarea.value?.focus());
}

function addContext(item: ComposerSuggestion) {
  if (currentContext.value.some((entry) => entry.id === item.id)) return;
  currentContext.value = [...currentContext.value, {
    id: item.id,
    label: item.label,
    kind: item.kind,
    description: item.description,
    icon: item.icon,
    removable: true,
  }];
  updateHostCollection("contextItems", currentContext.value);
  emitElementEvent(host, "context-change", [currentContext.value]);
}

function removeContext(item: ComposerContextItem) {
  if (item.removable === false || props.disabled) return;
  currentContext.value = currentContext.value.filter((entry) => entry.id !== item.id);
  updateHostCollection("contextItems", currentContext.value);
  emitElementEvent(host, "context-remove", [item]);
  emitElementEvent(host, "context-change", [currentContext.value]);
  announcement.value = `${item.label} removed.`;
}

function removeAttachment(item: ComposerAttachment) {
  if (item.removable === false || props.disabled) return;
  currentAttachments.value = currentAttachments.value.filter((entry) => entry.id !== item.id);
  updateHostCollection("attachments", currentAttachments.value);
  emitElementEvent(host, "attachment-remove", [item]);
  emitElementEvent(host, "attachments-change", [currentAttachments.value]);
  announcement.value = `${item.name} removed.`;
}

function updateHostCollection(property: "contextItems" | "attachments", value: ComposerContextItem[] | ComposerAttachment[]) {
  if (!host) return;
  const element = host as unknown as HTMLElement & { contextItems: ComposerContextItem[]; attachments: ComposerAttachment[] };
  if (property === "contextItems") element.contextItems = value as ComposerContextItem[];
  else element.attachments = value as ComposerAttachment[];
}

function requestAttachments() {
  if (!props.allowAttachments || props.disabled) return;
  emitElementEvent(host, "attachment-request", [{ accept: props.attachmentAccept }]);
}

function emitFiles(files: FileList | File[]) {
  const selected = Array.from(files);
  if (!selected.length || !props.allowAttachments || props.disabled) return;
  emitElementEvent(host, "attachment-add", [selected]);
  announcement.value = `${selected.length} ${selected.length === 1 ? "attachment" : "attachments"} ready for the host application.`;
}

function onPaste(event: ClipboardEvent) {
  if (event.clipboardData?.files.length) emitFiles(event.clipboardData.files);
}

function onDrop(event: DragEvent) {
  dragging.value = false;
  if (event.dataTransfer?.files.length) emitFiles(event.dataTransfer.files);
}

function submit() {
  const prompt = current.value.trim();
  if (!canSubmit.value) return;
  const payload = {
    text: prompt,
    contextItems: [...currentContext.value],
    attachments: [...currentAttachments.value],
    modelId: selectedModel.value?.id ?? props.modelId,
    reasoningId: selectedReasoning.value?.id ?? props.reasoningId,
    accessModeId: selectedAccess.value?.id ?? props.accessModeId,
  };
  emitElementEvent(host, "submit", [prompt, payload]);
}

function onKeydown(event: KeyboardEvent) {
  if (paletteOpen.value) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      moveSuggestion(event.key === "ArrowDown" ? 1 : -1);
      return;
    }
    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      moveSuggestion(event.key === "Home" ? "first" : "last");
      return;
    }
    if ((event.key === "Enter" || event.key === "Tab") && visibleSuggestions.value[activeSuggestion.value] && !event.isComposing) {
      event.preventDefault();
      chooseSuggestion(visibleSuggestions.value[activeSuggestion.value]!);
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      dismissPalette();
      announcement.value = "Suggestions closed.";
      return;
    }
  }
  const enterSubmit = props.submitShortcut === "enter"
    ? event.key === "Enter" && !event.shiftKey
    : event.key === "Enter" && (event.metaKey || event.ctrlKey);
  if (enterSubmit && !event.isComposing) {
    event.preventDefault();
    submit();
  }
}

function controlOptions(name: ControlName): ComposerOption[] {
  return name === "model" ? props.models : name === "reasoning" ? props.reasoningOptions : props.accessModes;
}

function controlSelection(name: ControlName): ComposerOption | undefined {
  return name === "model" ? selectedModel.value : name === "reasoning" ? selectedReasoning.value : selectedAccess.value;
}

function controlLabel(name: ControlName): string {
  if (name === "model") return selectedModel.value?.label ?? props.model;
  if (name === "reasoning") return selectedReasoning.value?.label ?? props.reasoning;
  return selectedAccess.value?.label ?? props.accessMode;
}

function controlIcon(name: ControlName): OsxIconName {
  return name === "model" ? "bot" : name === "reasoning" ? "sparkle" : "lock";
}

function toggleControl(name: ControlName) {
  if (props.disabled || !controlOptions(name).length) return;
  openControl.value = openControl.value === name ? null : name;
  if (openControl.value) void nextTick(() => focusControlOption(name));
}

function focusControlOption(name: ControlName, index?: number) {
  const options = controlOptions(name);
  let target = index ?? Math.max(0, options.findIndex((item) => item.id === controlSelection(name)?.id));
  if (options[target]?.disabled) target = options.findIndex((item) => !item.disabled);
  host?.shadowRoot?.querySelector<HTMLButtonElement>(`#${instanceId}-${name}-${Math.max(0, target)}`)?.focus();
}

function moveControlOption(event: KeyboardEvent, name: ControlName, currentIndex: number) {
  const options = controlOptions(name);
  if (event.key === "Escape") {
    event.preventDefault();
    closeControl(name);
    return;
  }
  if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
  event.preventDefault();
  let next = event.key === "Home" ? 0 : event.key === "End" ? options.length - 1 : currentIndex;
  const direction = event.key === "ArrowUp" || event.key === "End" ? -1 : 1;
  for (let attempts = 0; attempts < options.length; attempts += 1) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") next = (next + direction + options.length) % options.length;
    if (!options[next]?.disabled) return focusControlOption(name, next);
    next = (next + direction + options.length) % options.length;
  }
}

function chooseControl(name: ControlName, option: ComposerOption) {
  if (option.disabled) return;
  const property = name === "model" ? "modelId" : name === "reasoning" ? "reasoningId" : "accessModeId";
  if (host) {
    const element = host as unknown as HTMLElement & { modelId: string; reasoningId: string; accessModeId: string };
    if (property === "modelId") element.modelId = option.id;
    else if (property === "reasoningId") element.reasoningId = option.id;
    else element.accessModeId = option.id;
  }
  emitElementEvent(host, controlEventNames[name], [option.id, option]);
  announcement.value = `${option.label} selected.`;
  closeControl(name);
}

function closeControl(name: ControlName) {
  openControl.value = null;
  void nextTick(() => host?.shadowRoot?.querySelector<HTMLButtonElement>(`[data-control="${name}"]`)?.focus());
}

function onDocumentPointerDown(event: PointerEvent) {
  if (host && !event.composedPath().includes(host)) {
    dismissPalette();
    openControl.value = null;
  }
}
</script>

<template>
  <form
    :class="{ dragging, disabled, running, invalid: Boolean(error) }"
    :aria-label="label"
    :aria-busy="running ? 'true' : undefined"
    @submit.prevent="submit"
    @dragenter.prevent="allowAttachments && (dragging = true)"
    @dragover.prevent
    @dragleave.self="dragging = false"
    @drop.prevent="onDrop"
  >
    <section
      v-if="paletteOpen"
      :id="paletteId"
      class="suggestion-palette"
      role="listbox"
      :aria-label="queryState ? suggestionKindLabelForTrigger(queryState.trigger) : 'Suggestions'"
    >
      <header class="palette-header">
        <span><strong>{{ queryState?.trigger }}</strong>{{ queryState ? suggestionKindLabelForTrigger(queryState.trigger) : "Suggestions" }}</span>
        <span v-if="queryState?.query">Results for “{{ queryState.query }}”</span>
      </header>
      <div v-if="suggestionsLoading" class="palette-state" role="status"><IconGlyph name="loader" :size="16" /> Loading suggestions</div>
      <div v-else-if="suggestionsError" class="palette-state error-state" role="status"><IconGlyph name="warning" :size="16" /> {{ suggestionsError }}</div>
      <div v-else-if="!visibleSuggestions.length" class="palette-state" role="status">No matching suggestions</div>
      <div v-else class="suggestion-scroll">
        <section v-for="group in suggestionGroups" :key="group.label" class="suggestion-group" :aria-label="group.label">
          <h3>{{ group.label }}</h3>
          <button
            v-for="item in group.items"
            :id="`${paletteId}-${safeId(item.id)}`"
            :key="item.id"
            type="button"
            role="option"
            :class="{ active: visibleSuggestions[activeSuggestion]?.id === item.id }"
            :aria-selected="visibleSuggestions[activeSuggestion]?.id === item.id"
            :aria-disabled="item.disabled ? 'true' : undefined"
            :disabled="item.disabled"
            :title="item.disabledReason || undefined"
            @mouseenter="activeSuggestion = visibleSuggestions.findIndex((entry) => entry.id === item.id)"
            @mousedown.prevent
            @click="chooseSuggestion(item)"
          >
            <span class="suggestion-icon"><IconGlyph :name="suggestionIcon(item)" :size="18" /></span>
            <span class="suggestion-copy"><strong><i aria-hidden="true">{{ item.trigger }}</i>{{ item.label }}</strong><small v-if="item.description">{{ item.description }}</small><small v-if="item.disabledReason" class="disabled-reason">{{ item.disabledReason }}</small></span>
            <span v-if="item.badge" class="badge">{{ item.badge }}</span>
          </button>
        </section>
      </div>
      <footer class="palette-help"><span><kbd>↑</kbd><kbd>↓</kbd> Navigate</span><span><kbd>Enter</kbd> Select</span><span><kbd>Esc</kbd> Close</span></footer>
    </section>

    <div class="composer-shell">
      <div v-if="currentAttachments.length || currentContext.length" class="context-tray" aria-label="Prompt context">
        <article v-for="attachment in currentAttachments" :key="attachment.id" class="attachment" :class="attachment.status || 'ready'">
          <img v-if="attachment.kind === 'image' && attachment.previewUrl" :src="attachment.previewUrl" :alt="attachment.name" />
          <span v-else class="attachment-icon"><IconGlyph :name="attachment.kind === 'image' ? 'image' : 'file'" :size="20" /></span>
          <span class="attachment-copy"><strong>{{ attachment.name }}</strong><small v-if="attachment.status === 'loading'">{{ attachment.progress === undefined ? "Attaching" : `${Math.round(attachment.progress)}% attached` }}</small><small v-else-if="attachment.status === 'error'">{{ attachment.error || "Could not attach" }}</small><small v-else>{{ attachment.mediaType || "Attached file" }}</small></span>
          <button v-if="attachment.status === 'error' && attachment.retryable" type="button" class="tray-action" :aria-label="`Retry ${attachment.name}`" @click="emitElementEvent(host, 'attachment-retry', [attachment])"><IconGlyph name="refresh" :size="15" /></button>
          <button v-if="attachment.removable !== false" type="button" class="tray-action" :aria-label="`Remove ${attachment.name}`" @click="removeAttachment(attachment)"><IconGlyph name="close" :size="15" /></button>
          <span v-if="attachment.status === 'loading' && attachment.progress !== undefined" class="attachment-progress" :style="{ '--progress': `${Math.max(0, Math.min(100, attachment.progress))}%` }" aria-hidden="true"></span>
        </article>
        <span v-for="item in currentContext" :key="item.id" class="context-chip" :title="item.description || undefined">
          <IconGlyph :name="contextIcon(item)" :size="15" />
          <span>{{ item.label }}</span>
          <button v-if="item.removable !== false" type="button" :aria-label="`Remove ${item.label}`" @click="removeContext(item)"><IconGlyph name="close" :size="14" /></button>
        </span>
      </div>

      <div class="editor">
        <label class="sr-only" :for="textareaId">{{ label }}</label>
        <textarea
          :id="textareaId"
          ref="textarea"
          :value="current"
          :rows="rows"
          :placeholder="placeholder"
          :disabled="disabled"
          :aria-describedby="statusId"
          :aria-invalid="error ? 'true' : undefined"
          :aria-autocomplete="paletteOpen ? 'list' : undefined"
          :aria-controls="paletteOpen ? paletteId : undefined"
          :aria-activedescendant="activeDescendant"
          @input="update"
          @keydown="onKeydown"
          @keyup="detectQuery"
          @click="detectQuery"
          @paste="onPaste"
        ></textarea>
      </div>

      <p v-if="error" class="composer-error"><IconGlyph name="warning" :size="15" />{{ error }}</p>

      <footer class="composer-footer">
        <div class="leading-actions">
          <button v-if="allowAttachments" type="button" class="icon-action" :disabled="disabled" aria-label="Add attachment" title="Add attachment" @click="requestAttachments"><IconGlyph name="paperclip" :size="18" /></button>
          <slot name="tools"></slot>
          <slot name="leading-actions"></slot>
        </div>

        <div class="composer-controls" aria-label="Agent settings">
          <slot name="controls"></slot>
          <div v-for="name in (['model','reasoning','access'] as ControlName[])" :key="name" class="control-wrap">
            <button
              v-if="controlLabel(name)"
              type="button"
              class="control-trigger"
              :data-control="name"
              :disabled="disabled || !controlOptions(name).length"
              :aria-haspopup="controlOptions(name).length ? 'listbox' : undefined"
              :aria-expanded="openControl === name ? 'true' : 'false'"
              :aria-controls="openControl === name ? `${instanceId}-${name}-menu` : undefined"
              @click="toggleControl(name)"
              @keydown.down.prevent="toggleControl(name)"
              @keydown.up.prevent="toggleControl(name)"
            >
              <IconGlyph :name="controlIcon(name)" :size="15" />
              <span>{{ controlLabel(name) }}</span>
              <IconGlyph v-if="controlOptions(name).length" name="chevron-down" :size="14" />
            </button>
            <section v-if="openControl === name" :id="`${instanceId}-${name}-menu`" class="control-menu" role="listbox" :aria-label="`Choose ${name}`">
              <button
                v-for="(option,index) in controlOptions(name)"
                :id="`${instanceId}-${name}-${index}`"
                :key="option.id"
                type="button"
                role="option"
                :aria-selected="controlSelection(name)?.id === option.id"
                :aria-disabled="option.disabled ? 'true' : undefined"
                :disabled="option.disabled"
                :title="option.disabledReason || undefined"
                @click="chooseControl(name, option)"
                @keydown="moveControlOption($event, name, index)"
              >
                <span class="option-check"><IconGlyph v-if="controlSelection(name)?.id === option.id" name="check" :size="15" /></span>
                <span class="option-copy"><strong>{{ option.label }}</strong><small v-if="option.description">{{ option.description }}</small><small v-if="option.disabledReason" class="disabled-reason">{{ option.disabledReason }}</small></span>
                <span v-if="option.badge" class="badge">{{ option.badge }}</span>
              </button>
            </section>
          </div>
        </div>

        <div class="trailing-actions">
          <slot name="trailing-actions"></slot>
          <button v-if="allowVoice" type="button" class="icon-action" :disabled="disabled || running" aria-label="Start voice input" title="Start voice input" @click="emitElementEvent(host, 'voice-request', [])"><IconGlyph name="microphone" :size="18" /></button>
          <button v-if="running" type="button" class="primary-action stop-action" :disabled="disabled || state === 'stopping'" aria-label="Stop agent" title="Stop agent" @click="emitElementEvent(host, 'stop', [])"><IconGlyph name="stop" :size="17" /></button>
          <button v-else type="submit" class="primary-action send-action" :disabled="!canSubmit" aria-label="Send message" title="Send message"><IconGlyph name="send" :size="18" /></button>
        </div>
      </footer>
    </div>

    <p :id="statusId" class="sr-only" role="status" aria-live="polite">{{ announcement || statusText }}</p>
    <div v-if="dragging" class="drop-overlay" aria-hidden="true"><IconGlyph name="upload" :size="22" /><span>Drop files to attach</span></div>
  </form>
</template>

<style>
:host { min-width: 0; display: block; color: var(--osx-text); font-family: var(--osx-font); }
form { position: relative; box-sizing: border-box; margin: 0; padding: 10px; }
.composer-shell { min-width: 0; position: relative; border: 1px solid var(--osx-border); border-radius: 15px; overflow: visible; background: color-mix(in srgb,var(--osx-surface-raised) 94%,var(--osx-surface)); box-shadow: 0 1px var(--osx-highlight) inset,0 3px 12px rgba(0,0,0,.12); transition: border-color .14s ease,box-shadow .14s ease; }
.composer-shell:focus-within { border-color: color-mix(in srgb,var(--osx-accent) 65%,var(--osx-border)); box-shadow: 0 0 0 3px var(--osx-focus),0 1px var(--osx-highlight) inset,0 4px 16px rgba(0,0,0,.14); }
.editor { padding: 13px 14px 7px; }
textarea { width: 100%; max-width: 100%; min-height: 66px; box-sizing: border-box; display: block; resize: none; overflow: hidden; padding: 0; border: 0; outline: 0; color: var(--osx-text); background: transparent; caret-color: var(--osx-accent-ink); font: 14px/1.55 var(--osx-font); }
textarea::placeholder { color: color-mix(in srgb,var(--osx-muted) 86%,transparent); }
textarea:disabled { cursor: not-allowed; }
.disabled .composer-shell { opacity: .58; }
.context-tray { min-width: 0; display: flex; gap: 8px; align-items: start; overflow-x: auto; padding: 10px 10px 0; scrollbar-width: thin; }
.attachment { width: 178px; min-width: 178px; min-height: 54px; position: relative; display: grid; grid-template-columns: 40px minmax(0,1fr) auto; gap: 8px; align-items: center; overflow: hidden; padding: 6px; border: 1px solid var(--osx-border-soft); border-radius: 9px; background: var(--osx-surface-sunken); }
.attachment img,.attachment-icon { width: 40px; height: 40px; display: grid; place-items: center; object-fit: cover; border: 1px solid var(--osx-border-soft); border-radius: 6px; color: var(--osx-muted); background: var(--osx-surface-raised); }
.attachment-copy,.option-copy,.suggestion-copy { min-width: 0; display: grid; gap: 1px; }
.attachment-copy strong,.attachment-copy small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.attachment-copy strong { font-size: 12px; }.attachment-copy small { color: var(--osx-muted); font-size: 12px; }
.attachment.error { border-color: color-mix(in srgb,var(--osx-danger) 60%,var(--osx-border)); }.attachment.error small { color: var(--osx-danger); }
.attachment-progress { height: 2px; position: absolute; inset: auto 0 0; background: linear-gradient(90deg,var(--osx-accent) var(--progress),transparent var(--progress)); }
.tray-action,.context-chip button { width: 28px; height: 28px; display: grid; flex: 0 0 auto; place-items: center; padding: 0; border: 0; border-radius: 6px; color: var(--osx-muted); background: transparent; cursor: pointer; }
.tray-action:hover,.context-chip button:hover { color: var(--osx-text); background: color-mix(in srgb,var(--osx-text) 9%,transparent); }
.context-chip { max-width: 210px; min-height: 32px; display: inline-flex; flex: 0 0 auto; gap: 6px; align-items: center; padding: 2px 3px 2px 9px; border: 1px solid var(--osx-border-soft); border-radius: 9px; color: var(--osx-text); background: var(--osx-surface-sunken); font-size: 12px; font-weight: 650; }
.context-chip > span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.composer-error { display: flex; gap: 6px; align-items: center; margin: 0; padding: 0 14px 7px; color: var(--osx-danger); font-size: 12px; }
.composer-footer { min-width: 0; display: grid; grid-template-columns: minmax(max-content,1fr) minmax(0,auto) minmax(max-content,1fr); gap: 10px; align-items: end; padding: 6px 8px 8px; }
.leading-actions,.trailing-actions,.composer-controls { min-width: 0; display: flex; gap: 5px; align-items: center; }
.trailing-actions { justify-content: flex-end; }.composer-controls { justify-content: center; }
.icon-action,.primary-action,.control-trigger { min-height: 34px; border: 0; color: var(--osx-muted); background: transparent; font: 650 12px var(--osx-font); cursor: pointer; }
.icon-action { width: 34px; height: 34px; display: grid; place-items: center; padding: 0; border-radius: 9px; }
.icon-action:hover:not(:disabled),.control-trigger:hover:not(:disabled) { color: var(--osx-text); background: color-mix(in srgb,var(--osx-text) 8%,transparent); }
.control-wrap { min-width: 0; position: relative; }
.control-trigger { max-width: 210px; display: inline-flex; gap: 6px; align-items: center; padding: 4px 7px; border-radius: 8px; white-space: nowrap; }
.control-trigger > span { overflow: hidden; text-overflow: ellipsis; }
.control-trigger:disabled { cursor: default; opacity: 1; }
.primary-action { width: 36px; height: 36px; display: grid; place-items: center; padding: 0; border: 1px solid color-mix(in srgb,var(--osx-accent) 72%,#123); border-radius: 50%; color: white; background: linear-gradient(var(--osx-accent-light),var(--osx-accent)); box-shadow: 0 1px var(--osx-highlight) inset,0 2px 5px rgba(0,0,0,.2); }
.primary-action:hover:not(:disabled) { filter: brightness(1.07); }.primary-action:active:not(:disabled) { transform: translateY(1px); }
.primary-action:disabled,.icon-action:disabled { opacity: .42; cursor: not-allowed; }
.stop-action { border-color: color-mix(in srgb,var(--osx-danger) 72%,#321); background: var(--osx-danger); }
button:focus-visible { outline: 3px solid var(--osx-focus); outline-offset: 2px; }
.control-menu { width: min(330px,calc(100vw - 32px)); max-height: 310px; position: absolute; z-index: 1210; bottom: calc(100% + 8px); left: 50%; overflow-y: auto; padding: 5px; border: 1px solid var(--osx-border); border-radius: 11px; background: var(--osx-surface-raised); box-shadow: var(--osx-shadow); transform: translateX(-50%); }
.control-menu button { width: 100%; min-height: 42px; display: grid; grid-template-columns: 17px minmax(0,1fr) auto; gap: 8px; align-items: center; padding: 7px 9px; border: 0; border-radius: 7px; color: var(--osx-text); background: transparent; text-align: left; cursor: pointer; }
.control-menu button:hover:not(:disabled),.control-menu button:focus-visible { outline: 0; color: white; background: var(--osx-accent); }
.control-menu button:disabled { opacity: .48; cursor: not-allowed; }
.option-copy strong { font-size: 12px; }.option-copy small { color: var(--osx-muted); font-size: 12px; line-height: 1.3; }.control-menu button:hover small,.control-menu button:focus-visible small { color: color-mix(in srgb,white 78%,transparent); }
.option-check { width: 17px; display: grid; place-items: center; }
.badge { justify-self: end; padding: 2px 6px; border: 1px solid color-mix(in srgb,currentColor 25%,transparent); border-radius: 7px; color: var(--osx-muted); background: color-mix(in srgb,var(--osx-text) 7%,transparent); font-size: 12px; font-weight: 700; white-space: nowrap; }
.control-menu button:hover .badge,.control-menu button:focus-visible .badge,.suggestion-palette button.active .badge { color: white; }
.suggestion-palette { max-height: min(410px,55vh); position: absolute; z-index: 1200; right: 10px; bottom: calc(100% + 8px); left: 10px; display: grid; grid-template-rows: auto minmax(0,1fr) auto; overflow: hidden; border: 1px solid var(--osx-border); border-radius: 13px; color: var(--osx-text); background: color-mix(in srgb,var(--osx-surface-raised) 96%,transparent); box-shadow: var(--osx-shadow); backdrop-filter: blur(18px); }
.palette-header,.palette-help { min-height: 36px; display: flex; gap: 12px; align-items: center; justify-content: space-between; padding: 7px 10px; border-bottom: 1px solid var(--osx-border-soft); color: var(--osx-muted); background: color-mix(in srgb,var(--osx-surface-sunken) 70%,transparent); font-size: 12px; }
.palette-header > span:first-child { display: flex; gap: 7px; align-items: center; color: var(--osx-text); font-weight: 700; }.palette-header strong { min-width: 22px; display: inline-grid; place-items: center; padding: 1px 5px; border: 1px solid var(--osx-border); border-radius: 5px; background: var(--osx-surface-raised); }
.suggestion-scroll { overflow-y: auto; padding: 5px; scrollbar-width: thin; }
.suggestion-group h3 { margin: 0; padding: 7px 9px 4px; color: var(--osx-muted); font-size: 12px; letter-spacing: .05em; text-transform: uppercase; }
.suggestion-group button { width: 100%; min-height: 50px; display: grid; grid-template-columns: 30px minmax(0,1fr) auto; gap: 9px; align-items: center; padding: 7px 9px; border: 0; border-radius: 8px; color: var(--osx-text); background: transparent; text-align: left; cursor: pointer; }
.suggestion-group button.active:not(:disabled) { color: white; background: var(--osx-accent); }
.suggestion-group button:disabled { opacity: .48; cursor: not-allowed; }
.suggestion-icon { width: 30px; height: 30px; display: grid; place-items: center; border: 1px solid color-mix(in srgb,currentColor 22%,transparent); border-radius: 7px; background: color-mix(in srgb,var(--osx-text) 6%,transparent); }
.suggestion-copy strong { display: flex; gap: 1px; align-items: baseline; overflow: hidden; font-size: 13px; text-overflow: ellipsis; white-space: nowrap; }.suggestion-copy strong i { color: var(--osx-muted); font-style: normal; }.suggestion-copy small { overflow: hidden; color: var(--osx-muted); font-size: 12px; line-height: 1.35; text-overflow: ellipsis; white-space: nowrap; }
.suggestion-group button.active strong i,.suggestion-group button.active small { color: color-mix(in srgb,white 78%,transparent); }.disabled-reason { color: var(--osx-danger) !important; }
.palette-state { min-height: 76px; display: flex; gap: 8px; align-items: center; justify-content: center; padding: 18px; color: var(--osx-muted); font-size: 12px; }.palette-state svg { animation: spin .8s linear infinite; }.error-state { color: var(--osx-danger); }.error-state svg { animation: none; }
.palette-help { justify-content: flex-start; border-top: 1px solid var(--osx-border-soft); border-bottom: 0; }.palette-help span { display: inline-flex; gap: 4px; align-items: center; }.palette-help kbd { min-width: 20px; padding: 1px 4px; border: 1px solid var(--osx-border); border-radius: 4px; color: var(--osx-text); background: var(--osx-surface-raised); box-shadow: 0 1px var(--osx-border); font: 12px var(--osx-font); text-align: center; }
.drop-overlay { position: absolute; z-index: 1300; inset: 10px; display: grid; place-items: center; align-content: center; gap: 7px; border: 2px dashed var(--osx-accent); border-radius: 15px; color: var(--osx-accent-ink); background: color-mix(in srgb,var(--osx-surface-raised) 88%,transparent); font-size: 13px; font-weight: 750; backdrop-filter: blur(8px); pointer-events: none; }
.sr-only { width: 1px; height: 1px; position: absolute; overflow: hidden; clip: rect(0 0 0 0); clip-path: inset(50%); white-space: nowrap; }
@keyframes spin { to { transform: rotate(360deg); } }
@media (max-width: 620px) {
  form { padding: 8px; }.composer-shell { border-radius: 13px; }.editor { padding: 12px 12px 5px; }textarea { min-height: 78px; font-size: 14px; }
  .composer-footer { grid-template: "leading trailing" auto "controls controls" auto / minmax(0,1fr) auto; gap: 5px 8px; }.leading-actions { grid-area: leading; }.trailing-actions { grid-area: trailing; }.composer-controls { grid-area: controls; justify-content: flex-start; overflow-x: auto; padding-top: 2px; scrollbar-width: thin; }
  .control-trigger { max-width: 180px; }.control-menu { width: auto; max-height: min(420px,62dvh); position: fixed; z-index: 2000; inset: auto 12px max(12px,env(safe-area-inset-bottom)); transform: none; }
  .suggestion-palette { max-height: min(420px,62dvh); position: fixed; z-index: 1990; inset: auto 8px max(8px,env(safe-area-inset-bottom)); }.palette-help { overflow-x: auto; white-space: nowrap; }.palette-header > span:last-child { display: none; }
}
@media (forced-colors: active) {
  .composer-shell,.suggestion-palette,.control-menu,.attachment,.context-chip { border: 1px solid CanvasText; }.composer-shell:focus-within { outline: 2px solid Highlight; }.suggestion-group button.active,.control-menu button:hover,.control-menu button:focus-visible { color: HighlightText; background: Highlight; forced-color-adjust: none; }.primary-action { border: 2px solid ButtonText; }.attachment-progress { background: Highlight; }
}
@media (prefers-reduced-motion: reduce) {
  .composer-shell { transition: none; }.palette-state svg { animation: none; }.primary-action:active:not(:disabled) { transform: none; }
}
</style>
