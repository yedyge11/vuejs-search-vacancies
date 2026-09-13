<template>
  <button
    type="button"
    class="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900
           dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
    :title="theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'"
    :aria-label="theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'"
    @click="toggleTheme"
  >
    <svg
      v-if="theme === 'dark'"
      class="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
    <svg v-else class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </svg>
  </button>
</template>

<script setup>
import { useTheme } from "@/composables/useTheme";

const { theme, toggleTheme } = useTheme();
</script>
