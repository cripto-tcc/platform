<template>
  <v-dialog :model-value="true" persistent width="400" :scrim="true" class="connect-dialog">
    <v-card class="modal" color="#0D0B1C">
      <v-card-text class="modal__content">
        <h1 class="modal__title">WELCOME</h1>
        <p class="modal__description">Connect your wallet to use the platform</p>

        <v-btn class="modal__button" color="#1A1A1A" block height="48" @click="handleConnect" :loading="isConnecting">
          <div class="modal__button-content">
            <img src="@/src/assets/phantom.svg" alt="Phantom" class="modal__button-icon" />
            <span>Connect with Phantom</span>
          </div>
        </v-btn>

        <div v-if="errorMessage" class="modal__error">
          {{ errorMessage }}
        </div>

        <div class="modal__help">
          <span>I'm new to Crypto, </span>
          <a href="https://phantom.app/learn/beginners-guide" target="_blank" class="modal__help-link">what is a wallet?</a>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useUserContext } from "@/src/composables/useUserContext";

const { login } = useUserContext();
const isConnecting = ref(false);
const errorMessage = ref("");

const handleConnect = async () => {
  isConnecting.value = true;
  errorMessage.value = "";

  try {
    if (!window.phantom?.ethereum) {
      errorMessage.value = "Phantom wallet is not installed. Please install it first.";
      window.open("https://phantom.app/download", "_blank");
      return;
    }

    await login();
  } catch (error: any) {
    errorMessage.value = error.message || "Failed to connect to wallet. Please try again.";
  } finally {
    isConnecting.value = false;
  }
};
</script>

<style lang="scss" scoped>
.connect-dialog {
  :deep(.v-overlay__scrim) {
    opacity: 0.8;
    background: rgba(0, 0, 0, 0.8) !important;
    backdrop-filter: blur(4px);
  }
}

.modal {
  border-radius: 9px;
  padding: 32px;

  &__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    text-align: center;
  }

  &__title {
    color: #e1dfec;
    font-size: 24px;
    font-weight: 500;
  }

  &__description {
    color: #fff;
    font-size: 14px;
  }

  &__error {
    color: #ff5252;
    font-size: 14px;
    margin-top: 8px;
  }

  &__button {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    width: 100%;
    box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.2), 0px 4px 5px 0px rgba(0, 0, 0, 0.14), 0px 1px 10px 0px rgba(0, 0, 0, 0.12);

    &-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    &-icon {
      width: 24px;
      height: 24px;
    }
  }

  &__help {
    color: #fff;
    font-size: 14px;

    &-link {
      color: #7d67ff;
      text-decoration: none;
      transition: opacity 0.2s ease;

      &:hover {
        opacity: 0.8;
      }
    }
  }
}

:deep(.v-card-text) {
  padding: 0;
}
</style>
