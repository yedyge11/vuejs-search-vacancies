import http from "@/api/http";
import { createVacancy, parsePythonishList } from "@/api/normalize";
import { parseSalaryString } from "@/utils/format";

/**
 * Remotive - https://remotive.com/api/remote-jobs
 * Free, keyless, CORS-enabled. 100% remote roles, worldwide.
 *
 * Heads-up: the public feed currently returns the same small set of jobs
 * (about 16, delayed by 24 hours) no matter which parameters are sent -
 * `search`, `category` and `limit` are all ignored server-side. They are still
 * passed because they are the documented interface and cost nothing if it is
 * restored, but the real filtering happens locally in the store. Remotive's
 * terms require linking back to the original posting and naming them as the
 * source, which the vacancy card and the footer both do.
 */
const ENDPOINT = "https://remotive.com/api/remote-jobs";

export const meta = {
  id: "remotive",
  label: "Remotive",
  blurb: "Remote-first roles, worldwide",
  homepage: "https://remotive.com/",
  docs: "https://remotive.com/api-documentation",
  accent: "emerald",
  keyless: true,
};

const IT_CATEGORIES = ["software-development", "devops", "data", "qa"];

export async function fetchVacancies({ query = "", limit = 100, signal } = {}) {
  const params = query.trim()
    ? { search: query.trim(), limit }
    : { category: IT_CATEGORIES[0], limit };

  const { data } = await http.get(ENDPOINT, { params, signal });
  const jobs = Array.isArray(data?.jobs) ? data.jobs : [];
  return jobs.map(toVacancy);
}

function toVacancy(job) {
  const category = String(job.category || "");
  return createVacancy({
    source: meta.id,
    providerId: job.id,
    title: job.title,
    company: job.company_name,
    companyLogo: job.company_logo_url || job.company_logo || null,
    location: job.candidate_required_location || "Remote",
    remote: true,
    salary: parseSalaryString(job.salary),
    employment: mapJobType(job.job_type),
    tags: parsePythonishList(job.tags),
    publishedAt: job.publication_date || null,
    url: job.url,
    descriptionHtml: job.description || "",
    extraText: `${category} ${job.candidate_required_location || ""}`,
  });
}

function mapJobType(type) {
  switch (String(type || "").toLowerCase()) {
    case "full_time":
      return "full_time";
    case "part_time":
      return "part_time";
    case "contract":
    case "freelance":
      return "contract";
    case "internship":
      return "internship";
    default:
      return null;
  }
}
