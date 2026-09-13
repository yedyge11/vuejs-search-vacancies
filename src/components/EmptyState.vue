<template>
  <div class="card flex flex-col items-center px-6 py-16 text-center">
    <div
      class="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800"
    >
      <svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" stroke-linecap="round" />
      </svg>
    </div>

    <h3 class="mt-4 text-base font-semibold text-slate-900 dark:text-white">{{ title }}</h3>
    <p class="mt-1.5 max-w-md text-sm text-slate-500 dark:text-slate-400">{{ description }}</p>

    <div v-if="$slots.actions" class="mt-6 flex flex-wrap justify-center gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, default: "No vacancies found" },
  description: {
    type: String,
    default: "Try a broader search term, or loosen the filters on the left.",
  },
});
</script>
