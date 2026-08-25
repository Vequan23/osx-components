<script setup lang="ts">
import { computed } from "vue";
import IconGlyph from "./IconGlyph.vue";

type StepState = "pending" | "active" | "done" | "failed" | "skipped";
type PlanStep = { id?: string; title: string; detail?: string; state?: StepState };
const props = withDefaults(defineProps<{
  steps?: string | PlanStep[];
  title?: string;
  label?: string;
  compact?: boolean;
  showProgress?: boolean;
}>(), { steps: "[]", title: "Plan", label: "Agent plan", compact: false, showProgress: true });

const parsedSteps = computed<PlanStep[]>(() => {
  if (Array.isArray(props.steps)) return props.steps;
  try {
    const value = JSON.parse(props.steps || "[]");
    return Array.isArray(value) ? value.filter((item) => item && typeof item.title === "string") : [];
  } catch { return []; }
});
const completeCount = computed(() => parsedSteps.value.filter((step) => step.state === "done" || step.state === "skipped").length);
function stateOf(step: PlanStep): StepState { return step.state || "pending"; }
function iconFor(state: StepState) {
  if (state === "done") return "check";
  if (state === "failed") return "close";
  if (state === "skipped") return "minus";
  if (state === "active") return "loader";
  return "circle";
}
</script>

<template>
  <section :class="{ compact }" :aria-label="label">
    <header><div><IconGlyph name="list-checks" :size="17" /><strong>{{ title }}</strong></div><span v-if="showProgress">{{ completeCount }}/{{ parsedSteps.length }}</span></header>
    <ol v-if="parsedSteps.length">
      <li v-for="(step,index) in parsedSteps" :key="step.id || `${index}-${step.title}`" :class="stateOf(step)" :aria-current="stateOf(step) === 'active' ? 'step' : undefined">
        <span class="rail"><span class="state"><IconGlyph :name="iconFor(stateOf(step))" :size="14" /></span></span>
        <span class="copy"><strong>{{ step.title }}</strong><small v-if="step.detail">{{ step.detail }}</small></span>
        <span class="state-label">{{ stateOf(step) }}</span>
      </li>
    </ol>
    <p v-else class="empty"><slot>No plan steps yet.</slot></p>
  </section>
</template>

<style>
:host { display: block; color: var(--osx-text); font-family: var(--osx-font); }
section { overflow: hidden; border: 1px solid var(--osx-border-soft); border-radius: 8px; background: var(--osx-surface-raised); }
header { min-height: 43px; display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 8px 12px; border-bottom: 1px solid var(--osx-border-soft); background: linear-gradient(var(--osx-surface-raised),var(--osx-surface)); }
header div { display: flex; align-items: center; gap: 8px; color: var(--osx-accent); }header strong { color: var(--osx-text); font-size: 13px; }header > span { min-width: 34px; padding: 2px 7px; border: 1px solid var(--osx-border); border-radius: 999px; color: var(--osx-muted); background: var(--osx-surface-sunken); font-size: 12px; font-weight: 700; text-align: center; }
ol { margin: 0; padding: 5px 0; list-style: none; }li { min-height: 51px; display: grid; grid-template-columns: 29px minmax(0,1fr) auto; gap: 8px; align-items: center; padding: 7px 12px; position: relative; }
li:not(:last-child) .rail::after { width: 1px; position: absolute; top: 34px; bottom: -17px; left: 14px; background: var(--osx-border-soft); content: ""; }.rail { height: 29px; position: relative; display: grid; place-items: center; }.state { width: 24px; height: 24px; position: relative; z-index: 1; display: grid; place-items: center; border: 1px solid var(--osx-border); border-radius: 50%; color: var(--osx-muted); background: var(--osx-surface-sunken); }
.copy { min-width: 0; display: grid; gap: 3px; }.copy strong { font-size: 13px; line-height: 1.35; }.copy small,.state-label { color: var(--osx-muted); font-size: 12px; line-height: 1.35; }.state-label { text-transform: capitalize; }
.active { background: color-mix(in srgb,var(--osx-accent) 8%,transparent); }.active .state { color: var(--osx-accent); border-color: var(--osx-accent); animation: pulse 1.25s ease-in-out infinite; }.active .state-label { color: var(--osx-accent); font-weight: 700; }.done .state { color: var(--osx-success); border-color: var(--osx-success); }.failed .state { color: var(--osx-danger); border-color: var(--osx-danger); }.failed .state-label { color: var(--osx-danger); }.skipped { opacity: .72; }.skipped .copy strong { text-decoration: line-through; text-decoration-thickness: 1px; }
.empty { margin: 0; padding: 20px 12px; color: var(--osx-muted); font-size: 12px; text-align: center; }.compact li { min-height: 42px; }.compact .copy small,.compact .state-label { display: none; }
@keyframes pulse { 50% { opacity: .45; transform: scale(.9); } }@media (prefers-reduced-motion: reduce) { .active .state { animation: none; } }
@media (max-width: 480px) { li { grid-template-columns: 29px minmax(0,1fr); }.state-label { grid-column: 2; } }
</style>
