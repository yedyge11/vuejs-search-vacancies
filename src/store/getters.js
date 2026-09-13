import { annualValue } from "@/utils/format";

const FRESHNESS_DAYS = { day: 1, week: 7, month: 30 };

/**
 * Filtering happens here rather than at the API, because two of the three
 * providers ignore their own filter parameters. Fetching once and faceting in
 * memory also means changing a checkbox is instant and costs no requests.
 */
export const filteredVacancies = (state) => {
  const { filters, query } = state;
  const terms = tokenize(query);

  return state.vacancies.filter((vacancy) => {
    if (!filters.sources.includes(vacancy.source)) return false;
    if (filters.remoteOnly && !vacancy.remote) return false;
    if (filters.withSalary && !vacancy.salary) return false;

    if (filters.seniority.length && !filters.seniority.includes(vacancy.seniority)) return false;
    if (filters.employment.length && !filters.employment.includes(vacancy.employment)) return false;

    if (filters.tags.length) {
      const owned = vacancy.tags.map((tag) => tag.toLowerCase());
      if (!filters.tags.every((tag) => owned.includes(tag.toLowerCase()))) return false;
    }

    if (filters.minSalary > 0) {
      const yearly = annualValue(vacancy.salary);
      if (yearly == null || yearly < filters.minSalary) return false;
    }

    const maxDays = FRESHNESS_DAYS[filters.freshness];
    if (maxDays && !isWithinDays(vacancy.publishedAt, maxDays)) return false;

    // The providers that do support text search each interpret it their own
    // way, so the query is re-applied locally to keep results consistent.
    if (terms.length && !terms.every((term) => vacancy.haystack.includes(term))) return false;

    return true;
  });
};

export const sortedVacancies = (state, getters) => {
  const list = [...getters.filteredVacancies];
  const terms = tokenize(state.query);

  switch (state.sort) {
    case "newest":
      return list.sort(byDateDesc);
    case "salary":
      return list.sort((a, b) => (annualValue(b.salary) ?? -1) - (annualValue(a.salary) ?? -1));
    case "company":
      return list.sort((a, b) => a.company.localeCompare(b.company));
    default:
      return list.sort((a, b) => {
        const diff = relevanceScore(b, terms) - relevanceScore(a, terms);
        return diff !== 0 ? diff : byDateDesc(a, b);
      });
  }
};

export const totalResults = (state, getters) => getters.filteredVacancies.length;

export const totalPages = (state, getters) =>
  Math.max(1, Math.ceil(getters.totalResults / state.perPage));

export const pagedVacancies = (state, getters) => {
  const start = (state.page - 1) * state.perPage;
  return getters.sortedVacancies.slice(start, start + state.perPage);
};

/** Tag cloud for the sidebar, counted over everything the other filters allow. */
export const tagFacets = (state, getters) => {
  const counts = new Map();
  for (const vacancy of getters.filteredVacancies) {
    for (const tag of vacancy.tags) counts.set(tag, (counts.get(tag) || 0) + 1);
  }
  // Selected tags stay pinned even at count 1, so they can be switched off.
  for (const tag of state.filters.tags) if (!counts.has(tag)) counts.set(tag, 0);

  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count, active: state.filters.tags.includes(tag) }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
    .slice(0, 24);
};

/** How many *currently visible* results each source contributes. */
export const sourceFacets = (state, getters) => {
  const counts = {};
  for (const vacancy of getters.filteredVacancies) {
    counts[vacancy.source] = (counts[vacancy.source] || 0) + 1;
  }
  return counts;
};

export const remoteCount = (state, getters) =>
  getters.filteredVacancies.filter((vacancy) => vacancy.remote).length;

export const withSalaryCount = (state, getters) =>
  getters.filteredVacancies.filter((vacancy) => vacancy.salary).length;

export const companyCount = (state, getters) =>
  new Set(getters.filteredVacancies.map((vacancy) => vacancy.company)).size;

export const savedIds = (state) => new Set(state.saved.map((vacancy) => vacancy.id));

export const isSaved = (state, getters) => (id) => getters.savedIds.has(id);

/**
 * Detail pages are reachable by direct URL, so look in the saved list too -
 * that copy survives a reload when the search results do not.
 */
export const vacancyById = (state) => (id) =>
  state.vacancies.find((vacancy) => vacancy.id === id) ||
  state.saved.find((vacancy) => vacancy.id === id) ||
  null;

export const activeFilterCount = (state) => {
  const { filters } = state;
  return (
    (filters.remoteOnly ? 1 : 0) +
    (filters.withSalary ? 1 : 0) +
    (filters.freshness !== "any" ? 1 : 0) +
    (filters.minSalary > 0 ? 1 : 0) +
    filters.seniority.length +
    filters.employment.length +
    filters.tags.length
  );
};

function tokenize(query) {
  return String(query || "")
    .toLowerCase()
    .split(/[\s,]+/)
    .map((term) => term.trim())
    .filter((term) => term.length > 1);
}

function byDateDesc(a, b) {
  return new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0);
}

/** Title hits beat tag hits beat body hits; freshness breaks near-ties. */
function relevanceScore(vacancy, terms) {
  let score = 0;
  const title = vacancy.title.toLowerCase();
  const tags = vacancy.tags.join(" ").toLowerCase();

  for (const term of terms) {
    if (title.includes(term)) score += 10;
    if (tags.includes(term)) score += 6;
    if (vacancy.company.toLowerCase().includes(term)) score += 3;
  }
  if (vacancy.salary) score += 2;
  if (isWithinDays(vacancy.publishedAt, 7)) score += 2;
  return score;
}

function isWithinDays(isoDate, days) {
  if (!isoDate) return false;
  const published = new Date(isoDate).getTime();
  if (Number.isNaN(published)) return false;
  return Date.now() - published <= days * 86400000;
}
