<template>
  <div class="mx-auto max-w-4xl px-4 py-8 sm:px-6">
    <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Saved vacancies
        </h1>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Kept in this browser, with the full posting — they stay readable after the search
          results are gone.
        </p>
      </div>

      <div v-if="saved.length" class="flex gap-2">
        <button type="button" class="btn-ghost" @click="exportJson">Export JSON</button>
        <button
          type="button"
          class="btn-ghost text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
          @click="confirmClear"
        >
          Clear all
        </button>
      </div>
    </div>

    <div v-if="saved.length" class="space-y-4">
      <VacancyCard v-for="vacancy in saved" :key="vacancy.id" :vacancy="vacancy" />
    </div>

    <EmptyState
      v-else
      title="Nothing saved yet"
      description="Tap the bookmark on any result to keep it here for later."
    >
      <template #actions>
        <router-link :to="{ name: 'search' }" class="btn-primary">Find vacancies</router-link>
      </template>
    </EmptyState>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useStore } from "vuex";
import VacancyCard from "@/components/VacancyCard.vue";
import EmptyState from "@/components/EmptyState.vue";

const store = useStore();
const saved = computed(() => store.state.saved);

function confirmClear() {
  if (window.confirm(`Remove all ${saved.value.length} saved vacancies?`)) {
    store.dispatch("clearSaved");
  }
}

/** Strip the internal search blob so the export stays readable. */
function exportJson() {
  const payload = saved.value.map(({ haystack, isIt, ...rest }) => rest);
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `devboard-saved-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}
</script>
