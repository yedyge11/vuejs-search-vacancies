import { DEFAULT_FILTERS } from "./state";

const MAX_RECENT_QUERIES = 6;

export function SET_QUERY(state, query) {
  state.query = query;
  state.page = 1;
}

export function SET_LOADING(state, loading) {
  state.loading = loading;
}

export function SET_RESULTS(state, { vacancies, counts, errors }) {
  state.vacancies = vacancies;
  state.counts = counts;
  state.errors = errors;
  state.loaded = true;
  state.fetchedAt = new Date().toISOString();
  state.page = 1;
}

export function SET_ERRORS(state, errors) {
  state.errors = errors;
}

export function SET_SORT(state, sort) {
  state.sort = sort;
  state.page = 1;
}

export function SET_PAGE(state, page) {
  state.page = page;
}

/** Any filter change invalidates the current page number. */
export function SET_FILTER(state, { key, value }) {
  state.filters = { ...state.filters, [key]: value };
  state.page = 1;
}

export function TOGGLE_IN_FILTER(state, { key, value }) {
  const current = state.filters[key];
  const next = current.includes(value)
    ? current.filter((item) => item !== value)
    : [...current, value];
  state.filters = { ...state.filters, [key]: next };
  state.page = 1;
}

export function RESET_FILTERS(state) {
  // Source selection is a deliberate choice about where to search, not a
  // result filter, so "clear filters" leaves it alone.
  state.filters = { ...DEFAULT_FILTERS, sources: [...state.filters.sources] };
  state.page = 1;
}

export function SET_SETTINGS(state, settings) {
  state.settings = { ...state.settings, ...settings };
}

export function TOGGLE_SAVED(state, vacancy) {
  const exists = state.saved.some((item) => item.id === vacancy.id);
  state.saved = exists
    ? state.saved.filter((item) => item.id !== vacancy.id)
    : [{ ...vacancy, savedAt: new Date().toISOString() }, ...state.saved];
}

export function CLEAR_SAVED(state) {
  state.saved = [];
}

export function PUSH_RECENT_QUERY(state, query) {
  const clean = query.trim();
  if (!clean) return;
  state.recentQueries = [clean, ...state.recentQueries.filter((item) => item !== clean)].slice(
    0,
    MAX_RECENT_QUERIES
  );
}
