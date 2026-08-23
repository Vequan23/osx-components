<script setup lang="ts">
withDefaults(defineProps<{ orientation?: "horizontal" | "vertical"; primarySize?: string; label?: string }>(), { orientation: "horizontal", primarySize: "220px", label: "Split view" });
</script>

<template>
  <div :class="['split', orientation]" :style="{ '--osx-primary-size': primarySize }" role="group" :aria-label="label"><section class="primary"><slot name="primary"></slot></section><div class="divider" aria-hidden="true"></div><section class="secondary"><slot></slot></section></div>
</template>

<style>
:host { display: block; min-width: 0; min-height: 0; }
.split { min-height: inherit; display: grid; overflow: hidden; }.horizontal { grid-template-columns: var(--osx-primary-size) 1px minmax(0,1fr); }.vertical { grid-template-rows: var(--osx-primary-size) 1px minmax(0,1fr); }
.primary,.secondary { min-width: 0; min-height: 0; }.divider { background: var(--osx-border); box-shadow: 1px 0 var(--osx-highlight); }.vertical .divider { box-shadow: 0 1px var(--osx-highlight); }
@media (max-width: 620px) {
  .horizontal { grid-template-columns: minmax(0,1fr); grid-template-rows: auto 1px minmax(0,1fr); }
  .horizontal .divider { box-shadow: 0 1px var(--osx-highlight); }
}
</style>
