<template>
  <v-app>
    <v-overlay v-if="!isFirebaseReady" :model-value="isLoading" class="align-center justify-center" persistent scrim="rgba(0,0,0,0.8)">
      <div class="loading-container">
        <v-progress-circular size="64" color="#0d0b1c" indeterminate />
      </div>
    </v-overlay>

    <div v-else class="app">
      <Sidebar />
      <main v-if="isLoggedIn" class="main">
        <RouterView />
      </main>
      <ConnectWalletModal v-else />
    </div>
  </v-app>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import { RouterView } from "vue-router";
import { useUserContext } from "./composables/useUserContext";
import ConnectWalletModal from "./components/ConnectWalletModal.vue";
import Sidebar from "./components/Sidebar.vue";

const { isLoggedIn, isFirebaseReady, isLoading, initialize, cleanup } = useUserContext();

onMounted(() => {
  initialize();
});

onUnmounted(() => {
  cleanup();
});
</script>

<style scoped>
.app {
  display: flex;
  min-height: 100vh;
}

.main {
  flex: 1;
  margin-left: 272px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}
</style>
