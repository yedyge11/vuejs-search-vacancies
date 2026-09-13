<template>
  <div class="mx-auto max-w-3xl px-4 py-10 sm:px-6">
    <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
      How DevBoard works
    </h1>
    <p class="mt-3 text-slate-600 dark:text-slate-400">
      There is no backend. Your browser calls each job API directly, and everything after that —
      normalising, de-duplicating, filtering, ranking — happens on this page. Nothing you search
      for is recorded anywhere.
    </p>

    <h2 class="mt-10 text-lg font-semibold text-slate-900 dark:text-white">Data sources</h2>
    <div class="mt-4 space-y-3">
      <div v-for="source in SOURCES" :key="source.id" class="card p-5">
        <div class="flex flex-wrap items-center gap-3">
          <SourceBadge :source="source.id" />
          <span
            class="chip"
            :class="
              source.keyless
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300'
                : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-500/10 dark:text-amber-300'
            "
          >
            {{ source.keyless ? "No key needed" : "Token required" }}
          </span>
        </div>

        <p class="mt-3 text-sm text-slate-600 dark:text-slate-400">{{ source.blurb }}</p>

        <div class="mt-3 flex flex-wrap gap-4 text-sm">
          <a :href="source.homepage" target="_blank" rel="noopener noreferrer" class="font-medium text-brand-600 hover:underline dark:text-brand-400">
            Website
          </a>
          <a :href="source.docs" target="_blank" rel="noopener noreferrer" class="font-medium text-brand-600 hover:underline dark:text-brand-400">
            API docs
          </a>
        </div>
      </div>
    </div>

    <h2 class="mt-10 text-lg font-semibold text-slate-900 dark:text-white">
      Why some results look different
    </h2>
    <ul class="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-400">
      <li class="flex gap-3">
        <span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
        <span>
          Two of the three open APIs ignore their own search and filter parameters, so DevBoard
          fetches a wide slice and filters it here. That is why the facet counts update instantly
          but a brand-new search takes a moment.
        </span>
      </li>
      <li class="flex gap-3">
        <span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
        <span>
          Seniority, employment type and the tech tags are rarely supplied. When a provider does
          not send them they are inferred from the job title and description, so treat them as a
          good guess rather than gospel.
        </span>
      </li>
      <li class="flex gap-3">
        <span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
        <span>
          Arbeitnow is a general board, so non-technical postings are filtered out before you see
          them. A handful of edge cases will always slip through in both directions.
        </span>
      </li>
      <li class="flex gap-3">
        <span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
        <span>
          Salaries are published by a minority of employers, and often as free text. They are
          parsed into a comparable yearly figure where possible; where it is not, the original
          string is shown untouched.
        </span>
      </li>
    </ul>

    <h2 class="mt-10 text-lg font-semibold text-slate-900 dark:text-white">Built with</h2>
    <p class="mt-3 text-sm text-slate-600 dark:text-slate-400">
      Vue 3 (<code class="font-mono text-xs">script setup</code>), Vue Router, Vuex, Axios, Vite
      and Tailwind CSS — the same stack as its predecessor, a meal-search app, rebuilt around
      job data.
    </p>
  </div>
</template>

<script setup>
import SourceBadge from "@/components/SourceBadge.vue";
import { SOURCES } from "@/api/sources";
</script>
