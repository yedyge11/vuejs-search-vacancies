import { DEFAULT_SOURCE_IDS } from "@/api/sources";
import { readStore, STORAGE_KEYS } from "@/utils/storage";

export const DEFAULT_FILTERS = {
  sources: [...DEFAULT_SOURCE_IDS],
  remoteOnly: false,
  withSalary: false,
  seniority: [],
  employment: [],
  tags: [],
  freshness: "any", // any | day | week | month
  minSalary: 0,
};

export const DEFAULT_SETTINGS = {
  hhToken: "",
  hhArea: "40",
};

export const PER_PAGE = 12;

/**
 * Filters and settings are restored from localStorage, but the vacancy list
 * never is: postings expire, and a board that opens with yesterday's data
 * would be lying to the user.
 */
export default {
  query: "",
  vacancies: [],
  counts: {},
  errors: [],
  loading: false,
  loaded: false,
  fetchedAt: null,

  filters: { ...DEFAULT_FILTERS, ...readStore(STORAGE_KEYS.filters, {}) },
  settings: { ...DEFAULT_SETTINGS, ...readStore(STORAGE_KEYS.settings, {}) },
  sort: "relevance", // relevance | newest | salary | company
  page: 1,
  perPage: PER_PAGE,

  saved: readStore(STORAGE_KEYS.saved, []),
  recentQueries: readStore(STORAGE_KEYS.recentQueries, []),
};
