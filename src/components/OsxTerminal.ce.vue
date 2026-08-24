<script setup lang="ts">
import { computed, ref, watch } from "vue";
const props = withDefaults(defineProps<{
  title?: string;
  command?: string;
  output?: string;
  cwd?: string;
  status?: "idle" | "running" | "success" | "error";
  duration?: string;
  label?: string;
}>(), { title: "Terminal", command: "", output: "", cwd: "", status: "idle", duration: "", label: "Terminal output" });
const emit = defineEmits<{ rerun: [command: string]; interrupt: []; clear: [] }>();
const currentOutput = ref(props.output);
watch(() => props.output, (output) => { currentOutput.value = output; });
const cleanOutput = computed(() => currentOutput.value.replace(/\u001b\[[0-9;]*m/g, ""));
function clear() { currentOutput.value = ""; emit("clear"); }
</script>

<template>
  <section :class="['terminal',status]" :aria-label="label">
    <header><div class="lights" aria-hidden="true"><i></i><i></i><i></i></div><strong>{{ title }}</strong><span v-if="duration">{{ duration }}</span><div class="actions"><button v-if="status === 'running'" type="button" @click="emit('interrupt')">Stop</button><button v-else type="button" :disabled="!command" @click="emit('rerun',command)">Rerun</button><button type="button" :disabled="!currentOutput" @click="clear">Clear</button></div></header>
    <div v-if="command" class="command"><span v-if="cwd">{{ cwd }}</span><b aria-hidden="true">$</b><code>{{ command }}</code></div>
    <pre role="log" :aria-live="status === 'running' ? 'polite' : 'off'"><code>{{ cleanOutput || 'No output' }}</code><span v-if="status === 'running'" class="cursor" role="status" aria-label="Command running"></span></pre>
    <footer><span class="state"><i aria-hidden="true"></i>{{ status }}</span><span><slot name="footer"></slot></span></footer>
  </section>
</template>

<style>
:host { display: block; min-width: 0; color: #dce8ef; font-family: var(--osx-font); }
.terminal { overflow: hidden; border: 1px solid #34454f; border-radius: 8px; background: #0d151a; box-shadow: 0 8px 24px rgba(0,0,0,.24); }
header { min-height: 39px; display: grid; grid-template-columns: auto minmax(0,1fr) auto auto; gap: 10px; align-items: center; padding: 6px 9px; border-bottom: 1px solid #34454f; background: linear-gradient(#3d4951,#222c32); }.lights { display: flex; gap: 5px; }.lights i { width: 10px; height: 10px; border: 1px solid rgba(0,0,0,.35); border-radius: 50%; background: #ef665d; }.lights i:nth-child(2) { background: #e9b442; }.lights i:nth-child(3) { background: #4dbd68; }header strong { overflow: hidden; font-size: 12px; text-align: center; text-overflow: ellipsis; white-space: nowrap; }header > span { color: #9eb0ba; font-size: 12px; }.actions { display: flex; gap: 5px; }button { min-height: 24px; padding: 2px 7px; border: 1px solid #52616b; border-radius: 5px; color: #dce8ef; background: linear-gradient(#465159,#293138); font: 700 12px var(--osx-font); cursor: pointer; }button:focus-visible { outline: 3px solid var(--osx-focus); outline-offset: 1px; }button:disabled { opacity: .45; }
.command { display: flex; gap: 7px; padding: 9px 12px; border-bottom: 1px solid #24343d; color: #9fb1bb; font: 12px/1.5 ui-monospace,SFMono-Regular,Consolas,monospace; }.command span { color: #6ebfdf; }.command b { color: #62c47d; }.command code { overflow-wrap: anywhere; color: #eef6fa; }
pre { min-height: 100px; max-height: 300px; margin: 0; overflow: auto; padding: 11px 12px; color: #cbd7dd; font: 12px/1.55 ui-monospace,SFMono-Regular,Consolas,monospace; white-space: pre-wrap; overflow-wrap: anywhere; }.cursor { width: 7px; height: 14px; display: inline-block; margin-left: 3px; background: #54bced; animation: blink .8s steps(1) infinite; vertical-align: -2px; }
footer { min-height: 27px; display: flex; gap: 12px; align-items: center; justify-content: space-between; padding: 4px 10px; border-top: 1px solid #24343d; color: #91a3ad; background: #121e24; font-size: 12px; }.state { display: flex; gap: 6px; align-items: center; text-transform: capitalize; }.state i { width: 8px; height: 8px; border-radius: 50%; background: #77868e; }.running .state i { background: #54bced; }.success .state i { background: #42ae67; }.error .state i { background: #e16059; }
@keyframes blink { 50% { opacity: 0; } }@media (prefers-reduced-motion: reduce) { .cursor { animation: none; } }@media (max-width: 480px) { header { grid-template-columns: auto minmax(0,1fr) auto; }header > span { display: none; }.actions button { padding-inline: 5px; } }
</style>
