<template>
  <form class="w-full" @submit.prevent="submit">
    <div class="relative">
      <svg
        class="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>

      <input
        v-model="draft"
        type="search"
        name="q"
        autocomplete="off"
        :placeholder="placeholder"
        aria-label="Search IT vacancies"
        class="w-full rounded-xl border-slate-200 bg-white py-3.5 pl-12 pr-28 text-base
               shadow-sm placeholder:text-slate-400 focus:border-brand-500 focus:ring-brand-500
               dark:border-slate-700 dark:bg-slate-900 dark:placeholder:text-slate-500"
      />

      <button
        type="submit"
        class="btn-primary absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2"
        :disabled="loading"
      >
        <span v-if="!loading">Search</span>
        <span v-else class="flex items-center gap-2">
          <span
            class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white"
          />
          Searching
        </span>
      </button>
    </div>

    <div class="mt-3 flex flex-wrap items-center gap-2">
      <span class="text-xs font-medium text-slate-500 dark:text-slate-400">Popular:</span>
      <button
        v-for="term in POPULAR_QUERIES"
        :key="term"
        type="button"
        :class="draft.trim().toLowerCase() === term.toLowerCase() ? 'chip-active' : 'chip-idle'"
        @click="pick(term)"
      >
        {{ term }}
      </button>
    </div>

    <div v-if="recentQueries.length" class="mt-2 flex flex-wrap items-center gap-2">
      <span class="text-xs font-medium text-slate-500 dark:text-slate-400">Recent:</span>
      <button
        v-for="term in recentQueries"
        :key="term"
        type="button"
        class="text-xs text-brand-600 underline-offset-2 hover:underline dark:text-brand-400"
        @click="pick(term)"
      >
        {{ term }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useStore } from "vuex";
import { POPULAR_QUERIES } from "@/utils/taxonomy";

defineProps({
  placeholder: {
    type: String,
    default: "Search roles, stacks or companies — e.g. senior vue developer",
  },
});

const emit = defineEmits(["search"]);

const store = useStore();
const loading = computed(() => store.state.loading);
const recentQueries = computed(() => store.state.recentQueries);

// Local draft so typing never re-runs the expensive getters on every keypress.
const draft = ref(store.state.query);
watch(
  () => store.state.query,
  (value) => {
    if (value !== draft.value) draft.value = value;
  }
);

function submit() {
  emit("search", draft.value);
}

function pick(term) {
  draft.value = term;
  emit("search", term);
}
</script>
