/**
 * Shared vocabulary for turning messy job-board text into consistent facets.
 *
 * Every provider describes jobs differently: Remotive ships a stringified
 * Python list of tags, Jobicy ships curated industries, Arbeitnow ships raw
 * internal ATS labels ("20213 S&M - Sales - Square Outside"). Rather than
 * surfacing that noise we re-derive the facets ourselves from the job text,
 * so a card from any source reads the same way.
 */

/** Canonical tech name -> extra spellings that should map onto it. */
const TECH_ALIASES = {
  JavaScript: ["javascript", "js", "es6", "ecmascript"],
  TypeScript: ["typescript", "ts"],
  Vue: ["vue", "vue.js", "vuejs", "nuxt", "nuxt.js"],
  React: ["react", "react.js", "reactjs", "next.js", "nextjs", "react native"],
  Angular: ["angular", "angularjs"],
  Svelte: ["svelte", "sveltekit"],
  "Node.js": ["node", "node.js", "nodejs", "express", "nestjs", "nest.js"],
  Python: ["python", "django", "flask", "fastapi", "pandas", "numpy"],
  Java: ["java", "spring", "spring boot"],
  Kotlin: ["kotlin"],
  Go: ["golang", "go lang"],
  Rust: ["rust"],
  "C#": ["c#", "csharp", ".net", "dotnet", "asp.net"],
  "C++": ["c++", "cpp"],
  PHP: ["php", "laravel", "symfony"],
  Ruby: ["ruby", "ruby on rails", "rails"],
  Scala: ["scala"],
  Elixir: ["elixir"],
  Swift: ["swift", "swiftui"],
  Flutter: ["flutter", "dart"],
  Android: ["android"],
  iOS: ["ios"],
  SQL: ["sql", "postgres", "postgresql", "mysql", "mariadb", "sqlite"],
  NoSQL: ["mongodb", "mongo", "cassandra", "dynamodb", "redis", "elasticsearch"],
  AWS: ["aws", "amazon web services", "ec2", "lambda", "s3"],
  Azure: ["azure"],
  GCP: ["gcp", "google cloud"],
  Docker: ["docker", "containers"],
  Kubernetes: ["kubernetes", "k8s", "openshift"],
  Terraform: ["terraform", "infrastructure as code", "iac"],
  "CI/CD": ["ci/cd", "cicd", "jenkins", "github actions", "gitlab ci", "argocd"],
  Linux: ["linux", "unix", "bash"],
  Git: ["git", "github", "gitlab", "bitbucket"],
  GraphQL: ["graphql", "apollo"],
  // No bare "rest" - it matches ordinary English ("the rest of the team").
  REST: ["restful", "rest api", "rest apis"],
  Kafka: ["kafka", "rabbitmq", "event streaming"],
  Spark: ["spark", "hadoop", "databricks"],
  Airflow: ["airflow", "dbt", "etl"],
  "Machine Learning": [
    "machine learning", "deep learning", "pytorch", "tensorflow", "scikit-learn",
  ],
  AI: ["ai", "artificial intelligence", "llm", "genai", "nlp", "computer vision"],
  Security: [
    "cybersecurity", "infosec", "penetration testing", "appsec", "application security",
  ],
  Testing: [
    "qa", "test automation", "selenium", "cypress", "playwright", "jest", "junit",
  ],
  Figma: ["figma"],
  HTML: ["html", "html5"],
  CSS: ["css", "css3", "sass", "scss", "tailwind", "less"],
};

/** Flat lookup used by the matcher: alias -> canonical label. */
const TECH_LOOKUP = Object.entries(TECH_ALIASES).flatMap(([canonical, aliases]) =>
  aliases.map((alias) => [alias, canonical])
);

/**
 * Words that make a posting an *IT* posting even when no concrete technology
 * is named ("Scrum Master", "Head of Engineering").
 */
const IT_ROLE_WORDS = [
  "developer", "engineer", "engineering", "programmer", "software", "frontend",
  "front-end", "backend", "back-end", "fullstack", "full-stack", "devops",
  "sre", "site reliability", "data scientist", "data analyst", "data engineer",
  "machine learning", "qa", "quality assurance", "tester", "architect",
  "sysadmin", "system administrator", "it support", "help desk", "cloud",
  "cybersecurity", "security analyst", "database administrator", "dba",
  "scrum master", "product owner", "technical lead", "tech lead", "cto",
  "web developer", "mobile developer", "ux", "ui designer", "product designer",
  "technical writer", "solutions architect", "platform engineer", "it",
  "ios", "android", "full stack", "fullstack", "machine learning", "blockchain",
];

