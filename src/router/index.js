import { createRouter, createWebHistory } from "vue-router";
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

const router = createRouter({
  // BASE_URL is "/" locally and "/<repo>/" on GitHub Pages, where the site is
  // served from a subdirectory rather than the domain root.
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0 };
  },
});

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} · DevBoard` : "DevBoard";
});

export default router;
