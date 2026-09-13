<template>
  <article class="card animate-fade-in-up p-5 hover:border-brand-300 hover:shadow-md dark:hover:border-brand-700">
    <div class="flex items-start gap-4">
      <CompanyAvatar :company="vacancy.company" :logo="vacancy.companyLogo" />

      <div class="min-w-0 flex-1">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <h3 class="truncate text-base font-semibold text-slate-900 dark:text-white">
              <router-link
                :to="detailRoute"
                class="hover:text-brand-600 dark:hover:text-brand-400"
              >
                {{ vacancy.title }}
              </router-link>
            </h3>
            <p class="mt-0.5 truncate text-sm text-slate-600 dark:text-slate-400">
              {{ vacancy.company }}
            </p>
          </div>

          <button
            type="button"
            class="shrink-0 rounded-lg p-1.5 transition"
            :class="
              saved
                ? 'text-brand-600 dark:text-brand-400'
                : 'text-slate-300 hover:text-brand-500 dark:text-slate-600 dark:hover:text-brand-400'
            "
            :aria-pressed="saved"
            :title="saved ? 'Remove from saved' : 'Save this vacancy'"
            @click="toggleSaved"
          >
            <svg
              class="h-5 w-5"
              viewBox="0 0 24 24"
              :fill="saved ? 'currentColor' : 'none'"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linejoin="round"
            >
              <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4.5L5 21V4a1 1 0 0 1 1-1Z" />
            </svg>
          </button>
        </div>

        <dl class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-slate-600 dark:text-slate-400">
          <div class="flex items-center gap-1.5">
            <dt class="sr-only">Location</dt>
            <svg class="h-4 w-4 shrink-0 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
            <dd class="truncate">{{ vacancy.location }}</dd>
          </div>

          <div v-if="salaryLabel" class="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
            <dt class="sr-only">Salary</dt>
            <svg class="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M12 2v20M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke-linecap="round" />
            </svg>
            <dd>{{ salaryLabel }}</dd>
          </div>

          <div v-if="postedLabel" class="flex items-center gap-1.5">
            <dt class="sr-only">Published</dt>
            <svg class="h-4 w-4 shrink-0 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" stroke-linecap="round" />
            </svg>
            <dd>{{ postedLabel }}</dd>
          </div>
        </dl>

        <p v-if="vacancy.excerpt" class="mt-3 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
          {{ vacancy.excerpt }}
        </p>

        <div class="mt-4 flex flex-wrap items-center gap-2">
          <SourceBadge :source="vacancy.source" />

          <span v-if="vacancy.remote" class="chip border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-500/10 dark:text-sky-300">
            Remote
          </span>
          <span v-if="seniorityLabel" class="chip-idle">{{ seniorityLabel }}</span>
          <span v-if="employmentLabel" class="chip-idle">{{ employmentLabel }}</span>

          <button
            v-for="tag in vacancy.tags.slice(0, 4)"
            :key="tag"
            type="button"
            class="chip-idle"
            :title="`Filter by ${tag}`"
            @click="$emit('filter-tag', tag)"
          >
            {{ tag }}
          </button>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from "vue";
import { useStore } from "vuex";
import CompanyAvatar from "@/components/CompanyAvatar.vue";
import SourceBadge from "@/components/SourceBadge.vue";
import { formatSalary, relativeTime } from "@/utils/format";
import { EMPLOYMENT_TYPES, SENIORITY_LEVELS } from "@/utils/taxonomy";

const props = defineProps({
  vacancy: { type: Object, required: true },
});

defineEmits(["filter-tag"]);

const store = useStore();

const saved = computed(() => store.getters.isSaved(props.vacancy.id));
const salaryLabel = computed(() => formatSalary(props.vacancy.salary));
const postedLabel = computed(() => relativeTime(props.vacancy.publishedAt));

const seniorityLabel = computed(
  () => SENIORITY_LEVELS.find((level) => level.id === props.vacancy.seniority)?.label
);
const employmentLabel = computed(
  () => EMPLOYMENT_TYPES.find((type) => type.id === props.vacancy.employment)?.label
);

// Ids are "<source>:<provider id>"; the provider half becomes the URL tail.
const detailRoute = computed(() => ({
  name: "vacancy",
  params: {
    source: props.vacancy.source,
    id: props.vacancy.id.slice(props.vacancy.source.length + 1),
  },
}));

function toggleSaved() {
  store.dispatch("toggleSaved", props.vacancy);
}
</script>
