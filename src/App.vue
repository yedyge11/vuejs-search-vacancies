<template>
  <div class="flex min-h-full flex-col">
    <AppHeader @open-settings="settingsOpen = true" />

    <main class="flex-1">
      <router-view v-slot="{ Component }">
        <component :is="Component" />
      </router-view>
    </main>

    <AppFooter />

    <SettingsDialog v-if="settingsOpen" @close="settingsOpen = false" />
  </div>
</template>

<script setup>
import { ref } from "vue";
import AppHeader from "@/components/AppHeader.vue";
import AppFooter from "@/components/AppFooter.vue";
import SettingsDialog from "@/components/SettingsDialog.vue";

const settingsOpen = ref(false);
</script>
