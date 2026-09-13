<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset"
    :class="style.badge"
    :title="meta?.blurb"
  >
    <span class="h-1.5 w-1.5 rounded-full" :class="style.dot" aria-hidden="true" />
    {{ meta?.label || source }}
  </span>
</template>

<script setup>
import { computed } from "vue";
import { getSourceMeta } from "@/api/sources";
import { sourceStyle } from "@/utils/sourceStyles";

const props = defineProps({
  source: { type: String, required: true },
});

const meta = computed(() => getSourceMeta(props.source));
const style = computed(() => sourceStyle(props.source));
</script>
