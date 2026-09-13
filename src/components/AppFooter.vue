<template>
  <footer class="mt-16 border-t border-slate-200 py-8 dark:border-slate-800">
    <div
      class="mx-auto flex max-w-7xl flex-col gap-3 px-4 text-sm text-slate-500 sm:flex-row
             sm:items-center sm:justify-between sm:px-6 dark:text-slate-400"
    >
      <p>
        Live data from
        <template v-for="(source, index) in SOURCES" :key="source.id">
          <a
            :href="source.homepage"
            target="_blank"
            rel="noopener noreferrer"
            class="font-medium text-slate-700 underline-offset-2 hover:underline dark:text-slate-200"
          >{{ source.label }}</a><span v-if="index < SOURCES.length - 1">, </span>
        </template>.
      </p>
      <p>
        Built with Vue 3, Vite &amp; Tailwind ·
        <router-link :to="{ name: 'about' }" class="underline-offset-2 hover:underline">
          How it works
        </router-link>
      </p>
    </div>
  </footer>
</template>

<script setup>
import { SOURCES } from "@/api/sources";
</script>
