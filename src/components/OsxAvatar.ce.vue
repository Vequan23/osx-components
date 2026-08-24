<script setup lang="ts">
import { computed, ref } from "vue";
const props = withDefaults(defineProps<{ name?: string; src?: string; alt?: string; size?: number; status?: "none" | "online" | "busy" | "offline" }>(), { name: "User", src: "", alt: "", size: 36, status: "none" });
const failed = ref(false);
const initials = computed(() => props.name.split(/\s+/).filter(Boolean).slice(0,2).map((part) => part[0]).join("").toUpperCase());
</script>
<template><span class="avatar" :style="{ width: `${size}px`, height: `${size}px` }" :aria-label="`${alt || name}${status === 'none' ? '' : `, ${status}`}`" role="img"><img v-if="src && !failed" :src="src" alt="" @error="failed = true" /><b v-else aria-hidden="true">{{ initials }}</b><i v-if="status !== 'none'" :class="status" aria-hidden="true"></i></span></template>
<style>
:host { display: inline-flex; font-family: var(--osx-font); }.avatar { position: relative; display: grid; flex: 0 0 auto; place-items: center; overflow: visible; border: 1px solid var(--osx-border); border-radius: 50%; color: var(--osx-text); background: linear-gradient(var(--osx-surface-raised),var(--osx-surface-sunken)); box-shadow: 0 1px var(--osx-highlight) inset,0 1px 3px rgba(0,0,0,.18); }.avatar img { width: 100%; height: 100%; overflow: hidden; border-radius: inherit; object-fit: cover; }.avatar b { font-size: clamp(12px,40%,16px); }.avatar i { width: 10px; height: 10px; position: absolute; right: -1px; bottom: -1px; border: 2px solid var(--osx-surface-raised); border-radius: 50%; background: var(--osx-muted); }.avatar i.online { background: var(--osx-success); }.avatar i.busy { background: var(--osx-warning); }.avatar i.offline { background: var(--osx-muted); }
</style>
