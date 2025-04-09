<template>
  <div class="wallet">
    <h1>Wallet Content</h1>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useUserContext } from "../composables/useUserContext";
import { MoralisService } from "../services/moralis";
import { Token } from "../types/moralis";

const { walletAddress, activeNetwork } = useUserContext();
const tokens = ref<Token[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);

const fetchTokens = async () => {
  if (!walletAddress.value) return;

  try {
    isLoading.value = true;
    error.value = null;

    const response = await MoralisService.getWalletTokens(walletAddress.value, activeNetwork.value.id);

    tokens.value = response.result;
  } catch (err) {
    error.value = "Failed to fetch tokens";
    console.error("Error fetching tokens:", err);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  if (walletAddress.value) {
    fetchTokens();
  }
});

watch([walletAddress, activeNetwork], () => {
  if (walletAddress.value) {
    fetchTokens();
  }
});
</script>

<style lang="scss" scoped>
.wallet {
  padding: 24px;
}
</style>
