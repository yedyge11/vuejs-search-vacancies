import { describeError } from "@/api/http";
import { dedupeVacancies } from "@/api/normalize";
import * as remotive from "./remotive";
import * as jobicy from "./jobicy";
import * as arbeitnow from "./arbeitnow";
import * as hh from "./hh";

/**
 * The provider registry. Adding a job board to the app means writing one
 * adapter that exports `meta` and `fetchVacancies`, then listing it here -
 * nothing in the store or the views needs to change.
 */
const ADAPTERS = [remotive, jobicy, arbeitnow, hh];

export const SOURCES = ADAPTERS.map((adapter) => adapter.meta);

export const DEFAULT_SOURCE_IDS = SOURCES.filter((source) => source.keyless).map((s) => s.id);

export function getSourceMeta(id) {
  return SOURCES.find((source) => source.id === id) || null;
}

/**
 * Fetch every enabled source in parallel and merge the results.
 *
 * One provider being down must never blank the board, so failures are
 * collected per source and reported alongside whatever did come back.
 *
 * @returns {Promise<{vacancies: Vacancy[], errors: Array<{source:string,message:string}>, counts: Record<string,number>}>}
 */
export async function fetchAllVacancies({
  query = "",
  sources = DEFAULT_SOURCE_IDS,
  hhToken = "",
  hhArea = "40",
  signal,
} = {}) {
  const active = ADAPTERS.filter((adapter) => sources.includes(adapter.meta.id));

  const settled = await Promise.allSettled(
    active.map((adapter) =>
      adapter.fetchVacancies({ query, signal, token: hhToken, area: hhArea })
    )
  );

  const vacancies = [];
  const errors = [];
  const counts = {};

  settled.forEach((result, index) => {
    const { id, label } = active[index].meta;
    if (result.status === "fulfilled") {
      // This is an IT board, and none of the providers are IT-only: Arbeitnow
      // is a general job board and even Remotive's feed carries sales and
      // marketing roles. Dropping them here keeps every count downstream
      // honest.
      const itOnly = result.value.filter((vacancy) => vacancy.isIt);
      counts[id] = itOnly.length;
      vacancies.push(...itOnly);
      return;
    }
    const described = describeError(result.reason, label);
    if (described.canceled) return;
    counts[id] = 0;
    errors.push({ source: id, message: described.message });
  });

  return { vacancies: dedupeVacancies(vacancies), errors, counts };
}
