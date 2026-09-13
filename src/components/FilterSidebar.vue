<template>
  <aside class="space-y-6">
    <section class="card p-5">
      <div class="flex items-center justify-between">
        <h2 class="text-sm font-semibold text-slate-900 dark:text-white">Filters</h2>
        <button
          v-if="activeFilterCount"
          type="button"
          class="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400"
          @click="store.dispatch('resetFilters')"
        >
          Clear ({{ activeFilterCount }})
        </button>
      </div>

      <div class="mt-4 space-y-2">
        <label class="flex cursor-pointer items-center gap-2.5 text-sm">
          <input
            type="checkbox"
            class="rounded border-slate-300 text-brand-600 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-800"
            :checked="filters.remoteOnly"
            @change="setFilter('remoteOnly', $event.target.checked)"
          />
          <span class="text-slate-700 dark:text-slate-300">Remote only</span>
          <span class="ml-auto text-xs text-slate-400">{{ remoteCount }}</span>
        </label>

        <label class="flex cursor-pointer items-center gap-2.5 text-sm">
          <input
            type="checkbox"
            class="rounded border-slate-300 text-brand-600 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-800"
            :checked="filters.withSalary"
            @change="setFilter('withSalary', $event.target.checked)"
          />
          <span class="text-slate-700 dark:text-slate-300">Salary disclosed</span>
          <span class="ml-auto text-xs text-slate-400">{{ withSalaryCount }}</span>
        </label>
      </div>

      <div class="mt-5">
        <span class="field-label">Posted</span>
        <div class="grid grid-cols-2 gap-1.5">
          <button
            v-for="option in FRESHNESS_OPTIONS"
            :key="option.id"
            type="button"
            class="rounded-lg border px-2.5 py-1.5 text-xs font-medium transition"
            :class="
              filters.freshness === option.id
                ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
                : 'border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-300'
            "
            @click="setFilter('freshness', option.id)"
          >
            {{ option.label }}
          </button>
        </div>
      </div>

      <div class="mt-5">
        <span class="field-label">Seniority</span>
        <label
          v-for="level in SENIORITY_LEVELS"
          :key="level.id"
          class="flex cursor-pointer items-center gap-2.5 py-1 text-sm"
        >
          <input
            type="checkbox"
            class="rounded border-slate-300 text-brand-600 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-800"
            :checked="filters.seniority.includes(level.id)"
            @change="store.dispatch('toggleInFilter', { key: 'seniority', value: level.id })"
          />
          <span class="text-slate-700 dark:text-slate-300">{{ level.label }}</span>
        </label>
      </div>

      <div class="mt-5">
        <span class="field-label">Employment</span>
        <label
          v-for="type in EMPLOYMENT_TYPES"
          :key="type.id"
          class="flex cursor-pointer items-center gap-2.5 py-1 text-sm"
        >
          <input
            type="checkbox"
            class="rounded border-slate-300 text-brand-600 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-800"
            :checked="filters.employment.includes(type.id)"
            @change="store.dispatch('toggleInFilter', { key: 'employment', value: type.id })"
          />
          <span class="text-slate-700 dark:text-slate-300">{{ type.label }}</span>
        </label>
      </div>

      <div class="mt-5">
        <label for="min-salary" class="field-label">Minimum salary (USD / year)</label>
        <select
          id="min-salary"
          class="w-full rounded-lg border-slate-200 text-sm dark:border-slate-700 dark:bg-slate-800"
          :value="filters.minSalary"
          @change="setFilter('minSalary', Number($event.target.value))"
        >
          <option v-for="option in SALARY_STEPS" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
        <p class="mt-1.5 text-xs text-slate-400">
          Only applies to postings that publish a figure.
        </p>
      </div>
    </section>

    <section class="card p-5">
      <h2 class="text-sm font-semibold text-slate-900 dark:text-white">Sources</h2>
      <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
        Turning a source on or off re-runs the search.
      </p>

      <div class="mt-4 space-y-3">
        <div v-for="source in SOURCES" :key="source.id">
          <label class="flex cursor-pointer items-start gap-2.5 text-sm">
            <input
              type="checkbox"
              class="mt-0.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-800"
              :checked="filters.sources.includes(source.id)"
              :disabled="!source.keyless && !hasToken"
              @change="store.dispatch('toggleSource', source.id)"
            />
            <span class="min-w-0 flex-1">
              <span class="flex items-center gap-2">
                <span class="font-medium text-slate-800 dark:text-slate-200">{{ source.label }}</span>
                <span
                  v-if="sourceFacets[source.id] != null"
                  class="rounded-full bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                >
                  {{ sourceFacets[source.id] }}
                </span>
              </span>
              <span class="block text-xs text-slate-500 dark:text-slate-400">{{ source.blurb }}</span>
              <span
                v-if="!source.keyless && !hasToken"
                class="mt-1 block text-xs text-amber-600 dark:text-amber-400"
              >
                Needs an API token — add it in Settings.
              </span>
            </span>
          </label>
        </div>
      </div>
    </section>

    <section v-if="tagFacets.length" class="card p-5">
      <h2 class="text-sm font-semibold text-slate-900 dark:text-white">Tech stack</h2>
      <div class="mt-4 flex flex-wrap gap-1.5">
        <button
          v-for="facet in tagFacets"
          :key="facet.tag"
          type="button"
          :class="facet.active ? 'chip-active' : 'chip-idle'"
          @click="store.dispatch('toggleInFilter', { key: 'tags', value: facet.tag })"
        >
          {{ facet.tag }}
          <span :class="facet.active ? 'text-white/70' : 'text-slate-400'">{{ facet.count }}</span>
        </button>
      </div>
    </section>
  </aside>
</template>

<script setup>
import { computed } from "vue";
import { useStore } from "vuex";
import { SOURCES } from "@/api/sources";
import { EMPLOYMENT_TYPES, SENIORITY_LEVELS } from "@/utils/taxonomy";

const store = useStore();

const filters = computed(() => store.state.filters);
const hasToken = computed(() => Boolean(store.state.settings.hhToken));
const tagFacets = computed(() => store.getters.tagFacets);
const sourceFacets = computed(() => store.getters.sourceFacets);
const remoteCount = computed(() => store.getters.remoteCount);
const withSalaryCount = computed(() => store.getters.withSalaryCount);
const activeFilterCount = computed(() => store.getters.activeFilterCount);

const FRESHNESS_OPTIONS = [
  { id: "any", label: "Any time" },
  { id: "day", label: "Last 24h" },
  { id: "week", label: "This week" },
  { id: "month", label: "This month" },
];

const SALARY_STEPS = [
  { value: 0, label: "Any" },
  { value: 40000, label: "$40k+" },
  { value: 60000, label: "$60k+" },
  { value: 80000, label: "$80k+" },
  { value: 100000, label: "$100k+" },
  { value: 150000, label: "$150k+" },
];

function setFilter(key, value) {
  store.dispatch("setFilter", { key, value });
}
</script>
