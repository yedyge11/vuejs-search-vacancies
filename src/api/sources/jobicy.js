import http from "@/api/http";
import { createVacancy } from "@/api/normalize";

/**
 * Jobicy - https://jobicy.com/api/v2/remote-jobs
 * Free, keyless, CORS-enabled. Remote roles with curated industry tagging.
 *
 * `count` is capped at 50 by the provider, and `tag` behaves as a keyword
 * search. Industries are requested one at a time, so a few IT industries are
 * fanned out in parallel to get a reasonable spread of roles.
 */
const ENDPOINT = "https://jobicy.com/api/v2/remote-jobs";

export const meta = {
  id: "jobicy",
  label: "Jobicy",
  blurb: "Remote tech roles by industry",
  homepage: "https://jobicy.com/",
  docs: "https://jobicy.com/jobs-rss-feed",
  accent: "violet",
  keyless: true,
};

/** Verified against the live API - unknown slugs are silently ignored by it. */
const IT_INDUSTRIES = ["engineering", "data-science", "qa-testing", "cybersecurity"];
const MAX_COUNT = 50;

export async function fetchVacancies({ query = "", signal } = {}) {
  const trimmed = query.trim();
  // A keyword search is already narrow, so one wide call beats four narrow ones.
  const industries = trimmed ? [IT_INDUSTRIES[0]] : IT_INDUSTRIES;

  const batches = await Promise.all(
    industries.map((industry) => fetchIndustry({ industry, tag: trimmed, signal }))
  );
  return batches.flat();
}

async function fetchIndustry({ industry, tag, signal }) {
  const params = { count: MAX_COUNT, industry };
  if (tag) params.tag = tag;

  const { data } = await http.get(ENDPOINT, { params, signal });
  const jobs = Array.isArray(data?.jobs) ? data.jobs : [];
  return jobs.map(toVacancy);
}

function toVacancy(job) {
  const industries = toArray(job.jobIndustry);
  const types = toArray(job.jobType);

  return createVacancy({
    source: meta.id,
    providerId: job.id,
    title: job.jobTitle,
    company: job.companyName,
    companyLogo: job.companyLogo || null,
    location: job.jobGeo ? job.jobGeo.replace(/\s*,\s*/g, ", ") : "Remote",
    remote: true,
    salary: toSalary(job),
    employment: mapJobType(types[0]),
    seniority: mapLevel(job.jobLevel),
    tags: industries,
    publishedAt: job.pubDate || null,
    url: job.url,
    descriptionHtml: job.jobDescription || job.jobExcerpt || "",
    extraText: [...industries, ...types, job.jobLevel, job.jobGeo].filter(Boolean).join(" "),
  });
}

function toArray(value) {
  if (Array.isArray(value)) return value.map(String);
  return value ? [String(value)] : [];
}

/** Jobicy only fills these in for a minority of postings. */
function toSalary(job) {
  const min = Number(job.annualSalaryMin) || null;
  const max = Number(job.annualSalaryMax) || null;
  if (!min && !max) return null;
  return {
    raw: null,
    min,
    max,
    currency: job.salaryCurrency || "USD",
    period: "year",
  };
}

function mapJobType(type) {
  switch (String(type || "").toLowerCase()) {
    case "full-time":
      return "full_time";
    case "part-time":
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

function mapLevel(level) {
  switch (String(level || "").toLowerCase()) {
    case "entry-level, junior":
    case "entry-level":
    case "junior":
      return "junior";
    case "midweight":
      return "mid";
    case "senior":
      return "senior";
    case "director":
    case "executive":
      return "lead";
    default:
      return null;
  }
}
