import { createRouter, createWebHashHistory, createWebHistory } from "vue-router";
import SearchView from "@/views/SearchView.vue";

const routes = [
  {
    path: "/",
    name: "search",
    component: SearchView,
    meta: { title: "IT vacancy search" },
  },
  {
    // Ids are "<source>:<provider id>", and provider ids may contain slashes,
    // so the source is its own segment and the rest is matched greedily.
    path: "/vacancy/:source/:id(.*)",
    name: "vacancy",
    component: () => import("@/views/VacancyView.vue"),
    meta: { title: "Vacancy" },
  },
  {
    path: "/saved",
    name: "saved",
    component: () => import("@/views/SavedView.vue"),
    meta: { title: "Saved vacancies" },
  },
  {
    path: "/about",
    name: "about",
    component: () => import("@/views/AboutView.vue"),
    meta: { title: "About & data sources" },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: () => import("@/views/NotFoundView.vue"),
    meta: { title: "Not found" },
  },
];

/**
 * Opened from disk there is no server to resolve "/saved" against, so the
 * single-file build routes through the hash instead. Served over http(s) the
 * URLs stay clean; BASE_URL is "/" locally and "/<repo>/" when the site sits
 * in a subdirectory, as it does on GitHub Pages.
 */
const history =
  window.location.protocol === "file:"
    ? createWebHashHistory()
    : createWebHistory(import.meta.env.BASE_URL);

const router = createRouter({
  history,
  routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0 };
  },
});

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} · DevBoard` : "DevBoard";
});

export default router;
