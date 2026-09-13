<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
    role="dialog"
    aria-modal="true"
    aria-labelledby="settings-title"
    @click.self="$emit('close')"
    @keydown.esc="$emit('close')"
  >
    <div class="card w-full max-w-lg p-6 shadow-xl">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h2 id="settings-title" class="text-lg font-semibold text-slate-900 dark:text-white">
            Settings
          </h2>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Stored in this browser only — nothing is sent anywhere but the job API itself.
          </p>
        </div>
        <button
          type="button"
          class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
          aria-label="Close settings"
          @click="$emit('close')"
        >
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="m6 6 12 12M18 6 6 18" />
          </svg>
        </button>
      </div>

      <form class="mt-6 space-y-5" @submit.prevent="save">
        <div>
          <label for="hh-token" class="field-label">HeadHunter access token</label>
          <input
            id="hh-token"
            v-model.trim="hhToken"
            type="password"
            autocomplete="off"
            placeholder="Paste your dev.hh.ru token"
            class="w-full rounded-lg border-slate-200 text-sm dark:border-slate-700 dark:bg-slate-800"
          />
          <p class="mt-2 text-xs text-slate-500 dark:text-slate-400">
            HeadHunter (hh.kz / hh.ru) stopped serving anonymous vacancy searches — its API
            answers <code class="font-mono">403</code> without a token. Register a free
            application at
            <a
              href="https://dev.hh.ru/"
              target="_blank"
              rel="noopener noreferrer"
              class="font-medium text-brand-600 hover:underline dark:text-brand-400"
            >dev.hh.ru</a>
            to search Kazakhstan and CIS listings alongside the open sources.
          </p>
        </div>

        <div>
          <label for="hh-area" class="field-label">HeadHunter region</label>
          <select
            id="hh-area"
            v-model="hhArea"
            class="w-full rounded-lg border-slate-200 text-sm dark:border-slate-700 dark:bg-slate-800"
          >
            <option v-for="area in AREAS" :key="area.id" :value="area.id">{{ area.label }}</option>
          </select>
        </div>

        <div class="flex items-center justify-between gap-3 border-t border-slate-200 pt-5 dark:border-slate-800">
          <button
            type="button"
            class="text-sm font-medium text-slate-500 hover:text-rose-600 dark:text-slate-400"
            @click="clearToken"
          >
            Remove token
          </button>
          <div class="flex gap-2">
            <button type="button" class="btn-ghost" @click="$emit('close')">Cancel</button>
            <button type="submit" class="btn-primary">Save</button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from "vue";
import { useStore } from "vuex";
import { AREAS } from "@/api/sources/hh";

const emit = defineEmits(["close"]);

const store = useStore();
const hhToken = ref(store.state.settings.hhToken);
const hhArea = ref(store.state.settings.hhArea);

function save() {
  store.dispatch("saveSettings", { hhToken: hhToken.value, hhArea: hhArea.value });
  emit("close");
}

function clearToken() {
  hhToken.value = "";
  store.dispatch("saveSettings", { hhToken: "" });
}

// The overlay itself cannot take focus, so Escape is handled at the document.
function onKeydown(event) {
  if (event.key === "Escape") emit("close");
}

onMounted(() => document.addEventListener("keydown", onKeydown));
onBeforeUnmount(() => document.removeEventListener("keydown", onKeydown));
</script>
