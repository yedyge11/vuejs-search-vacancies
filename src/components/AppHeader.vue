<template>
  <header
    class="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur
           dark:border-slate-800 dark:bg-slate-950/80"
  >
    <div class="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
      <router-link :to="{ name: 'search' }" class="flex items-center gap-2">
        <span
          class="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 font-mono
                 text-lg font-bold text-white"
          aria-hidden="true"
        >
          &lt;/&gt;
        </span>
        <span class="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
          DevBoard
        </span>
      </router-link>

      <nav class="ml-auto flex items-center gap-1 text-sm">
        <router-link
          v-for="link in links"
          :key="link.name"
          :to="{ name: link.name }"
          class="rounded-lg px-3 py-2 font-medium text-slate-600 transition hover:bg-slate-100
                 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800
                 dark:hover:text-white"
          active-class="bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
        >
          {{ link.label }}
          <span
            v-if="link.name === 'saved' && savedCount"
            class="ml-1 rounded-full bg-brand-600 px-1.5 py-0.5 text-xs font-semibold text-white"
          >
            {{ savedCount }}
          </span>
        </router-link>

        <button
          type="button"
          class="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900
                 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          title="Settings"
          aria-label="Settings"
          @click="$emit('open-settings')"
        >
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <circle cx="12" cy="12" r="3" />
            <path
              d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6 1.65 1.65 0 0 0 10 3.09V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.2.61.77 1 1.42 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
            />
          </svg>
        </button>

        <ThemeToggle />
      </nav>
    </div>
  </header>
</template>

<script setup>
import { computed } from "vue";
import { useStore } from "vuex";
import ThemeToggle from "@/components/ThemeToggle.vue";

defineEmits(["open-settings"]);

const store = useStore();
const savedCount = computed(() => store.state.saved.length);

const links = [
  { name: "search", label: "Search" },
  { name: "saved", label: "Saved" },
  { name: "about", label: "About" },
];
</script>
