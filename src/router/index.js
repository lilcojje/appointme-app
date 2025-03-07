import Vue from "vue";
import VueRouter from "vue-router";
import routes from "./routes";
import store from "../store";


Vue.use(VueRouter);

// Configure router
const router = new VueRouter({
  mode: "history",
  routes,
  linkActiveClass: "active",
});

router.beforeEach(async (to, from, next) => {
  document.title = "AppointMe - " + to.name.toUpperCase();

  // Load permissions if missing (replace with your action)
  if (!store.state.permissions.length && store.state.token) {
    await store.dispatch('fetchPermissions');
  }

  const { token, permissions } = store.state;

  // Public route? Allow access
  if (!to.meta.requiresAuth && !to.meta.requiredPermission) {
    return next();
  }

  // Not logged in? Redirect to login
  if (!token) {
    return next("/login");
  }

  // Route requires permission but it's not defined? Block access
  if (to.meta.requiresAuth && !to.meta.requiredPermission) {
    console.error(`Missing requiredPermission for route: ${to.name}`);
    return next("/unauthorized");
  }

  // Check permissions
  if (to.meta.requiredPermission && !permissions.includes(to.meta.requiredPermission)) {
    return next("/unauthorized");
  }

  next();
});

export default router;
