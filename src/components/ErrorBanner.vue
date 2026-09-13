<template>
  <div
    v-if="errors.length"
    class="rounded-xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-500/40 dark:bg-amber-500/10"
    role="status"
  >
    <div class="flex items-start gap-3">
      <svg
        class="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
      >
        <path d="M12 9v4M12 17h.01" />
        <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
      </svg>

      <div class="min-w-0 flex-1">
        <p class="text-sm font-semibold text-amber-900 dark:text-amber-200">
          {{ errors.length === 1 ? "One source could not be reached" : `${errors.length} sources could not be reached` }}
        </p>
        <ul class="mt-1 space-y-0.5 text-sm text-amber-800 dark:text-amber-300">
          <li v-for="error in errors" :key="error.source + error.message">{{ error.message }}</li>
        </ul>
        <p class="mt-1.5 text-xs text-amber-700 dark:text-amber-400">
          Results from the other sources are still shown below.
        </p>
      </div>

      <button
        type="button"
        class="shrink-0 rounded-lg border border-amber-300 px-3 py-1.5 text-xs font-medium
               text-amber-900 transition hover:bg-amber-100 dark:border-amber-500/40
               dark:text-amber-200 dark:hover:bg-amber-500/20"
        @click="$emit('retry')"
      >
        Retry
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  errors: { type: Array, default: () => [] },
});

defineEmits(["retry"]);
</script>
