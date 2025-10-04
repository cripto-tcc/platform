<template>
  <header class="chat-header">
    <div class="chat-header__left">
      <div class="chat-header__logo">
        <img :src="logoIcon" alt="Logo" class="chat-header__logo-icon" />
        <span class="chat-header__logo-text">
          Crypto<span class="chat-header__logo-text--bold">Chat</span>
        </span>
      </div>
    </div>

    <div class="chat-header__right">
      <div class="chat-header__network">
        <v-select
          :model-value="activeNetwork"
          :items="networks"
          label="Network"
          item-title="name"
          item-value="id"
          variant="outlined"
          class="chat-header__network-select"
          hide-details
          :custom-styles="selectStyles"
          @update:model-value="item => setActiveNetwork(item.id)"
          return-object
          single-select
        >
          <template v-slot:selection="{ item }">
            <div class="chat-header__network-value">
              <img
                :src="item.raw.icon"
                :alt="item.raw.name"
                class="chat-header__network-icon"
              />
              <span>{{ item.raw.name }}</span>
            </div>
          </template>

          <template v-slot:item="{ item, props }">
            <v-list-item v-bind="props" class="chat-header__network-item">
              <template v-slot:prepend>
                <img
                  :src="item.raw.icon"
                  :alt="item.raw.name"
                  class="chat-header__network-icon"
                />
              </template>
            </v-list-item>
          </template>
        </v-select>
      </div>

      <button @click="logout" class="chat-header__logout">
        <v-icon icon="mdi-logout" size="20" />
        <span>Sign Out</span>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
  import { useUserContext } from '@/src/composables/useUserContext'
  import logoIcon from '@/src/assets/logo.svg'

  const { networks, activeNetwork, setActiveNetwork, logout } = useUserContext()

  const selectStyles = {
    root: {
      '--v-field-border-color': 'rgba(255, 255, 255, 0.3)',
      '--v-field-border-opacity': 1,
      '--v-field-border-width': '1px',
      '--v-field-padding-bottom': '0',
      '--v-field-padding-top': '0',
      '--v-field-input-min-height': '40px',
      '--v-field-bg': 'transparent',
      color: 'white',
    },
  }
</script>

<style lang="scss" scoped>
  .chat-header {
    height: 100px;
    background-color: #0d0b1c;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    position: sticky;
    top: 0;
    z-index: 10;

    &__left {
      display: flex;
      align-items: center;
    }

    &__logo {
      display: flex;
      align-items: center;
      gap: 8px;

      &-icon {
        width: 24px;
        height: 24px;
        flex-shrink: 0;
      }

      &-text {
        color: #e1dfec;
        font-size: 18px;
        font-weight: 400;

        &--bold {
          font-weight: 500;
        }
      }
    }

    &__right {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    &__network {
      min-width: 140px;
    }

    &__network-select {
      :deep(.v-field) {
        border-radius: 6px;
        background: rgba(255, 255, 255, 0.05) !important;
        border: 1px solid rgba(255, 255, 255, 0.2) !important;

        &:hover {
          background: rgba(255, 255, 255, 0.08) !important;
          border-color: rgba(255, 255, 255, 0.3) !important;
        }

        &.v-field--focused {
          border-color: #7b61ff !important;
          box-shadow: 0 0 0 2px rgba(123, 97, 255, 0.2);
        }

        .v-field__outline {
          display: none;
        }

        .v-field__input {
          padding: 0 12px;
          min-height: 40px;
          color: white !important;
          font-size: 14px;
        }

        .v-field__append-inner {
          padding-inline-start: 0;
          color: white !important;

          .v-icon {
            color: white !important;
            opacity: 1 !important;
          }
        }
      }

      :deep(.v-select__selection) {
        color: white !important;
      }
    }

    &__network-value {
      display: flex;
      align-items: center;
      gap: 8px;
      color: white !important;
      font-size: 14px;
    }

    &__network-icon {
      width: 20px;
      height: 20px;
    }

    &__network-item {
      font-size: 14px;
      color: white !important;
      gap: 8px;

      &:hover {
        background: rgba(255, 255, 255, 0.1) !important;
      }

      :deep(.v-list-item-title) {
        margin-left: 8px;
      }
    }

    &__logout {
      display: flex;
      align-items: center;
      gap: 8px;
      background: none;
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: rgba(255, 255, 255, 0.8);
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
        border-color: rgba(255, 255, 255, 0.3);
        color: #fff;
      }
    }
  }

  :deep(.v-overlay) {
    .v-list {
      background: #0d0b1c !important;
      color: white !important;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
    }
  }
</style>
