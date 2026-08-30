<script setup lang="ts">
import { computed, ref } from "vue";
import IconGlyph from "./IconGlyph.vue";

type InlineToken = { type: "text" | "strong" | "em" | "code" | "link"; text: string; href?: string };
type Block =
  | { type: "heading"; level: number; inline: InlineToken[] }
  | { type: "paragraph" | "quote"; inline: InlineToken[] }
  | { type: "code"; code: string; language: string; incomplete: boolean; key: string }
  | { type: "list"; ordered: boolean; items: InlineToken[][] }
  | { type: "table"; headers: InlineToken[][]; rows: InlineToken[][][] }
  | { type: "rule" };

const props = withDefaults(defineProps<{ content?: string; streaming?: boolean; label?: string; codeCopy?: boolean }>(), { content: "", streaming: false, label: "Markdown content", codeCopy: true });
const emit = defineEmits<{ copy: [code: string, language: string] }>();
const copied = ref("");

function safeHref(value: string): string {
  const href = value.trim();
  return /^(https?:|mailto:|#|\/)/i.test(href) ? href : "";
}
function inline(value: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  const pattern = /(`[^`]*`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  let offset = 0;
  for (const match of value.matchAll(pattern)) {
    const index = match.index || 0;
    if (index > offset) tokens.push({ type: "text", text: value.slice(offset,index) });
    const raw = match[0];
    if (raw.startsWith("`")) tokens.push({ type: "code", text: raw.slice(1,-1) });
    else if (raw.startsWith("**")) tokens.push({ type: "strong", text: raw.slice(2,-2) });
    else if (raw.startsWith("*")) tokens.push({ type: "em", text: raw.slice(1,-1) });
    else {
      const parts = raw.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      const href = parts ? safeHref(parts[2]) : "";
      tokens.push(href ? { type: "link", text: parts![1], href } : { type: "text", text: parts?.[1] || raw });
    }
    offset = index + raw.length;
  }
  if (offset < value.length) tokens.push({ type: "text", text: value.slice(offset) });
  return tokens.length ? tokens : [{ type: "text", text: value }];
}
function tableCells(line: string) { return line.trim().replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim()); }
function isTableDivider(line: string) { const cells = tableCells(line); return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell)); }
function isBlockStart(lines: string[], index: number) {
  const line = lines[index] || "";
  return /^\s*```/.test(line) || /^\s{0,3}#{1,6}\s+/.test(line) || /^\s*(?:[-*+] |\d+\. )/.test(line) || /^\s*>/.test(line) || /^\s*(?:---+|___+|\*\*\*+)\s*$/.test(line) || (line.includes("|") && isTableDivider(lines[index + 1] || ""));
}
function parseMarkdown(source: string): Block[] {
  const lines = source.replaceAll("\r\n","\n").split("\n");
  const blocks: Block[] = [];
  let index = 0;
  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) { index += 1; continue; }
    const fence = line.match(/^\s*```\s*([\w+#.-]*)\s*$/);
    if (fence) {
      const start = index; const body: string[] = []; index += 1; let closed = false;
      while (index < lines.length) { if (/^\s*```\s*$/.test(lines[index])) { closed = true; index += 1; break; } body.push(lines[index]); index += 1; }
      blocks.push({ type: "code", code: body.join("\n"), language: fence[1] || "text", incomplete: !closed, key: `${start}-${fence[1] || "text"}` }); continue;
    }
    const heading = line.match(/^\s{0,3}(#{1,6})\s+(.+)$/);
    if (heading) { blocks.push({ type: "heading", level: heading[1].length, inline: inline(heading[2]) }); index += 1; continue; }
    if (/^\s*(?:---+|___+|\*\*\*+)\s*$/.test(line)) { blocks.push({ type: "rule" }); index += 1; continue; }
    if (line.includes("|") && isTableDivider(lines[index + 1] || "")) {
      const headers = tableCells(line).map(inline); index += 2; const rows: InlineToken[][][] = [];
      while (index < lines.length && lines[index].includes("|") && lines[index].trim()) { rows.push(tableCells(lines[index]).map(inline)); index += 1; }
      blocks.push({ type: "table", headers, rows }); continue;
    }
    const list = line.match(/^\s*(?:([-*+])|(\d+)\.)\s+(.+)$/);
    if (list) {
      const ordered = Boolean(list[2]); const items: InlineToken[][] = [];
      while (index < lines.length) { const item = lines[index].match(/^\s*(?:([-*+])|(\d+)\.)\s+(.+)$/); if (!item || Boolean(item[2]) !== ordered) break; items.push(inline(item[3])); index += 1; }
      blocks.push({ type: "list", ordered, items }); continue;
    }
    if (/^\s*>/.test(line)) {
      const quote: string[] = [];
      while (index < lines.length && /^\s*>/.test(lines[index])) { quote.push(lines[index].replace(/^\s*>\s?/,"")); index += 1; }
      blocks.push({ type: "quote", inline: inline(quote.join(" ")) }); continue;
    }
    const paragraph = [line.trim()]; index += 1;
    while (index < lines.length && lines[index].trim() && !isBlockStart(lines,index)) { paragraph.push(lines[index].trim()); index += 1; }
    blocks.push({ type: "paragraph", inline: inline(paragraph.join(" ")) });
  }
  return blocks;
}
const blocks = computed(() => parseMarkdown(props.content));
async function copyCode(block: Extract<Block,{type:"code"}>) {
  if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(block.code);
  else { const field = document.createElement("textarea"); field.value = block.code; field.style.position = "fixed"; field.style.opacity = "0"; document.body.append(field); field.select(); document.execCommand("copy"); field.remove(); }
  copied.value = block.key; emit("copy", block.code, block.language); window.setTimeout(() => { if (copied.value === block.key) copied.value = ""; },1500);
}
</script>

<template>
  <article :aria-label="label" :aria-busy="streaming || undefined">
    <template v-if="blocks.length">
      <template v-for="(block,blockIndex) in blocks" :key="blockIndex">
        <component :is="`h${block.level}`" v-if="block.type === 'heading'" :class="`heading-${block.level}`"><template v-for="(token,tokenIndex) in block.inline" :key="tokenIndex"><strong v-if="token.type === 'strong'">{{ token.text }}</strong><em v-else-if="token.type === 'em'">{{ token.text }}</em><code v-else-if="token.type === 'code'">{{ token.text }}</code><a v-else-if="token.type === 'link'" :href="token.href" :target="token.href?.startsWith('http') ? '_blank' : undefined" :rel="token.href?.startsWith('http') ? 'noreferrer noopener' : undefined">{{ token.text }}</a><template v-else>{{ token.text }}</template></template></component>
        <p v-else-if="block.type === 'paragraph' || block.type === 'quote'" :class="{ quote: block.type === 'quote' }"><template v-for="(token,tokenIndex) in block.inline" :key="tokenIndex"><strong v-if="token.type === 'strong'">{{ token.text }}</strong><em v-else-if="token.type === 'em'">{{ token.text }}</em><code v-else-if="token.type === 'code'">{{ token.text }}</code><a v-else-if="token.type === 'link'" :href="token.href" :target="token.href?.startsWith('http') ? '_blank' : undefined" :rel="token.href?.startsWith('http') ? 'noreferrer noopener' : undefined">{{ token.text }}</a><template v-else>{{ token.text }}</template></template></p>
        <div v-else-if="block.type === 'code'" class="code-block" :class="{ incomplete: block.incomplete }"><header><span>{{ block.language }}</span><span v-if="block.incomplete && streaming" role="status">Streaming…</span><button v-if="codeCopy" type="button" :aria-label="`Copy ${block.language} code`" @click="copyCode(block)"><IconGlyph :name="copied === block.key ? 'check' : 'copy'" :size="13" />{{ copied === block.key ? "Copied" : "Copy" }}</button></header><pre tabindex="0"><code>{{ block.code }}</code><span v-if="block.incomplete && streaming" class="cursor" aria-hidden="true"></span></pre></div>
        <component :is="block.ordered ? 'ol' : 'ul'" v-else-if="block.type === 'list'"><li v-for="(item,itemIndex) in block.items" :key="itemIndex"><template v-for="(token,tokenIndex) in item" :key="tokenIndex"><strong v-if="token.type === 'strong'">{{ token.text }}</strong><em v-else-if="token.type === 'em'">{{ token.text }}</em><code v-else-if="token.type === 'code'">{{ token.text }}</code><a v-else-if="token.type === 'link'" :href="token.href">{{ token.text }}</a><template v-else>{{ token.text }}</template></template></li></component>
        <div v-else-if="block.type === 'table'" class="table-wrap"><table><thead><tr><th v-for="(cell,cellIndex) in block.headers" :key="cellIndex"><template v-for="(token,tokenIndex) in cell" :key="tokenIndex"><strong v-if="token.type === 'strong'">{{ token.text }}</strong><code v-else-if="token.type === 'code'">{{ token.text }}</code><template v-else>{{ token.text }}</template></template></th></tr></thead><tbody><tr v-for="(row,rowIndex) in block.rows" :key="rowIndex"><td v-for="(cell,cellIndex) in row" :key="cellIndex"><template v-for="(token,tokenIndex) in cell" :key="tokenIndex"><strong v-if="token.type === 'strong'">{{ token.text }}</strong><em v-else-if="token.type === 'em'">{{ token.text }}</em><code v-else-if="token.type === 'code'">{{ token.text }}</code><a v-else-if="token.type === 'link'" :href="token.href">{{ token.text }}</a><template v-else>{{ token.text }}</template></template></td></tr></tbody></table></div>
        <hr v-else-if="block.type === 'rule'" />
      </template>
      <span v-if="streaming && !blocks.some((block) => block.type === 'code' && block.incomplete)" class="cursor inline-cursor" role="status" aria-label="Streaming response"></span>
    </template>
    <slot v-else></slot>
  </article>
</template>

<style>
:host { display: block; min-width: 0; color: var(--osx-text); font-family: var(--osx-font); }
article { min-width: 0; font-size: 14px; line-height: 1.65; overflow-wrap: anywhere; }h1,h2,h3,h4,h5,h6 { margin: 1.35em 0 .55em; color: var(--osx-text); font-family: Georgia,"Times New Roman",serif; line-height: 1.18; }h1:first-child,h2:first-child,h3:first-child { margin-top: 0; }h1 { font-size: 28px; }h2 { font-size: 23px; }h3 { font-size: 19px; }h4,h5,h6 { font-size: 15px; }p { margin: 0 0 1em; }strong { color: var(--osx-text); }a { color: var(--osx-accent-ink); text-decoration-thickness: 1px; text-underline-offset: 3px; }a:focus-visible,button:focus-visible { outline: 3px solid var(--osx-focus); outline-offset: 1px; }p code,li code,td code,th code { padding: 1px 4px; border: 1px solid var(--osx-border-soft); border-radius: 4px; color: var(--osx-text); background: var(--osx-surface-sunken); font: 12px ui-monospace,SFMono-Regular,Menlo,monospace; }.quote { padding: 9px 13px; border-left: 3px solid var(--osx-accent); color: var(--osx-muted); background: color-mix(in srgb,var(--osx-accent) 5%,transparent); }ul,ol { margin: 0 0 1em; padding-left: 26px; }li + li { margin-top: .28em; }hr { margin: 24px 0; border: 0; border-top: 1px solid var(--osx-border-soft); }
.code-block { max-width: 100%; overflow: hidden; margin: 14px 0; border: 1px solid #34454f; border-radius: 7px; background: #0d151a; }.code-block header { min-height: 35px; display: flex; gap: 10px; align-items: center; padding: 5px 7px 5px 11px; border-bottom: 1px solid #34454f; color: #91a3ad; background: #152128; font-size: 12px; }.code-block header > span:first-child { color: #6ebfdf; font: 700 12px ui-monospace,monospace; }.code-block header > span:nth-child(2) { margin-left: auto; }.code-block button { min-height: 25px; display: inline-flex; gap: 5px; align-items: center; margin-left: auto; padding: 2px 7px; border: 1px solid #52616b; border-radius: 5px; color: #dce8ef; background: linear-gradient(#465159,#293138); font: 700 12px var(--osx-font); cursor: pointer; }.code-block pre { max-height: 430px; margin: 0; overflow: auto; padding: 13px; color: #dce8ef; font: 12px/1.6 ui-monospace,SFMono-Regular,Menlo,monospace; white-space: pre; }.incomplete { border-color: color-mix(in srgb,var(--osx-accent) 60%,#34454f); }
.table-wrap { max-width: 100%; overflow-x: auto; margin: 14px 0; border: 1px solid var(--osx-border-soft); border-radius: 7px; }table { width: 100%; border-collapse: collapse; font-size: 13px; }th,td { min-width: 110px; padding: 8px 10px; border-right: 1px solid var(--osx-border-soft); border-bottom: 1px solid var(--osx-border-soft); text-align: left; vertical-align: top; }th:last-child,td:last-child { border-right: 0; }tbody tr:last-child td { border-bottom: 0; }th { color: var(--osx-text); background: var(--osx-surface-sunken); }td { color: var(--osx-muted); }
.cursor { width: 7px; height: 14px; display: inline-block; margin-left: 4px; background: var(--osx-accent); animation: blink .85s steps(1) infinite; vertical-align: -2px; }.inline-cursor { margin-bottom: 2px; }@keyframes blink { 50% { opacity: 0; } }@media (prefers-reduced-motion: reduce) { .cursor { animation: none; } }
</style>
