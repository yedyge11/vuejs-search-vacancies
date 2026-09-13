import { readonly, ref } from "vue";
import { readRaw, STORAGE_KEYS, writeRaw } from "@/utils/storage";

/**
 * Module-level so every component shares one theme, and so the value matches
 * whatever the inline script in index.html already applied before Vue booted.
 */
const theme = ref(resolveInitialTheme());
apply(theme.value);

function resolveInitialTheme() {
  const saved = readRaw(STORAGE_KEYS.theme);
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function apply(value) {
  document.documentElement.classList.toggle("dark", value === "dark");
}

export function useTheme() {
  function setTheme(value) {
    theme.value = value;
    apply(value);
    writeRaw(STORAGE_KEYS.theme, value);
  }

  function toggleTheme() {
    setTheme(theme.value === "dark" ? "light" : "dark");
  }

  return { theme: readonly(theme), setTheme, toggleTheme };
}
