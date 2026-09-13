import http from "@/api/http";
import { createVacancy } from "@/api/normalize";

/**
 * Arbeitnow - https://www.arbeitnow.com/api/job-board-api
 * Free, keyless, CORS-enabled. Mostly European (heavily German) roles.
 *
 * The endpoint ignores every filter except `page` and returns 250 mixed jobs
 * per page, so this adapter pulls a couple of pages and leans on the shared
 * taxonomy to drop the non-IT postings. That is also why it is the one source
 * where searching costs a little more bandwidth.
 */
const ENDPOINT = "https://www.arbeitnow.com/api/job-board-api";

export const meta = {
  id: "arbeitnow",
  label: "Arbeitnow",
  blurb: "European & German-market roles",
  homepage: "https://www.arbeitnow.com/",
  docs: "https://www.arbeitnow.com/api",
  accent: "amber",
  keyless: true,
};

const PAGES = 2;

export async function fetchVacancies({ signal } = {}) {
  const pages = Array.from({ length: PAGES }, (_, index) => index + 1);
  const batches = await Promise.all(pages.map((page) => fetchPage(page, signal)));
  // Non-IT postings dominate this board, but the aggregator drops those for
  // every source at once - see fetchAllVacancies.
  return batches.flat();
}

async function fetchPage(page, signal) {
  const { data } = await http.get(ENDPOINT, { params: { page }, signal });
  const jobs = Array.isArray(data?.data) ? data.data : [];
  return jobs.map(toVacancy);
}

function toVacancy(job) {
  const tags = Array.isArray(job.tags) ? job.tags : [];
  const jobTypes = Array.isArray(job.job_types) ? job.job_types : [];

  return createVacancy({
    source: meta.id,
    providerId: job.slug,
    title: job.title,
    company: job.company_name,
    location: job.location || (job.remote ? "Remote" : "Germany"),
    remote: Boolean(job.remote),
    // Arbeitnow never publishes structured pay; whatever the description says
    // is picked up by the detail view instead of being guessed at here.
    salary: null,
    employment: mapJobTypes(jobTypes),
    publishedAt: toIso(job.created_at),
    url: job.url,
    descriptionHtml: job.description || "",
    // The raw ATS tags are too noisy to show, but they are useful signal for
    // classification, so they go into the haystack rather than onto the card.
    extraText: [...tags, ...jobTypes].join(" "),
  });
}

/** `created_at` is a unix timestamp in seconds. */
function toIso(seconds) {
  const value = Number(seconds);
  if (!Number.isFinite(value) || value <= 0) return null;
  return new Date(value * 1000).toISOString();
}

function mapJobTypes(types) {
  const joined = types.join(" ").toLowerCase();
  if (/intern|trainee|working student|student/.test(joined)) return "internship";
  if (/freelance|contract|temporary|fixed.?term/.test(joined)) return "contract";
  if (/part.?time|teilzeit/.test(joined)) return "part_time";
  if (/full.?time|permanent|vollzeit|experienced/.test(joined)) return "full_time";
  return null;
}
