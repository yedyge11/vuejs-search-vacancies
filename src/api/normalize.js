import {
  buildHaystack,
  detectEmployment,
  detectSeniority,
  extractTechTags,
  isItVacancy,
} from "@/utils/taxonomy";
import { sanitizeHtml, stripHtml, truncate } from "@/utils/format";

/**
 * The single shape every provider is mapped onto. Views only ever see this,
 * which is what lets one card component render a Remotive, Jobicy, Arbeitnow
 * or HeadHunter posting without knowing the difference.
 *
 * @typedef {Object} Vacancy
 * @property {string}   id            "<source>:<provider id>", unique app-wide
 * @property {string}   source        source id, e.g. "remotive"
 * @property {string}   title
 * @property {string}   company
 * @property {string=}  companyLogo
 * @property {string}   location      human-readable, "Remote" when unknown
 * @property {boolean}  remote
 * @property {?Object}  salary        {raw,min,max,currency,period} or null
 * @property {?string}  employment    EMPLOYMENT_TYPES id
 * @property {?string}  seniority     SENIORITY_LEVELS ids
 * @property {string[]} tags          canonical tech labels
 * @property {?string}  publishedAt   ISO date string
 * @property {string}   url           apply / original posting link
 * @property {string}   excerpt       plain-text summary for the card
 * @property {string}   descriptionHtml sanitized HTML for the detail view
 * @property {string}   haystack      lowercased blob used for client filtering
 */

/**
 * Build a Vacancy from provider-agnostic pieces, filling in every facet the
 * provider did not give us by reading the job text.
 */
export function createVacancy({
  source,
  providerId,
  title,
  company,
  companyLogo = null,
  location = null,
  remote = null,
  salary = null,
  employment = null,
  seniority = null,
  tags = [],
  publishedAt = null,
  url,
  descriptionHtml = "",
  extraText = "",
}) {
  const cleanTitle = stripHtml(title) || "Untitled role";
  const plainDescription = stripHtml(descriptionHtml);
  const haystack = buildHaystack(
    cleanTitle,
    company,
    location,
    tags.join(" "),
    extraText,
    plainDescription.slice(0, 4000)
  );

  const titleHaystack = buildHaystack(cleanTitle, extraText);
  const techTags = mergeTags(tags, extractTechTags(haystack), cleanTitle.toLowerCase());

  return {
    id: `${source}:${providerId}`,
    source,
    title: cleanTitle,
    company: stripHtml(company) || "Unknown company",
    companyLogo,
    location: location || (remote ? "Remote" : "Not specified"),
    remote: remote ?? /remote|anywhere|worldwide|distributed/.test(haystack),
    salary,
    // Prefer the provider's own value, then the title. Employment type is
    // usually stated outright in the body ("full-time position"), so falling
    // back to it is safe; seniority is not - a description that happens to
    // say "leads a squad" is not a lead role, so an unmarked title stays null.
    employment: employment || detectEmployment(titleHaystack) || detectEmployment(haystack),
    seniority: seniority || detectSeniority(titleHaystack),
    tags: techTags,
    publishedAt,
    url,
    excerpt: truncate(plainDescription, 240),
    descriptionHtml: sanitizeHtml(descriptionHtml),
    haystack,
    isIt: isItVacancy({ title: cleanTitle }),
  };
}

/**
 * Merge provider tags with the ones we detected, most relevant first.
 *
 * Ordering matters because only the first few reach the card. Some employers
 * attach their entire stack to every posting, which would otherwise bury the
 * one technology named in the title - a "Senior React Developer" showing
 * ".Net, Android, C++" and no React.
 */
function mergeTags(providerTags, detectedTags, titleLc = "", limit = 8) {
  const seen = new Set();
  const candidates = [];

  for (const [index, tag] of [...detectedTags, ...providerTags].entries()) {
    const clean = String(tag || "").trim();
    if (!clean || clean.length > 24) continue;

    const key = clean.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    const inTitle = titleLc.includes(key);
    const isDetected = index < detectedTags.length;
    candidates.push({ clean, rank: (inTitle ? 0 : 2) + (isDetected ? 0 : 1), index });
  }

  return candidates
    .sort((a, b) => a.rank - b.rank || a.index - b.index)
    .slice(0, limit)
    .map((candidate) => candidate.clean);
}

/**
 * Remotive serializes its tags as a Python list literal
 * ("['CSS', 'excel', 'frontend']"), and occasionally truncates it mid-string.
 */
export function parsePythonishList(value) {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value !== "string") return [];
  return value
    .replace(/^\[|\]$/g, "")
    .split(",")
    .map((part) => part.trim().replace(/^['"]|['"]$/g, ""))
    .filter(Boolean);
}

/** Drop repeats of the same role posted to more than one board. */
export function dedupeVacancies(vacancies) {
  const seen = new Map();
  for (const vacancy of vacancies) {
    const key = `${vacancy.title.toLowerCase()}::${vacancy.company.toLowerCase()}`;
    const existing = seen.get(key);
    // Keep the freshest copy so the "newest" sort stays honest.
    if (!existing || newerThan(vacancy, existing)) seen.set(key, vacancy);
  }
  return [...seen.values()];
}

function newerThan(a, b) {
  return new Date(a.publishedAt || 0) > new Date(b.publishedAt || 0);
}
