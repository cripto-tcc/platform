<template>
  <aside class="sidebar">
    <div class="logo">
      <img :src="logoIcon" alt="Logo" class="logo__icon" />
      <span class="logo__text">Crypto<span class="logo__text--bold">Chat</span></span>
    </div>

    <nav class="nav">
      <div class="nav__active-indicator" :style="indicatorStyle"></div>
      <router-link
        v-for="(item, index) in navigationItems"
        :key="item.path"
        :to="item.path"
        class="nav__item"
        :class="{ 'nav__item--active': currentRoute === item.path }"
        @mouseenter="hoveredPath = item.path"
        @mouseleave="hoveredPath = null"
      >
        <div class="nav__link">
          <v-icon :icon="item.icon" size="24" :color="getIconColor(item.path)" />
          <span>{{ item.text }}</span>
        </div>
      </router-link>
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
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import ethereumIcon from "../assets/ethereum.svg";
import polygonIcon from "../assets/polygon.svg";
import logoIcon from "../assets/logo.svg";

const route = useRoute();
const currentRoute = computed(() => route.path);
const hoveredPath = ref<string | null>(null);
const selectedNetwork = ref("ethereum");

const navigationItems = [
  { path: "/", text: "Home", icon: "mdi-home" },
  { path: "/wallet", text: "Wallet", icon: "mdi-wallet" },
];

const getIconColor = (path: string) => {
  if (currentRoute.value === path) return "#FFFFFF";
  if (hoveredPath.value === path) return "rgba(255, 255, 255, 0.8)";
  return "#505050";
};

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

const getActiveItemIndex = computed(() => {
  return navigationItems.findIndex((item) => item.path === currentRoute.value);
});

const indicatorStyle = computed(() => {
  const baseOffset = 8;
  const itemSpacing = 56;
  const topOffset = baseOffset + getActiveItemIndex.value * itemSpacing;

  return {
    transform: `translateY(${topOffset}px)`,
  };
});
</script>

<style lang="scss">
.sidebar {
  width: 272px;
  height: 100vh;
  background-color: #0d0b1c;
  display: flex;
  flex-direction: column;
}

.logo {
  padding: 40px 56px;
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
    font-size: 16px;
    font-weight: 400;
  }

  &__text--bold {
    font-weight: 500;
  }
}

.nav {
  padding: 24px 0 0 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;

  &__item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding-right: 24px;
    text-decoration: none;
    transition: all 0.2s ease;
    height: 40px;

    &:hover {
      .nav__link {
        span {
          color: rgba(255, 255, 255, 0.8);
        }

        :deep(.v-icon) {
          color: rgba(255, 255, 255, 0.8) !important;
        }
      }
    }

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
      font-size: 16px;
      transition: color 0.2s ease;
    }
  }

  &__active-indicator {
    position: absolute;
    right: 0;
    width: 3px;
    height: 16px;
    background-color: #7d67ff;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 2px;
    margin-top: 4px;
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
      padding: 0 16px;
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
    width: 24px;
    height: 24px;
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
    padding: 8px 16px;
    font-size: 14px;
    transition: color 0.2s ease;

    svg,
    .v-icon {
      margin-right: 16px;
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
