import Vue from "vue";
import VueRouter from "vue-router";
import Store from "../store";
// import Home from "../views/Home.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "",
    redirect: { name: "CompanyList" },
    name: "Home",
    component: () => import("../views/Base"),
    meta: { requiresAuth: true },
    children: [
      {
        path: "/company-list/:id",
        name: "CompanyList",
        component: () => import("../views/CompanyList.vue"),
      },
      {
        path: "/device-list/:id",
        name: "DeviceList",
        component: () => import("../views/DeviceList.vue"),
      },
      {
        path: "/device-inner/:id",
        name: "DeviceInner",
        component: () => import("../views/DeviceInner.vue"),
      },
    ],
  },

  {
    path: "/login",
    name: "Login",
    component: () => import("../views/Login.vue"),
  },
  {
    path: "*",
    name: "404",
    component: () => import("../views/404.vue"),
  },
];

const router = new VueRouter({
  mode: "hash",
  base: process.env.BASE_URL,
  routes,
});

router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    let a = localStorage.getItem("expires_in");
    let b = new Date();
    let diff = (a - b) / 1000 / 60;
    if (
      !Store.getters["isLoggedIn"] ||
      (Store.getters["isLoggedIn"] && diff < 0)
    ) {
      router
        .replace({
          path: "/login",
          query: { redirect: to.fullPath },
        })
        .catch(() => {
          next(false);
        });
    } else {
      next();
    }
  } else {
    next();
  }
});

const DEFAULT_TITLE = "Snapi";
router.afterEach(() => {
  Vue.nextTick(() => {
    document.title = DEFAULT_TITLE;
  });
});

export default router;
