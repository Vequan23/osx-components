<script setup lang="ts">
import { computed } from "vue";
import IconGlyph from "./IconGlyph.vue";

const props = withDefaults(defineProps<{
  name?: string;
  category?: string;
  description?: string;
  href?: string;
  actionLabel?: string;
  mark?: string;
  provenance?: string;
  trackingId?: string;
  tone?: "neutral" | "info" | "success" | "warning";
  compact?: boolean;
  external?: boolean;
}>(), {
  name: "Product",
  category: "From the ecosystem",
  description: "",
  href: "",
  actionLabel: "Explore product",
  mark: "",
  provenance: "Built with OSX Components",
  trackingId: "",
  tone: "info",
  compact: false,
  external: true,
});

const emit = defineEmits<{
  activate: [detail: { name: string; href: string; trackingId: string }];
}>();

const displayedMark = computed(() => props.mark.trim() || props.name.trim().slice(0, 1).toUpperCase() || "O");
const accessibleLabel = computed(() => `${props.actionLabel}: ${props.name}`);

function activate() {
  emit("activate", { name: props.name, href: props.href, trackingId: props.trackingId });
}
</script>

<template>
  <article class="card" :class="[`tone-${tone}`, { compact }]" :aria-label="`${name} ecosystem recommendation`">
    <div class="identity">
      <span class="mark" aria-hidden="true"><slot name="mark">{{ displayedMark }}</slot></span>
      <span class="context">
        <small>{{ category }}</small>
        <strong>{{ name }}</strong>
      </span>
    </div>

    <p v-if="description" class="description"><slot>{{ description }}</slot></p>
    <div v-else class="description slotted"><slot></slot></div>

    <footer>
      <span class="provenance"><span aria-hidden="true">O</span><slot name="provenance">{{ provenance }}</slot></span>
      <a
        v-if="href"
        :href="href"
        :target="external ? '_blank' : undefined"
        :rel="external ? 'noreferrer noopener' : undefined"
        :aria-label="accessibleLabel"
        @click="activate"
      >
        <slot name="action">{{ actionLabel }}</slot>
        <IconGlyph :name="external ? 'external' : 'chevron-right'" :size="14" />
      </a>
    </footer>
  </article>
</template>

<style>
:host { display: block; min-width: 0; color: var(--osx-text); font-family: var(--osx-font); }
.card { --ecosystem-accent: var(--osx-accent); position: relative; min-width: 0; display: grid; gap: 14px; overflow: hidden; padding: 17px; border: 1px solid var(--osx-border); border-radius: 11px; background: linear-gradient(145deg,var(--osx-surface-raised),var(--osx-surface)); box-shadow: 0 1px var(--osx-highlight) inset,0 3px 10px rgba(0,0,0,.11); }
.card::before { content: ""; position: absolute; inset: 0 auto 0 0; width: 4px; background: var(--ecosystem-accent); }
.tone-neutral { --ecosystem-accent: var(--osx-muted); }.tone-success { --ecosystem-accent: #329653; }.tone-warning { --ecosystem-accent: #b8770a; }
.identity { min-width: 0; display: flex; gap: 11px; align-items: center; }.mark { width: 39px; height: 39px; flex: 0 0 39px; display: grid; place-items: center; border: 1px solid color-mix(in srgb,var(--ecosystem-accent) 72%,var(--osx-border)); border-radius: 9px; color: white; background: linear-gradient(color-mix(in srgb,var(--ecosystem-accent) 65%,white),var(--ecosystem-accent)); box-shadow: 0 1px rgba(255,255,255,.7) inset,0 1px 3px rgba(0,0,0,.18); font: 700 19px Georgia,serif; }.context { min-width: 0; display: grid; gap: 2px; }.context small { overflow: hidden; color: var(--ecosystem-accent); font-size: 12px; font-weight: 800; letter-spacing: .08em; text-overflow: ellipsis; text-transform: uppercase; white-space: nowrap; }.context strong { overflow: hidden; font: 600 20px/1.15 Georgia,serif; text-overflow: ellipsis; white-space: nowrap; }
.description { min-width: 0; min-height: 39px; margin: 0; color: var(--osx-muted); font-size: 13px; line-height: 1.5; overflow-wrap: anywhere; }.slotted:empty { display: none; }
footer { min-width: 0; display: flex; gap: 12px; align-items: center; justify-content: space-between; padding-top: 11px; border-top: 1px solid var(--osx-border-soft); }.provenance { min-width: 0; display: inline-flex; gap: 6px; align-items: center; overflow: hidden; color: var(--osx-muted); font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }.provenance > span { width: 18px; height: 18px; flex: 0 0 18px; display: grid; place-items: center; border: 1px solid var(--osx-border); border-radius: 5px; color: var(--osx-accent); background: var(--osx-surface-raised); font: 700 12px Georgia,serif; }a { min-height: 30px; display: inline-flex; gap: 6px; align-items: center; justify-content: center; padding: 4px 9px; border: 1px solid color-mix(in srgb,var(--ecosystem-accent) 72%,var(--osx-border)); border-radius: 7px; color: var(--osx-text); background: linear-gradient(var(--osx-surface-raised),var(--osx-surface-sunken)); font-size: 12px; font-weight: 800; text-decoration: none; white-space: nowrap; }a:hover { color: var(--ecosystem-accent); border-color: var(--ecosystem-accent); }a:focus-visible { outline: 3px solid var(--osx-focus); outline-offset: 2px; }
.compact { grid-template-columns: minmax(0,1fr) auto; gap: 10px 16px; align-items: center; }.compact .description { grid-column: 1; min-height: 0; padding-left: 50px; }.compact footer { min-width: 190px; grid-column: 2; grid-row: 1 / span 2; align-self: stretch; flex-direction: column-reverse; justify-content: center; padding: 0 0 0 16px; border-top: 0; border-left: 1px solid var(--osx-border-soft); }.compact .provenance { overflow: visible; white-space: nowrap; }
@media (max-width: 560px) { .compact { display: grid; grid-template-columns: 1fr; }.compact .description,.compact footer { grid-column: 1; grid-row: auto; padding-left: 0; }.compact footer { min-width: 0; align-self: auto; flex-direction: row; justify-content: space-between; padding-top: 11px; border-top: 1px solid var(--osx-border-soft); border-left: 0; }footer { align-items: stretch; flex-direction: column; }.provenance,.compact .provenance { overflow: hidden; white-space: normal; }a { width: auto; } }
</style>
