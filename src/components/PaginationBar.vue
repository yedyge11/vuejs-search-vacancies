<template>
  <nav v-if="totalPages > 1" class="flex items-center justify-center gap-1.5" aria-label="Pagination">
    <button type="button" class="btn-ghost px-3 py-1.5" :disabled="page === 1" @click="go(page - 1)">
      Prev
    </button>

    <template v-for="(item, index) in items" :key="`${item}-${index}`">
      <span v-if="item === '…'" class="px-2 text-sm text-slate-400">…</span>
      <button
        v-else
        type="button"
        class="min-w-[2.25rem] rounded-lg px-3 py-1.5 text-sm font-medium transition"
        :class="
          item === page
            ? 'bg-brand-600 text-white'
            : 'border border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800'
        "
        :aria-current="item === page ? 'page' : undefined"
        @click="go(item)"
      >
        {{ item }}
      </button>
    </template>

    <button
      type="button"
      class="btn-ghost px-3 py-1.5"
      :disabled="page === totalPages"
      @click="go(page + 1)"
    >
      Next
    </button>
  </nav>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  page: { type: Number, required: true },
  totalPages: { type: Number, required: true },
});

const emit = defineEmits(["change"]);

/** First, last, and a window around the current page; the rest as ellipses. */
const items = computed(() => {
  const { page, totalPages } = props;
  if (totalPages <= 7) return range(1, totalPages);

  const window = new Set([1, totalPages, page, page - 1, page + 1]);
  if (page <= 3) [2, 3, 4].forEach((n) => window.add(n));
  if (page >= totalPages - 2) [totalPages - 3, totalPages - 2, totalPages - 1].forEach((n) => window.add(n));

  const pages = [...window].filter((n) => n >= 1 && n <= totalPages).sort((a, b) => a - b);

  const out = [];
  let previous = 0;
  for (const current of pages) {
    if (previous && current - previous > 1) out.push("…");
    out.push(current);
    previous = current;
  }
  return out;
});

function range(from, to) {
  return Array.from({ length: to - from + 1 }, (_, index) => from + index);
}

function go(page) {
  if (page < 1 || page > props.totalPages || page === props.page) return;
  emit("change", page);
}
</script>
