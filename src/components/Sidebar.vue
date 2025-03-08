<template>
  <aside class="sidebar">
    <!-- Logo -->
    <div class="logo">
      <img :src="logoIcon" alt="Logo" class="logo__icon" />
      <span class="logo__text">Crypto<span class="logo__text--bold">Chat</span></span>
    </div>

    <!-- Navigation Menu -->
    <nav class="nav">
      <div class="nav__item">
        <div class="nav__link">
          <v-icon icon="mdi-home" size="24" color="#505050" />
          <span>Home</span>
        </div>
      </div>

      <div class="nav__item nav__item--active">
        <div class="nav__link">
          <v-icon icon="mdi-wallet" size="24" color="#A2A0B3" />
          <span>Wallet</span>
        </div>
        <div class="nav__active-indicator"></div>
      </div>
    </nav>

    <div class="footer">
      <div class="network-select">
        <v-select
          v-model="selectedNetwork"
          :items="networks"
          label="Network"
          item-title="text"
          item-value="value"
          variant="outlined"
          class="network-select__field"
          hide-details
          :custom-styles="selectStyles"
        >
          <template v-slot:selection="{ item }">
            <div class="network-select__value">
              <img :src="item.raw.icon" :alt="item.raw.text" class="network-select__icon" />
              <span>{{ item.raw.text }}</span>
            </div>
          </template>

          <template v-slot:item="{ item, props }">
            <v-list-item v-bind="props" class="network-select__item">
              <template v-slot:prepend>
                <img :src="item.raw.icon" :alt="item.raw.text" class="network-select__icon" />
              </template>
            </v-list-item>
          </template>
        </v-select>

        <div class="wallet-address">Connected: 0x9426BbAFe...</div>

        <div class="footer-menu">
          <button class="footer-menu__button footer-menu__button--logout">
            <v-icon icon="mdi-logout" color="white" size="24" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref } from "vue";
import ethereumIcon from "../assets/ethereum.svg";
import polygonIcon from "../assets/polygon.svg";
import logoIcon from "../assets/logo.svg";

const selectedNetwork = ref("ethereum");

const networks = [
  { text: "Ethereum", value: "ethereum", icon: ethereumIcon },
  { text: "Polygon", value: "polygon", icon: polygonIcon },
];

const selectStyles = {
  root: {
    "--v-field-border-color": "rgba(255, 255, 255, 0.5)",
    "--v-field-border-opacity": 1,
    "--v-field-border-width": "1px",
    "--v-field-padding-bottom": "0",
    "--v-field-padding-top": "0",
    "--v-field-input-min-height": "56px",
    "--v-field-bg": "transparent",
    color: "white",
  },
};
</script>

<style lang="scss">
.sidebar {
  width: 269px;
  height: 100vh;
  background-color: #0d0b1c;
  display: flex;
  flex-direction: column;
}

.logo {
  padding: 44px 60px;
  display: flex;
  align-items: center;
  gap: 8px;

  &__icon {
    width: 24px;
    height: 24px;
    flex-shrink: 0;
  }

  &__text {
    color: #e1dfec;
    font-size: 18px;
    font-weight: 400;
  }

  &__text--bold {
    font-weight: 500;
  }
}

.nav {
  padding: 20px 0 0 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  &__item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding-right: 28px;

    &--active {
      .nav__link {
        span {
          color: #fff;
        }
      }
    }
  }

  &__link {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 8px 0;

    span {
      color: #505050;
      font-size: 14px;
    }
  }

  &__active-indicator {
    width: 3px;
    height: 14px;
    background-color: #7d67ff;
    margin-left: auto;
  }
}

.footer {
  margin-top: auto;
  padding: 0 24px 32px;
}

.network-select {
  &__field {
    :deep(.v-field) {
      border-radius: 4px;
      background: transparent !important;

      &:hover {
        background: rgba(255, 255, 255, 0.05) !important;
      }

      .v-field__outline {
        --v-field-border-opacity: 0.5 !important;
        color: white !important;
      }
    }

    :deep(.v-field__input) {
      padding: 0 12px;
      min-height: 56px;
      color: white !important;
    }

    :deep(.v-field__append-inner) {
      padding-inline-start: 0;
      color: white !important;

      .v-icon {
        color: white !important;
        opacity: 1 !important;
      }
    }

    :deep(.v-select__selection) {
      color: white !important;
    }
  }

  &__value {
    display: flex;
    align-items: center;
    gap: 16px;
    color: white !important;
    font-size: 14px;
  }

  &__icon {
    width: 20px;
    height: 20px;
  }

  &__item {
    font-size: 14px;
    color: white !important;
    gap: 16px;

    &:hover {
      background: rgba(255, 255, 255, 0.1) !important;
    }

    :deep(.v-list-item-title) {
      margin-left: 16px;
    }
  }
}

.wallet-address {
  color: #dddddd;
  margin-top: 24px;
  font-size: 14px;
  text-align: center;
}

.footer-menu {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  &__button {
    display: flex;
    align-items: center;
    width: 100%;
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px 12px;
    font-size: 14px;
    transition: color 0.2s ease;

    svg,
    .v-icon {
      margin-right: 12px;
      transition: color 0.2s ease;
    }

    &--guide {
      color: #0d0b1c;
      background: #fff;
      border-radius: 4px;
      justify-content: center;
    }

    &--logout {
      color: #dddddd;
      justify-content: center;

      &:hover {
        color: #ff1744;

        .v-icon {
          color: #ff1744 !important;
        }
      }

      .v-icon {
        color: #dddddd !important;
      }
    }
  }
}

:deep(.v-overlay) {
  .v-list {
    background: #0d0b1c !important;
    color: white !important;
  }
}
</style>
