/**
 * localStorage with the sharp edges removed: private-mode browsers and
 * blocked site data throw on access, and a corrupted value should never be
 * able to stop the app from booting.
 */
const PREFIX = "devboard:";

export function readStore(key, fallback) {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (raw == null) return fallback;
    return JSON.parse(raw);
  } catch (error) {
    return fallback;
  }
}

export function writeStore(key, value) {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch (error) {
    return false;
  }
}

export function removeStore(key) {
  try {
    window.localStorage.removeItem(PREFIX + key);
  } catch (error) {
    /* nothing we can do, and nothing that should break the page */
  }
}

/**
 * Plain-string variants. The theme is also read by the inline script in
 * index.html before Vue boots, so it must not be JSON-wrapped.
 */
export function readRaw(key, fallback = null) {
  try {
    return window.localStorage.getItem(PREFIX + key) ?? fallback;
  } catch (error) {
    return fallback;
  }
}

export function writeRaw(key, value) {
  try {
    window.localStorage.setItem(PREFIX + key, value);
    return true;
  } catch (error) {
    return false;
  }
}

export const STORAGE_KEYS = {
  saved: "saved",
  settings: "settings",
  filters: "filters",
  theme: "theme",
  recentQueries: "recent-queries",
};
