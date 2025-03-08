<template>
  <div class="app">
    <Sidebar />
    <main class="main">
      <RouterView v-if="isLoggedIn" />
    </main>
    <ConnectWalletModal v-model="showConnectModal" />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from "vue-router";
import { computed } from "vue";
import Sidebar from "./components/Sidebar.vue";
import ConnectWalletModal from "./components/ConnectWalletModal.vue";
import { useUserContext } from "./composables/useUserContext";

const { isLoggedIn } = useUserContext();

const showConnectModal = computed({
  get: () => !isLoggedIn.value,
  set: () => {},
});
</script>

<style lang="scss">
.app {
  display: flex;
  min-height: 100vh;
}

.main {
  flex: 1;
  padding: 20px;
}
</style>
