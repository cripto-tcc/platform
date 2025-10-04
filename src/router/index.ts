import { createRouter, createWebHistory } from 'vue-router'
import { useUserContext } from '@/src/composables/useUserContext'
import ChatView from '@/src/views/ChatView.vue'
import WalletView from '@/src/views/WalletView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'chat',
      component: ChatView,
      meta: { requiresAuth: true },
    },
    {
      path: '/wallet',
      name: 'wallet',
      component: WalletView,
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach(async (_to, _from, next) => {
  const { isFirebaseReady, initialize } = useUserContext()

  if (!isFirebaseReady.value) {
    await initialize()
  }

  next()
})

export default router
