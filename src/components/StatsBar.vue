<template>
  <dl class="grid grid-cols-2 gap-3 sm:grid-cols-4">
    <div v-for="stat in stats" :key="stat.label" class="card px-4 py-3">
      <dt class="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {{ stat.label }}
      </dt>
      <dd class="mt-1 text-2xl font-semibold tabular-nums text-slate-900 dark:text-white">
        {{ stat.value }}
      </dd>
    </div>
  </dl>
</template>

<script setup>
import { computed } from "vue";
import { useStore } from "vuex";

const store = useStore();

const stats = computed(() => [
  { label: "Vacancies", value: store.getters.totalResults },
  { label: "Companies", value: store.getters.companyCount },
  { label: "Remote", value: store.getters.remoteCount },
  { label: "With salary", value: store.getters.withSalaryCount },
]);
</script>
