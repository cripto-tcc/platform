<template>
  <aside class="wallet-sidebar">
    <div class="wallet-sidebar__header">
      <div class="wallet-sidebar__title-section">
        <h3 class="wallet-sidebar__title">Wallet</h3>
        <div class="wallet-sidebar__balance">
          <div v-if="isLoadingAssets" class="skeleton-line small"></div>
          <div v-else class="wallet-sidebar__balance-value">
            ${{ formatNumber(totalValue) }}
          </div>
        </div>
      </div>
      <button
        @click="refreshWallet"
        class="wallet-sidebar__refresh"
        :disabled="isRefreshing"
      >
        <v-icon
          :icon="isRefreshing ? 'mdi-loading' : 'mdi-refresh'"
          size="20"
          :class="{ rotating: isRefreshing }"
        />
      </button>
    </div>

    <div class="wallet-sidebar__content">
      <!-- Tokens Section -->
      <div class="wallet-sidebar__section">
        <h4 class="wallet-sidebar__section-title">Tokens</h4>
        <div class="tokens-list">
          <div v-if="isLoadingAssets" class="loading-skeleton">
            <div v-for="i in 3" :key="i" class="skeleton-item">
              <div class="skeleton-avatar"></div>
              <div class="skeleton-text">
                <div class="skeleton-line"></div>
                <div class="skeleton-line short"></div>
              </div>
            </div>
          </div>
          <div v-else-if="processedTokens.length === 0" class="empty-state">
            <p>No tokens found</p>
          </div>
          <div class="tokens-list__items" v-else>
            <div
              v-for="token in processedTokens"
              :key="token.symbol"
              class="token-item"
            >
              <div class="token-item__info">
                <img
                  :src="token.icon"
                  :alt="token.symbol"
                  class="token-item__icon"
                />
                <div class="token-item__details">
                  <span class="token-item__symbol">{{ token.symbol }}</span>
                  <span class="token-item__name">{{ token.name }}</span>
                </div>
              </div>
              <div class="token-item__balance">
                <span class="token-item__amount">{{ token.balance }}</span>
                <span class="token-item__value">${{ token.value }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Activity Section -->
      <div class="wallet-sidebar__section">
        <h4 class="wallet-sidebar__section-title">Recent Activity</h4>
        <div class="activity-list">
          <div v-if="isLoadingTransactions" class="loading-skeleton">
            <div v-for="i in 3" :key="i" class="skeleton-item">
              <div class="skeleton-avatar small"></div>
              <div class="skeleton-text">
                <div class="skeleton-line"></div>
                <div class="skeleton-line short"></div>
              </div>
            </div>
          </div>
          <div v-else-if="processedActivity.length === 0" class="empty-state">
            <p>No recent activity</p>
          </div>
          <div v-else>
            <div
              v-for="activity in processedActivity"
              :key="activity.id"
              class="activity-item"
            >
              <div class="activity-item__icon">
                <v-icon
                  :icon="activity.icon"
                  size="16"
                  :color="activity.type === 'send' ? '#ff6b6b' : '#51cf66'"
                />
              </div>
              <div class="activity-item__details">
                <span class="activity-item__type">{{ activity.type }}</span>
                <span class="activity-item__amount"
                  >{{ activity.amount }} {{ activity.token }}</span
                >
                <span class="activity-item__time">{{ activity.time }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue'
  import { useUserContext } from '@/src/composables/useUserContext'
  import { getWalletTokens, getWalletHistory } from '@/src/services/backend'
  import { Token, Transaction } from '@/src/types/moralis'

  const { walletAddress, activeNetwork } = useUserContext()

  const isRefreshing = ref(false)
  const tokens = ref<Token[]>([])
  const transactions = ref<Transaction[]>([])
  const isLoadingAssets = ref(false)
  const isLoadingTransactions = ref(false)

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const formatTokenBalance = (balanceString: string) => {
    const balance = parseFloat(balanceString)

    // Se o valor é muito pequeno (menos que 0.01), mostra mais casas decimais
    if (balance > 0 && balance < 0.01) {
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 4,
        maximumFractionDigits: 6,
      }).format(balance)
    }

    // Para valores normais, usa 2 casas decimais
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(balance)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    )

    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return '1d ago'
    return `${Math.floor(diffInHours / 24)}d ago`
  }

  const getTransactionIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'send':
      case 'outgoing':
        return 'mdi-arrow-up'
      case 'receive':
      case 'incoming':
        return 'mdi-arrow-down'
      default:
        return 'mdi-swap-horizontal'
    }
  }

  const getTransactionType = (category: string) => {
    switch (category.toLowerCase()) {
      case 'send':
      case 'outgoing':
        return 'send'
      case 'receive':
      case 'incoming':
        return 'receive'
      default:
        return 'swap'
    }
  }

  const processedTokens = computed(() => {
    return tokens.value.map(token => ({
      symbol: token.symbol,
      name: token.name,
      balance: formatTokenBalance(token.balance_formatted),
      value: formatNumber(token.usd_value),
      icon: token.logo || '/src/assets/ethereum.svg',
    }))
  })

  const processedActivity = computed(() => {
    return transactions.value.slice(0, 5).map((transaction, index) => ({
      id: index + 1,
      type: getTransactionType(transaction.category),
      amount: transaction.erc20_transfers[0]?.value_formatted || '0',
      token: transaction.erc20_transfers[0]?.token_symbol || 'ETH',
      time: formatDate(transaction.block_timestamp),
      icon: getTransactionIcon(transaction.category),
    }))
  })

  const totalValue = computed(() => {
    if (!tokens.value.length) return 0
    return tokens.value.reduce((sum, token) => sum + Number(token.usd_value), 0)
  })

  const fetchTokens = async () => {
    if (!walletAddress.value) return

    try {
      isLoadingAssets.value = true
      const response = await getWalletTokens(
        walletAddress.value,
        activeNetwork.value.id
      )
      tokens.value = response.result
    } catch (err) {
      console.error('Error fetching tokens:', err)
    } finally {
      isLoadingAssets.value = false
    }
  }

  const fetchTransactions = async () => {
    if (!walletAddress.value) return

    try {
      isLoadingTransactions.value = true
      const response = await getWalletHistory(
        walletAddress.value,
        activeNetwork.value.id
      )
      transactions.value = response.result
    } catch (err) {
      console.error('Error fetching transactions:', err)
    } finally {
      isLoadingTransactions.value = false
    }
  }

  const refreshWallet = async () => {
    isRefreshing.value = true
    try {
      await Promise.all([fetchTokens(), fetchTransactions()])
    } finally {
      isRefreshing.value = false
    }
  }

  onMounted(() => {
    if (walletAddress.value) {
      fetchTokens()
      fetchTransactions()
    }
  })

  watch([walletAddress, activeNetwork], () => {
    if (walletAddress.value) {
      fetchTokens()
      fetchTransactions()
    }
  })
