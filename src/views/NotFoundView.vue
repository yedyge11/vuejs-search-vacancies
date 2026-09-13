<template>
  <div class="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
    <p class="font-mono text-5xl font-bold text-brand-600 dark:text-brand-400">404</p>
    <h1 class="mt-4 text-xl font-semibold text-slate-900 dark:text-white">Page not found</h1>
    <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
      That route does not exist. The search board is where everything starts.
    </p>
    <router-link :to="{ name: 'search' }" class="btn-primary mt-6">Back to search</router-link>
  </div>
</template>
