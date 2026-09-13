# DevBoard — IT vacancy search

**Live: https://yedyge11.github.io/vuejs-search-vacancies/**

A single search box over several public job APIs. DevBoard queries them live from the
browser, normalises what comes back into one shape, drops the non-technical postings and
lets you slice the rest by stack, seniority, employment type, salary and freshness.

There is no backend. Nothing you search for is sent anywhere except to the job APIs
themselves, and saved vacancies live in your own browser.

Built on the same stack as its predecessor, a Vue meal-search app: **Vue 3 (`script setup`),
Vue Router, Vuex, Axios, Vite and Tailwind CSS**.

---

## Quick start

```bash
npm install
npm run dev         # http://localhost:8080
npm run build       # production bundle into dist/
npm run preview     # serve the built bundle
npm run build:file  # ONE self-contained .html into dist-file/
```

Requires Node 18+.

### Running it without a server

`npm run build:file` inlines the whole app — JS, CSS, everything — into a single
`dist-file/index.html`. Double-click it and the app runs from disk with live data; no web
server, no hosting account, nothing to install. The router switches to hash URLs
(`#/saved`) when it detects `file://`, since there is no server to resolve real paths
against.

## Deploying

The bundle in `dist/` is plain static files and will run on any static host. It ships both
SPA fallbacks, so the same folder works unmodified across providers:

| Host | Command | Fallback used |
| --- | --- | --- |
| GitHub Pages | push to `main`, the workflow does the rest | `404.html` |
| Surge | `npx surge ./dist` | `200.html` |
| Netlify / Cloudflare Pages | drag `dist/` into the dashboard | `_redirects` |

The one thing that must match the host is the base path. GitHub Pages serves a project
site from `https://<user>.github.io/<repo>/`, so the workflow builds with
`--base=/<repo>/`; everywhere else the site sits at the domain root and the default `/`
is correct.

---

## Data sources

| Source | Key needed | Coverage | Notes |
| --- | --- | --- | --- |
| [Remotive](https://remotive.com/api-documentation) | No | Remote, worldwide | Public feed is a small fixed sample, delayed 24h — see below |
| [Jobicy](https://jobicy.com/jobs-rss-feed) | No | Remote tech roles | Real `industry` and `tag` filters, 50 results per industry |
| [Arbeitnow](https://www.arbeitnow.com/api) | No | Europe, heavily German | 250 jobs/page, ignores its own filters |
| [HeadHunter](https://dev.hh.ru/) (hh.kz / hh.ru) | **Yes** | Kazakhstan, CIS | Opt-in; off until you add a token |

### Things the APIs actually do (as opposed to what they document)

These were checked against the live endpoints while building, and they shape the whole
design:

- **Remotive ignores every query parameter.** `search`, `category` and `limit` all return
  the same ~16 postings. The parameters are still sent — they are the documented interface
  and cost nothing if the quota is restored — but no filtering can be relied on
  server-side. Remotive's terms require linking back to the original posting and naming
  them as the source; the vacancy cards and the footer both do.
- **Arbeitnow ignores `search`.** Only `page` works, and a page is 250 mixed jobs from a
  general board, mostly non-technical.
- **Jobicy's filters work**, but the industry slugs are not guessable: valid IT ones are
  `engineering`, `data-science`, `qa-testing` and `cybersecurity`. `devops-sysadmin`,
  `qa` and `product` are silently ignored.
- **HeadHunter no longer serves anonymous searches.** `GET /vacancies` answers `403`,
  though `/areas` and `/dictionaries` are still open. A free application token from
  [dev.hh.ru](https://dev.hh.ru/) re-enables it.

Because two of the three open sources cannot filter server-side, DevBoard fetches a wide
slice once and does all filtering, ranking and faceting in memory. That is why a new search
takes a moment but every checkbox afterwards is instant.

### Adding a source

Write one adapter under `src/api/sources/` exporting `meta` and `fetchVacancies`, map the
provider's payload through `createVacancy`, and add it to the `ADAPTERS` array in
`src/api/sources/index.js`. Nothing in the store or the views needs to change.

---

## How the data is cleaned up

Providers disagree about almost everything, so `src/api/normalize.js` maps each one onto a
single `Vacancy` shape and fills in what is missing:

- **Tech tags** are re-derived from the job text against a canonical dictionary
  (`src/utils/taxonomy.js`), so `nodejs`, `Node.js` and `NestJS` all become `Node.js`.
  Tags named in the *title* are ranked first, because some employers attach their whole
  stack to every posting.
- **Seniority** is read from the title only. Reading it from the description was tried and
  was wrong too often — a body that says "leads a squad" is not a lead role.
- **Employment type** falls back to the description, which usually states it outright.
- **Salary** free-text is parsed into a comparable yearly figure where possible
  (`"$31,2k- $52k"`, `"$50-$75 /hour"`, `"EUR 60k+"`). Where it is not, the original string
  is shown untouched rather than guessed at. Only a small minority of postings publish one.
- **Non-IT postings are dropped** by title. This is stricter than it sounds: an office
  assistant tagged `html, css, git` and a sales contractor tagged `CRM` both used to slip
  through when tags were trusted.
- **Descriptions are sanitised** before `v-html` — scripts, iframes, inline event handlers
  and `javascript:` URLs are stripped, since the markup is author-controlled.

Every one of these is a guess about data the provider did not supply. The About page in the
app says so too.

---

## Features

- Live aggregated search with relevance ranking (title hits beat tag hits beat body hits)
- Facet sidebar: source, remote, salary disclosed, seniority, employment, tech stack, freshness, minimum salary
- Sort by relevance, date, salary or company
- Shareable URLs — `?q=vue` reproduces the search, and back/forward work
- Saved vacancies with the full posting, persisted in `localStorage` and exportable as JSON
- Dark mode, applied before first paint so there is no flash
- Per-source failure handling: one API going down never blanks the board
- Skeletons, empty states and a retry affordance

---

## Project layout

```
src/
  api/
    http.js              axios instance + human-readable error mapping
    normalize.js         the Vacancy shape every provider is mapped onto
    sources/             one adapter per provider + the registry
  store/                 Vuex: state / getters / mutations / actions + persistence
  utils/
    taxonomy.js          tech dictionary, seniority & employment patterns, IT classifier
    format.js            salary parsing, dates, HTML sanitising
    storage.js           localStorage that survives private mode
    sourceStyles.js      per-source Tailwind classes, written out in full
  components/            cards, filters, search bar, pagination, dialogs
  views/                 search, vacancy detail, saved, about, 404
```

---

## Known limits

- **Salary filters have little to work with.** Roughly 1% of postings publish a figure,
  so "Salary disclosed" and "Highest salary" return a short list. That is the data, not a bug.
- **Vacancy detail pages are not deep-linkable** unless the vacancy is saved. Details come
  from the in-memory search; the providers offer no "fetch one job by id" endpoint that
  works uniformly, so a cold-loaded URL shows a prompt to search again or open it from
  Saved.
- **The HeadHunter adapter is written to their documented API but has not been run against
  it**, since that needs a token. If you add one and it misbehaves, `src/api/sources/hh.js`
  is the only file involved.
- **Client-side aggregation means a heavier first request.** Arbeitnow alone is 500 jobs
  per search. Results are not cached between searches yet — an obvious next step.
