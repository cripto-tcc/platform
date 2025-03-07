<template>
  <main class="home">
    <h1>{{ title }}</h1>
    <p>API URL: {{ apiUrl }}</p>
    <p v-if="debugMode">Debug Mode está ativado!</p>
  </main>
</template>

<script setup lang="ts">
const title = import.meta.env.VITE_APP_TITLE;
const apiUrl = import.meta.env.VITE_API_URL;
const debugMode = import.meta.env.VITE_DEBUG_MODE === "true";
</script>

<style scoped lang="scss">
.home {
  padding: 2rem;
  text-align: center;

  h1 {
    color: var(--primary-color);
    margin-bottom: 2rem;
  }

  p {
    margin: 1rem 0;
  }
}
</style>
