/**
 * Tailwind scans source files for literal class strings, so per-source colours
 * have to be written out in full here. Building them as `bg-${accent}-100`
 * would compile locally and then silently ship without the styles.
 */
const STYLES = {
  remotive: {
    badge:
      "bg-emerald-100 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/30",
    dot: "bg-emerald-500",
  },
  jobicy: {
    badge:
      "bg-violet-100 text-violet-700 ring-violet-600/20 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-400/30",
    dot: "bg-violet-500",
  },
  arbeitnow: {
    badge:
      "bg-amber-100 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/30",
    dot: "bg-amber-500",
  },
  hh: {
    badge:
      "bg-rose-100 text-rose-700 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/30",
    dot: "bg-rose-500",
  },
};

const FALLBACK = {
  badge:
    "bg-slate-100 text-slate-700 ring-slate-600/20 dark:bg-slate-500/10 dark:text-slate-300 dark:ring-slate-400/30",
  dot: "bg-slate-500",
};

export function sourceStyle(sourceId) {
  return STYLES[sourceId] || FALLBACK;
}
