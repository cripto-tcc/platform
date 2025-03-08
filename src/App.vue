<template>
  <div class="app">
    <Sidebar />
    <main class="main">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';
import Sidebar from './components/Sidebar.vue';
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
