<template>
  <img
    v-if="logo && !broken"
    :src="logo"
    :alt="`${company} logo`"
    loading="lazy"
    class="shrink-0 rounded-lg bg-white object-contain ring-1 ring-slate-200 dark:ring-slate-700"
    :class="sizeClass"
    @error="broken = true"
  />
  <span
    v-else
    class="flex shrink-0 items-center justify-center rounded-lg font-semibold text-white"
    :class="sizeClass"
    :style="{ backgroundColor: `hsl(${avatar.hue} 55% 45%)` }"
    aria-hidden="true"
  >
    {{ avatar.letters }}
  </span>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { initialsAvatar } from "@/utils/format";

const props = defineProps({
  company: { type: String, default: "" },
  logo: { type: String, default: null },
  size: { type: String, default: "md" }, // md | lg
});

// Job boards hotlink employer logos, and a fair share of them 404.
const broken = ref(false);
watch(() => props.logo, () => (broken.value = false));

const avatar = computed(() => initialsAvatar(props.company));
const sizeClass = computed(() =>
  props.size === "lg" ? "h-14 w-14 p-1.5 text-lg" : "h-11 w-11 p-1 text-sm"
);
</script>
