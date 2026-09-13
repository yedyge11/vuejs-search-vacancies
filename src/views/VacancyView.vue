<template>
  <div class="mx-auto max-w-4xl px-4 py-8 sm:px-6">
    <button type="button" class="mb-6 text-sm font-medium text-brand-600 hover:underline dark:text-brand-400" @click="goBack">
      ← Back to results
    </button>

    <template v-if="vacancy">
      <article class="card overflow-hidden">
        <header class="border-b border-slate-200 p-6 dark:border-slate-800">
          <div class="flex items-start gap-4">
            <CompanyAvatar :company="vacancy.company" :logo="vacancy.companyLogo" size="lg" />

            <div class="min-w-0 flex-1">
              <h1 class="text-xl font-bold text-slate-900 sm:text-2xl dark:text-white">
                {{ vacancy.title }}
              </h1>
              <p class="mt-1 text-slate-600 dark:text-slate-400">{{ vacancy.company }}</p>

              <div class="mt-4 flex flex-wrap gap-2">
                <SourceBadge :source="vacancy.source" />
                <span v-if="vacancy.remote" class="chip border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-500/10 dark:text-sky-300">
                  Remote
                </span>
                <span v-for="tag in vacancy.tags" :key="tag" class="chip-idle">{{ tag }}</span>
              </div>
            </div>
          </div>

          <dl class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div v-for="fact in facts" :key="fact.label">
              <dt class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {{ fact.label }}
              </dt>
              <dd class="mt-1 text-sm font-medium text-slate-900 dark:text-white">{{ fact.value }}</dd>
            </div>
          </dl>

          <div class="mt-6 flex flex-wrap gap-3">
            <a :href="vacancy.url" target="_blank" rel="noopener noreferrer" class="btn-primary">
              Apply on {{ sourceLabel }}
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <path d="M7 17 17 7M9 7h8v8" />
              </svg>
            </a>

            <button type="button" class="btn-ghost" @click="store.dispatch('toggleSaved', vacancy)">
              {{ saved ? "Saved ✓" : "Save for later" }}
            </button>

            <button type="button" class="btn-ghost" @click="copyLink">
              {{ copied ? "Link copied" : "Copy link" }}
            </button>
          </div>
        </header>

        <div class="p-6">
          <h2 class="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Description
          </h2>

          <!-- Provider HTML, stripped of scripts and handlers in normalize.js. -->
          <div
            v-if="vacancy.descriptionHtml"
            class="job-body prose prose-slate max-w-none prose-a:text-brand-600 dark:prose-invert"
            v-html="vacancy.descriptionHtml"
          />
          <p v-else class="text-sm text-slate-500 dark:text-slate-400">
            This source did not include a description. Open the original posting to read it.
          </p>
        </div>
      </article>
    </template>

    <EmptyState
      v-else
      title="This vacancy is not loaded"
      description="Vacancy details come from a live search, so a direct link only works while the results are in memory. Run the search again, or open it from your saved list."
    >
      <template #actions>
        <router-link :to="{ name: 'search' }" class="btn-primary">Back to search</router-link>
        <router-link :to="{ name: 'saved' }" class="btn-ghost">Saved vacancies</router-link>
      </template>
    </EmptyState>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import CompanyAvatar from "@/components/CompanyAvatar.vue";
import SourceBadge from "@/components/SourceBadge.vue";
import EmptyState from "@/components/EmptyState.vue";
import { getSourceMeta } from "@/api/sources";
import { formatDate, formatSalary, relativeTime } from "@/utils/format";
import { EMPLOYMENT_TYPES, SENIORITY_LEVELS } from "@/utils/taxonomy";

const store = useStore();
const route = useRoute();
const router = useRouter();

const vacancyId = computed(() => `${route.params.source}:${route.params.id}`);
const vacancy = computed(() => store.getters.vacancyById(vacancyId.value));
const saved = computed(() => store.getters.isSaved(vacancyId.value));
const sourceLabel = computed(() => getSourceMeta(vacancy.value?.source)?.label || "the source");

const facts = computed(() => {
  if (!vacancy.value) return [];
  const { location, salary, employment, seniority, publishedAt } = vacancy.value;

  return [
    { label: "Location", value: location },
    { label: "Salary", value: formatSalary(salary) || "Not disclosed" },
    {
      label: "Employment",
      value:
        EMPLOYMENT_TYPES.find((type) => type.id === employment)?.label ||
        SENIORITY_LEVELS.find((level) => level.id === seniority)?.label ||
        "Not specified",
    },
    {
      label: "Published",
      value: publishedAt ? `${formatDate(publishedAt)} (${relativeTime(publishedAt)})` : "Unknown",
    },
  ];
});

const copied = ref(false);
async function copyLink() {
  try {
    await navigator.clipboard.writeText(vacancy.value.url);
    copied.value = true;
    setTimeout(() => (copied.value = false), 2000);
  } catch (error) {
    // Clipboard access can be denied; the Apply link is still right there.
    window.prompt("Copy the link:", vacancy.value.url);
  }
}

function goBack() {
  if (window.history.state?.back) router.back();
  else router.push({ name: "search" });
}
</script>