</script>

<style lang="scss" scoped>
  .wallet-sidebar {
    width: 280px;
    height: 100vh;
    background-color: #0d0b1c;
    border-right: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    position: fixed;
    left: 0;
    top: 0;
    z-index: 5;

    &__header {
      height: 100px;
      padding: 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
    }

    &__title-section {
      flex: 1;
    }

    &__title {
      color: #fff;
      font-size: 18px;
      font-weight: 600;
      margin: 0 0 8px 0;
    }

    &__balance {
      margin-top: 4px;
    }

    &__balance-value {
      color: rgba(255, 255, 255, 0.8);
      font-size: 14px;
      font-weight: 500;
    }

    &__refresh {
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.6);
      cursor: pointer;
      padding: 8px;
      border-radius: 4px;
      transition: all 0.2s ease;

      &:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    &__content {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
    }

    &__section {
      margin-bottom: 32px;

      &:last-child {
        margin-bottom: 0;
      }
    }

    &__section-title {
      color: rgba(255, 255, 255, 0.8);
      font-size: 14px;
      font-weight: 600;
      margin: 0 0 16px 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  }

  .tokens-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .tokens-list__items {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    transition: background 0.2s ease;
    border-radius: 8px;

    &:hover {
      background: rgba(255, 255, 255, 0.08);
    }
  }

  .token-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
    background: rgba(255, 255, 255, 0.05);
    transition: background 0.2s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.08);
    }

    &__info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    &__icon {
      width: 32px;
      height: 32px;
      border-radius: 50%;
    }

    &__details {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    &__symbol {
      color: #fff;
      font-size: 14px;
      font-weight: 600;
    }

    &__name {
      color: rgba(255, 255, 255, 0.6);
      font-size: 12px;
    }

    &__balance {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 2px;
    }

    &__amount {
      color: #fff;
      font-size: 14px;
      font-weight: 600;
    }

    &__value {
      color: rgba(255, 255, 255, 0.6);
      font-size: 12px;
    }
  }

  .activity-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .activity-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px;
    border-radius: 6px;
    transition: background 0.2s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.05);
    }

    &__icon {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
    }

    &__details {
      display: flex;
      flex-direction: column;
      gap: 2px;
      flex: 1;
    }

    &__type {
      color: #fff;
      font-size: 12px;
      font-weight: 600;
      text-transform: capitalize;
    }

    &__amount {
      color: rgba(255, 255, 255, 0.8);
      font-size: 12px;
    }

    &__time {
      color: rgba(255, 255, 255, 0.5);
      font-size: 11px;
    }
  }

  .rotating {
    animation: rotate 1s linear infinite;
  }

  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  /* Scrollbar styling */
  .wallet-sidebar::-webkit-scrollbar {
    width: 4px;
  }

  .wallet-sidebar::-webkit-scrollbar-track {
    background: transparent;
  }

  .wallet-sidebar::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
  }

  .wallet-sidebar::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  .loading-skeleton {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .skeleton-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
  }

  .skeleton-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.1) 25%,
      rgba(255, 255, 255, 0.2) 50%,
      rgba(255, 255, 255, 0.1) 75%
    );
    background-size: 200% 100%;
    animation: loading 1.5s infinite;

    &.small {
      width: 24px;
      height: 24px;
    }
  }

  .skeleton-text {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
  }

  .skeleton-line {
    height: 12px;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.1) 25%,
      rgba(255, 255, 255, 0.2) 50%,
      rgba(255, 255, 255, 0.1) 75%
    );
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
    border-radius: 4px;

    &.short {
      width: 60%;
    }

    &.small {
      height: 8px;
      width: 80px;
    }
  }

  .empty-state {
    text-align: center;
    padding: 20px;
    color: rgba(255, 255, 255, 0.5);
    font-size: 14px;
  }

  @keyframes loading {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
</style>