export const SENIORITY_LEVELS = [
  { id: "intern", label: "Intern / Trainee" },
  { id: "junior", label: "Junior" },
  { id: "mid", label: "Middle" },
  { id: "senior", label: "Senior" },
  { id: "lead", label: "Lead / Principal" },
];

/** Order matters: the first pattern that matches wins. */
const SENIORITY_PATTERNS = [
  { id: "intern", words: ["intern", "internship", "trainee", "working student", "praktikum"] },
  { id: "junior", words: ["junior", "jr", "entry-level", "entry level", "graduate", "berufseinstieg"] },
  { id: "lead", words: ["lead", "principal", "staff engineer", "head of", "director", "chief", "cto", "vp"] },
  { id: "senior", words: ["senior", "sr", "experienced professional", "expert"] },
  { id: "mid", words: ["middle", "midweight", "mid-level", "regular"] },
];

export const EMPLOYMENT_TYPES = [
  { id: "full_time", label: "Full-time" },
  { id: "part_time", label: "Part-time" },
  { id: "contract", label: "Contract / Freelance" },
  { id: "internship", label: "Internship" },
];

const EMPLOYMENT_PATTERNS = [
  { id: "internship", words: ["intern", "internship", "trainee", "working student", "praktikum"] },
  { id: "contract", words: ["contract", "freelance", "b2b", "temporary", "fixed term", "fixed-term"] },
  { id: "part_time", words: ["part time", "part-time", "part_time", "teilzeit"] },
  { id: "full_time", words: ["full time", "full-time", "full_time", "permanent", "vollzeit"] },
];

/** Lowercase and collapse a set of strings into one searchable blob. */
export function buildHaystack(...parts) {
  return parts
    .filter(Boolean)
    .join(" \n ")
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/**
 * Word-boundary match that still works for "c++", "c#", ".net" and "node.js",
 * which a plain \b would mangle.
 */
function containsTerm(haystack, term) {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z0-9+#.])${escaped}([^a-z0-9+#]|$)`, "i").test(haystack);
}

/** @returns {string[]} canonical technology labels found in the text. */
export function extractTechTags(haystack, limit = 8) {
  const found = new Set();
  for (const [alias, canonical] of TECH_LOOKUP) {
    if (found.has(canonical)) continue;
    if (containsTerm(haystack, alias)) found.add(canonical);
  }
  return [...found].slice(0, limit);
}

/** @returns {string|null} one of the SENIORITY_LEVELS ids. */
export function detectSeniority(haystack) {
  for (const { id, words } of SENIORITY_PATTERNS) {
    if (words.some((word) => containsTerm(haystack, word))) return id;
  }
  return null;
}

/** @returns {string|null} one of the EMPLOYMENT_TYPES ids. */
export function detectEmployment(haystack) {
  for (const { id, words } of EMPLOYMENT_PATTERNS) {
    if (words.some((word) => containsTerm(haystack, word))) return id;
  }
  return null;
}

/**
 * Is this actually an IT job? General boards such as Arbeitnow mix in
 * accountants and nurses, and even Remotive's feed carries sales and
 * marketing roles.
 *
 * The verdict comes from the title alone. Judging by the body or by the
 * provider's skill tags was tried first and was far too loose: an office
 * assistant tagged "html, css, git" or a sales contractor tagged "CRM" both
 * sailed through. A title is the one field an employer writes carefully.
 */
export function isItVacancy({ title = "" }) {
  const titleLc = title.toLowerCase();
  if (IT_ROLE_WORDS.some((word) => containsTerm(titleLc, word))) return true;
  // "React Native Specialist" names no role word but is unmistakably technical.
  return extractTechTags(titleLc, 1).length > 0;
}

/** Quick-pick chips shown under the search bar. */
export const POPULAR_QUERIES = [
  "JavaScript", "TypeScript", "Vue", "React", "Python", "Java",
  "Go", "DevOps", "Data", "QA", "Security", "Mobile",
];
