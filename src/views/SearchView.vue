<template>
  <div>
    <section class="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div class="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <h1 class="max-w-2xl text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          Every open IT role, from one search box.
        </h1>
        <p class="mt-3 max-w-2xl text-slate-600 dark:text-slate-400">
          DevBoard queries {{ SOURCES.length }} public job APIs live, normalises what they return
          and lets you slice it by stack, seniority, salary and freshness.
        </p>

        <div class="mt-8 max-w-3xl">
          <SearchBar @search="runSearch" />
        </div>
      </div>
    </section>

    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <ErrorBanner :errors="errors" class="mb-6" @retry="refresh" />

      <StatsBar v-if="loaded" class="mb-6" />

      <div class="lg:grid lg:grid-cols-[18rem_1fr] lg:gap-8">
        <div class="mb-6 lg:mb-0">
          <button
            type="button"
            class="btn-ghost mb-3 w-full lg:hidden"
            :aria-expanded="filtersOpen"
            @click="filtersOpen = !filtersOpen"
          >
            {{ filtersOpen ? "Hide" : "Show" }} filters
            <span v-if="activeFilterCount" class="rounded-full bg-brand-600 px-1.5 text-xs text-white">
              {{ activeFilterCount }}
            </span>
          </button>

          <FilterSidebar v-show="filtersOpen || isDesktop" />
        </div>

        <div class="min-w-0">
          <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p class="text-sm text-slate-600 dark:text-slate-400">
              <template v-if="loading">Searching {{ activeSourceCount }} sources…</template>
              <template v-else-if="loaded">
                <strong class="font-semibold text-slate-900 dark:text-white">{{ totalResults }}</strong>
                {{ totalResults === 1 ? "vacancy" : "vacancies" }}
                <template v-if="query"> for “{{ query }}”</template>
                <span v-if="fetchedLabel" class="text-slate-400"> · updated {{ fetchedLabel }}</span>
              </template>
            </p>

            <div class="flex items-center gap-2">
              <label for="sort" class="text-sm text-slate-500 dark:text-slate-400">Sort</label>
              <select
                id="sort"
                class="rounded-lg border-slate-200 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800"
                :value="sort"
                @change="store.dispatch('setSort', $event.target.value)"
              >
                <option value="relevance">Most relevant</option>
                <option value="newest">Newest first</option>
                <option value="salary">Highest salary</option>
                <option value="company">Company A–Z</option>
              </select>
            </div>
          </div>

          <div v-if="loading" class="space-y-4">
            <SkeletonCard v-for="n in 5" :key="n" />
          </div>

          <template v-else-if="vacancies.length">
            <div class="space-y-4">
              <VacancyCard
                v-for="vacancy in vacancies"
                :key="vacancy.id"
                :vacancy="vacancy"
                @filter-tag="onFilterTag"
              />
            </div>

            <PaginationBar
              class="mt-8"
              :page="page"
              :total-pages="totalPages"
              @change="changePage"
            />
          </template>

          <EmptyState
            v-else-if="loaded"
            :title="query ? `Nothing matched “${query}”` : 'No vacancies to show'"
            description="The sources are live, so results change through the day. Try a broader term or clear a filter."
          >
            <template #actions>
              <button v-if="activeFilterCount" type="button" class="btn-ghost" @click="store.dispatch('resetFilters')">
                Clear filters
              </button>
              <button type="button" class="btn-primary" @click="runSearch('')">
                Browse everything
              </button>
            </template>
          </EmptyState>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import SearchBar from "@/components/SearchBar.vue";
import FilterSidebar from "@/components/FilterSidebar.vue";
import VacancyCard from "@/components/VacancyCard.vue";
import SkeletonCard from "@/components/SkeletonCard.vue";
import EmptyState from "@/components/EmptyState.vue";
import ErrorBanner from "@/components/ErrorBanner.vue";
import PaginationBar from "@/components/PaginationBar.vue";
import StatsBar from "@/components/StatsBar.vue";
import { SOURCES } from "@/api/sources";
import { relativeTime } from "@/utils/format";

const store = useStore();
const route = useRoute();
const router = useRouter();

const loading = computed(() => store.state.loading);
const loaded = computed(() => store.state.loaded);
const errors = computed(() => store.state.errors);
const query = computed(() => store.state.query);
const sort = computed(() => store.state.sort);
const page = computed(() => store.state.page);
const vacancies = computed(() => store.getters.pagedVacancies);
const totalResults = computed(() => store.getters.totalResults);
const totalPages = computed(() => store.getters.totalPages);
const activeFilterCount = computed(() => store.getters.activeFilterCount);
const activeSourceCount = computed(() => store.state.filters.sources.length);

// Recomputed on every fetch rather than ticking, which is precise enough for
// a label that only ever says "2 minutes ago".
const fetchedLabel = computed(() => relativeTime(store.state.fetchedAt));

const filtersOpen = ref(false);
const isDesktop = ref(true);
let media = null;

function syncViewport(event) {
  isDesktop.value = event.matches;
}

onMounted(() => {
  media = window.matchMedia("(min-width: 1024px)");
  isDesktop.value = media.matches;
  media.addEventListener("change", syncViewport);

  // A shared URL should reproduce the search it was copied from.
  const initial = typeof route.query.q === "string" ? route.query.q : "";
  if (initial) store.commit("SET_QUERY", initial);
  if (!store.state.loaded) store.dispatch("fetchVacancies");
});

onBeforeUnmount(() => media?.removeEventListener("change", syncViewport));

// Back/forward between two searches should actually change the results.
watch(
  () => route.query.q,
  (value) => {
    const next = typeof value === "string" ? value : "";
    if (next !== store.state.query) store.dispatch("search", next);
  }
);

function runSearch(value) {
  const trimmed = String(value || "").trim();
  router.push({ name: "search", query: trimmed ? { q: trimmed } : {} });
  if (trimmed === store.state.query) store.dispatch("fetchVacancies");
}

function refresh() {
  store.dispatch("fetchVacancies");
}

function onFilterTag(tag) {
  store.dispatch("toggleInFilter", { key: "tags", value: tag });
}

function changePage(value) {
  store.dispatch("setPage", value);
  window.scrollTo({ top: 0, behavior: "smooth" });
}
</script>
