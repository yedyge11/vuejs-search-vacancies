import http from "@/api/http";
import { createVacancy } from "@/api/normalize";

/**
 * HeadHunter (hh.kz / hh.ru) - https://api.hh.ru/vacancies
 *
 * OPT-IN SOURCE. Unlike the other three, HeadHunter now rejects anonymous
 * calls to /vacancies with HTTP 403; only /areas and /dictionaries stay open.
 * A free application token from https://dev.hh.ru/ is required, and the user
 * pastes it into Settings, where it is kept in localStorage and sent as a
 * bearer token. With no token stored this source stays switched off and the
 * app behaves exactly as if it did not exist.
 */
const ENDPOINT = "https://api.hh.ru/vacancies";
const AREAS_ENDPOINT = "https://api.hh.ru/areas";

export const meta = {
  id: "hh",
  label: "HeadHunter",
  blurb: "Kazakhstan, Central Asia & CIS",
  homepage: "https://hh.kz/",
  docs: "https://api.hh.ru/openapi/redoc",
  accent: "rose",
  keyless: false,
  tokenHint: "Create a free app at dev.hh.ru and paste its access token.",
};

/** A few area ids worth offering without making the user look them up. */
export const AREAS = [
  { id: "40", label: "Kazakhstan" },
  { id: "159", label: "Astana" },
  { id: "160", label: "Almaty" },
  { id: "113", label: "Russia" },
  { id: "16", label: "Belarus" },
  { id: "97", label: "Uzbekistan" },
];

/** IT & telecom professional area, so the source stays on-topic. */
const IT_INDUSTRY_ROLES = ["96", "104", "107", "112", "113", "124", "125", "126", "160", "165"];

export async function fetchVacancies({ query = "", token, area = "40", perPage = 50, signal } = {}) {
  if (!token) return [];

  const params = {
    text: query.trim() || "IT",
    area,
    per_page: Math.min(perPage, 100),
    page: 0,
    professional_role: IT_INDUSTRY_ROLES,
  };

  const { data } = await http.get(ENDPOINT, {
    params,
    signal,
    headers: { Authorization: `Bearer ${token}`, "HH-User-Agent": "DevBoard/1.0" },
    paramsSerializer: { indexes: null },
  });

  const items = Array.isArray(data?.items) ? data.items : [];
  return items.map(toVacancy);
}

/** Public endpoint - handy for confirming connectivity without a token. */
export async function fetchAreas({ signal } = {}) {
  const { data } = await http.get(AREAS_ENDPOINT, { signal });
  return Array.isArray(data) ? data : [];
}

function toVacancy(item) {
  const skills = (item.key_skills || []).map((skill) => skill.name).filter(Boolean);
  const schedule = item.schedule?.name || "";
  const experience = item.experience?.name || "";

  return createVacancy({
    source: meta.id,
    providerId: item.id,
    title: item.name,
    company: item.employer?.name,
    companyLogo: item.employer?.logo_urls?.["90"] || null,
    location: item.area?.name || null,
    remote: /удал|remote/i.test(schedule),
    salary: toSalary(item.salary),
    employment: mapEmployment(item.employment?.id),
    seniority: mapExperience(item.experience?.id),
    tags: skills,
    publishedAt: item.published_at || null,
    url: item.alternate_url || item.url,
    descriptionHtml: [item.snippet?.responsibility, item.snippet?.requirement]
      .filter(Boolean)
      .join("<br><br>"),
    extraText: [schedule, experience, ...skills].join(" "),
  });
}

function toSalary(salary) {
  if (!salary) return null;
  return {
    raw: null,
    min: salary.from ?? null,
    max: salary.to ?? null,
    currency: salary.currency || "KZT",
    period: "month",
  };
}

function mapEmployment(id) {
  switch (id) {
    case "full":
      return "full_time";
    case "part":
      return "part_time";
    case "project":
    case "temporary":
      return "contract";
    case "probation":
      return "internship";
    default:
      return null;
  }
}

function mapExperience(id) {
  switch (id) {
    case "noExperience":
      return "junior";
    case "between1And3":
      return "mid";
    case "between3And6":
      return "senior";
    case "moreThan6":
      return "lead";
    default:
      return null;
  }
}
