/** Presentation helpers shared by the cards, the detail view and the store. */

/** Strip HTML down to readable plain text (used for excerpts and search). */
export function stripHtml(html) {
  if (!html) return "";
  return String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;|&apos;/gi, "'")
    .replace(/&hellip;/gi, "...")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Remove the tags that make third-party job HTML dangerous or ugly before we
 * hand it to v-html. Providers return author-controlled markup, so nothing
 * here is trusted: scripts, iframes, event handlers and javascript: URLs go.
 */
export function sanitizeHtml(html) {
  if (!html) return "";
  return String(html)
    .replace(/<\s*(script|style|iframe|object|embed|form|input|link|meta)[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/<\s*(script|style|iframe|object|embed|form|input|link|meta)\b[^>]*\/?>/gi, "")
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, "")
    .replace(/\son\w+\s*=\s*'[^']*'/gi, "")
    .replace(/\son\w+\s*=\s*[^\s>]+/gi, "")
    .replace(/(href|src)\s*=\s*(["'])\s*javascript:[^"']*\2/gi, '$1="#"');
}

export function truncate(text, max = 220) {
  const clean = stripHtml(text);
  if (clean.length <= max) return clean;
  return clean.slice(0, max).replace(/\s+\S*$/, "") + "…";
}

/** "3 days ago" / "just now" - job boards only ever need coarse precision. */
export function relativeTime(isoDate) {
  if (!isoDate) return "";
  const then = new Date(isoDate).getTime();
  if (Number.isNaN(then)) return "";

  const minutes = Math.round((Date.now() - then) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} ${plural(hours, "hour")} ago`;

  const days = Math.round(hours / 24);
  if (days < 30) return `${days} ${plural(days, "day")} ago`;

  const months = Math.round(days / 30);
  if (months < 12) return `${months} ${plural(months, "month")} ago`;

  const years = Math.round(months / 12);
  return `${years} ${plural(years, "year")} ago`;
}

function plural(count, word) {
  return count === 1 ? word : `${word}s`;
}

export function formatDate(isoDate) {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const CURRENCY_SYMBOLS = { USD: "$", EUR: "€", GBP: "£", KZT: "₸", RUB: "₽" };

export function formatMoney(amount, currency = "USD") {
  if (amount == null) return "";
  const symbol = CURRENCY_SYMBOLS[currency] || `${currency} `;
  const rounded = amount >= 1000 ? `${Math.round(amount / 1000)}k` : String(Math.round(amount));
  return `${symbol}${rounded}`;
}

/** Render the normalized salary object back into a short label. */
export function formatSalary(salary) {
  if (!salary) return "";
  if (salary.raw && salary.min == null && salary.max == null) return salary.raw;

  const { min, max, currency = "USD", period } = salary;
  const suffix = period === "month" ? "/mo" : period === "hour" ? "/hr" : "";
  if (min != null && max != null) {
    return `${formatMoney(min, currency)} – ${formatMoney(max, currency)}${suffix}`;
  }
  if (min != null) return `from ${formatMoney(min, currency)}${suffix}`;
  if (max != null) return `up to ${formatMoney(max, currency)}${suffix}`;
  return salary.raw || "";
}

/**
 * Best-effort parse of the free-text salary strings Remotive returns, e.g.
 * "$31,2k- $52k", "70000 - 90000 USD", "EUR 60k+".
 * Returns null when nothing sensible can be read out - we would rather show
 * the raw string than invent a number.
 */
export function parseSalaryString(raw) {
  if (!raw || typeof raw !== "string") return null;
  const text = raw.trim();
  if (!text) return null;

  const currency =
    (/\$|\busd\b/i.test(text) && "USD") ||
    (/€|\beur\b/i.test(text) && "EUR") ||
    (/£|\bgbp\b/i.test(text) && "GBP") ||
    (/₸|\bkzt\b|\btenge\b/i.test(text) && "KZT") ||
    (/₽|\brub\b/i.test(text) && "RUB") ||
    "USD";

  const period = /per hour|\/\s*h(ou)?r|hourly/i.test(text)
    ? "hour"
    : /per month|\/\s*mo(nth)?|monthly/i.test(text)
      ? "month"
      : "year";

  // An hourly rate is a two-digit number, so the noise floor that keeps "2025"
  // and "401k" out of yearly figures has to be lowered for it.
  const floor = period === "hour" ? 5 : 100;

  // Numbers may use "." or "," as the decimal mark and may carry a "k" suffix.
  const numbers = [...text.matchAll(/(\d[\d\s.,]*)\s*(k)?/gi)]
    .map((match) => {
      const digits = match[1].replace(/\s/g, "");
      const normalized = /[.,]\d{1,2}$/.test(digits)
        ? digits.replace(/[.,](?=\d{1,2}$)/, ".").replace(/[.,](?=\d{3})/g, "")
        : digits.replace(/[.,]/g, "");
      const value = Number.parseFloat(normalized);
      if (!Number.isFinite(value)) return null;
      return match[2] ? value * 1000 : value;
    })
    .filter((value) => value != null && value >= floor);

  if (!numbers.length) return { raw: text, min: null, max: null, currency, period };

  const min = Math.min(...numbers);
  const max = numbers.length > 1 ? Math.max(...numbers) : null;
  return { raw: text, min, max: max === min ? null : max, currency, period };
}

/** Yearly figure used for sorting and for the "min salary" filter. */
export function annualValue(salary) {
  if (!salary) return null;
  const base = salary.max ?? salary.min;
  if (base == null) return null;
  if (salary.period === "month") return base * 12;
  if (salary.period === "hour") return base * 40 * 52;
  return base;
}

/** Deterministic pastel background for companies with no logo. */
export function initialsAvatar(name = "?") {
  const letters = name
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = (hash * 31 + name.charCodeAt(i)) % 360;
  return { letters: letters || "?", hue: hash };
}
