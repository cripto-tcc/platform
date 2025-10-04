<template>
  <v-app>
    <v-overlay
      v-if="!isFirebaseReady"
      :model-value="isLoading"
      class="align-center justify-center"
      persistent
      scrim="rgba(0,0,0,0.8)"
    >
      <div class="loading-container">
        <v-progress-circular size="64" color="#0d0b1c" indeterminate />
      </div>
    </v-overlay>

    <div v-else class="app">
      <Sidebar v-if="!isChatPage" />
      <main
        v-if="isLoggedIn"
        class="main"
        :class="{ 'main--full': isChatPage }"
      >
        <RouterView />
      </main>
      <ConnectWalletModal v-else />
    </div>
  </v-app>
</template>

<script setup lang="ts">
  import { onMounted, computed } from 'vue'
  import { RouterView, useRoute } from 'vue-router'
  import { useUserContext } from '@/src/composables/useUserContext'
  import ConnectWalletModal from '@/src/components/ConnectWalletModal.vue'
  import Sidebar from '@/src/components/Sidebar.vue'

  const { isLoggedIn, isFirebaseReady, isLoading, initialize } =
    useUserContext()

  const route = useRoute()
  const isChatPage = computed(() => route.path === '/')

  onMounted(() => {
    initialize()
  })
</script>

<style scoped>
  .app {
    display: flex;
    min-height: 100vh;
    background-color: #0d0b1c;
  }

  .main {
    flex: 1;
    margin-left: 272px;

    &--full {
      margin-left: 0;
    }
  }

  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  }
</style>
