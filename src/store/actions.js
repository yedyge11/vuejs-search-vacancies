import { fetchAllVacancies } from "@/api/sources";

/**
 * Only one search may be in flight. A user typing "vue" fires three searches
 * on the way there, and without this the slowest of them could land last and
 * overwrite the results for the query actually on screen.
 */
let inFlight = null;

export async function fetchVacancies({ commit, state }) {
  inFlight?.abort();
  const controller = new AbortController();
  inFlight = controller;

  commit("SET_LOADING", true);
  try {
    const { vacancies, errors, counts } = await fetchAllVacancies({
      query: state.query,
      sources: state.filters.sources,
      hhToken: state.settings.hhToken,
      hhArea: state.settings.hhArea,
      signal: controller.signal,
    });
    if (controller.signal.aborted) return;
    commit("SET_RESULTS", { vacancies, counts, errors });
  } catch (error) {
    if (controller.signal.aborted) return;
    commit("SET_ERRORS", [{ source: "app", message: error.message }]);
  } finally {
    if (inFlight === controller) {
      inFlight = null;
      commit("SET_LOADING", false);
    }
  }
}

export async function search({ commit, dispatch }, query) {
  commit("SET_QUERY", query);
  commit("PUSH_RECENT_QUERY", query);
  await dispatch("fetchVacancies");
}

/**
 * Toggling a source changes which APIs are called, so unlike every other
 * filter it needs a refetch.
 */
export async function toggleSource({ commit, state, dispatch }, sourceId) {
  const next = state.filters.sources.includes(sourceId)
    ? state.filters.sources.filter((id) => id !== sourceId)
    : [...state.filters.sources, sourceId];

  commit("SET_FILTER", { key: "sources", value: next });
  await dispatch("fetchVacancies");
}

export async function saveSettings({ commit, dispatch }, settings) {
  commit("SET_SETTINGS", settings);
  await dispatch("fetchVacancies");
}

export function setFilter({ commit }, payload) {
  commit("SET_FILTER", payload);
}

export function toggleInFilter({ commit }, payload) {
  commit("TOGGLE_IN_FILTER", payload);
}

export function resetFilters({ commit }) {
  commit("RESET_FILTERS");
}

export function setSort({ commit }, sort) {
  commit("SET_SORT", sort);
}

export function setPage({ commit, getters }, page) {
  commit("SET_PAGE", Math.min(Math.max(1, page), getters.totalPages));
}

export function toggleSaved({ commit }, vacancy) {
  commit("TOGGLE_SAVED", vacancy);
}

export function clearSaved({ commit }) {
  commit("CLEAR_SAVED");
}
