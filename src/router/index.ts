import { createRouter, createWebHistory } from "vue-router";
import { useUserContext } from "../composables/useUserContext";
import ChatView from "../views/ChatView.vue";
import WalletView from "../views/WalletView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "chat",
      component: ChatView,
      meta: { requiresAuth: true },
    },
    {
      path: "/wallet",
      name: "wallet",
      component: WalletView,
      meta: { requiresAuth: true },
    },
  ],
});

router.beforeEach((to, _from, next) => {
  const { isLoggedIn } = useUserContext();

  if (to.meta.requiresAuth && !isLoggedIn.value) {
    next();
  } else {
    next();
  }
});

export default router;
