import { createStore } from "vuex";
import state from "./state";
import * as actions from "./actions";
import * as mutations from "./mutations";
import * as getters from "./getters";
import { STORAGE_KEYS, writeStore } from "@/utils/storage";

/**
 * Mirror the durable slices of state into localStorage. Writing on every
 * mutation would be wasteful, so only the mutations that actually change
 * persisted data trigger a write.
 */
const PERSISTED = {
  TOGGLE_SAVED: (store) => writeStore(STORAGE_KEYS.saved, store.saved),
  CLEAR_SAVED: (store) => writeStore(STORAGE_KEYS.saved, store.saved),
  SET_SETTINGS: (store) => writeStore(STORAGE_KEYS.settings, store.settings),
  SET_FILTER: (store) => writeStore(STORAGE_KEYS.filters, store.filters),
  TOGGLE_IN_FILTER: (store) => writeStore(STORAGE_KEYS.filters, store.filters),
  RESET_FILTERS: (store) => writeStore(STORAGE_KEYS.filters, store.filters),
  PUSH_RECENT_QUERY: (store) => writeStore(STORAGE_KEYS.recentQueries, store.recentQueries),
};

function persistPlugin(store) {
  store.subscribe((mutation, currentState) => {
    PERSISTED[mutation.type]?.(currentState);
  });
}

export default createStore({
  state,
  actions,
  mutations,
  getters,
  plugins: [persistPlugin],
});
