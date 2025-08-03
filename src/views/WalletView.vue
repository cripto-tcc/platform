<template>
  <div class="wallet">
    <div class="wallet-wrapper">
      <div class="wallet-header">
        <div class="wallet-address">Wallet > {{ walletAddress }}</div>
        <div class="wallet-title">Total value</div>
        <v-skeleton-loader
          class="wallet-value-loader"
          v-if="isLoadingAssets"
          type="image"
          width="10px"
          height="10px"
        ></v-skeleton-loader>
        <div v-else class="wallet-value">{{ totalValue }}</div>
      </div>

      <div class="mt-8">
        <div class="wallet-title">Assets</div>

        <template v-if="isLoadingAssets">
          <v-skeleton-loader
            class="table-loader"
            type="image"
            width="100%"
            height="200px"
          ></v-skeleton-loader>
        </template>
        <template v-else>
          <v-table class="assets-table">
            <thead>
              <tr>
                <th>Tokens</th>
                <th>Amount</th>
                <th>Total</th>
                <th>Value</th>
                <th>24hr variance</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="token in tokens" :key="token.token_address">
                <td>
                  <div class="d-flex align-center">
                    <v-avatar size="30" class="mr-2">
                      <v-img
                        :src="token.logo || ''"
                        :alt="token.symbol"
                      ></v-img>
                    </v-avatar>
                    {{ token.name }}
                  </div>
                </td>
                <td>{{ token.balance_formatted }} {{ token.symbol }}</td>
                <td class="text-grey">${{ formatNumber(token.usd_value) }}</td>
                <td class="text-grey">${{ formatNumber(token.usd_price) }}</td>
                <td
                  :class="getVarianceClass(token.usd_price_24hr_percent_change)"
                >
                  {{ formatVariance(token.usd_price_24hr_percent_change) }}%
                </td>
              </tr>
            </tbody>
          </v-table>
        </template>
      </div>

      <div class="mt-8">
        <div class="wallet-title">Activity</div>

        <template v-if="isLoadingTransactions">
          <v-skeleton-loader
            class="table-loader"
            type="image"
            width="100%"
            height="300px"
          ></v-skeleton-loader>
        </template>
        <template v-else>
          <v-table class="activity-table">
            <thead>
              <tr>
                <th>Transaction</th>
                <th>Amount</th>
                <th>Category</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="transaction in transactions" :key="transaction.hash">
                <td>
                  <div class="d-flex align-center">
                    <v-avatar
                      v-if="transaction.erc20_transfers[0]?.token_logo"
                      size="30"
                      class="mr-2"
                    >
                      <v-img
                        :src="transaction.erc20_transfers[0].token_logo"
                        :alt="transaction.erc20_transfers[0].token_symbol"
                      ></v-img>
                    </v-avatar>
                    {{ transaction.summary }}
                  </div>
                </td>
                <td>
                  {{ transaction.erc20_transfers[0]?.value_formatted || '0' }}
                </td>
                <td>{{ transaction.category }}</td>
                <td>{{ formatDate(transaction.block_timestamp) }}</td>
              </tr>
            </tbody>
          </v-table>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, watch, computed } from 'vue'
  import { useUserContext } from '@/src/composables/useUserContext'
  import { MoralisService } from '@/src/services/moralis'
  import { Token, Transaction } from '@/src/types/moralis'

  const { walletAddress, activeNetwork } = useUserContext()
  const tokens = ref<Token[]>([])
  const transactions = ref<Transaction[]>([])
  const isLoadingAssets = ref(false)
  const isLoadingTransactions = ref(false)

  const error = ref<string | null>(null)

  const formatNumber = (value: number) => {
    return value.toFixed(2)
  }

  const formatVariance = (variance: number) => {
    return variance.toFixed(2)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const totalValue = computed(() => {
    if (!tokens.value.length) return '$0.00 USD'
    const total = tokens.value.reduce(
      (sum, token) => sum + Number(token.usd_value),
      0
    )
    return `$${total.toFixed(2)} USD`
  })

  const getVarianceClass = (variance: number) => {
    return variance > 0 ? 'text-success' : 'text-error'
  }

  const fetchTokens = async () => {
    if (!walletAddress.value) return

    try {
      isLoadingAssets.value = true
      error.value = null

      const response = await MoralisService.getWalletTokens(
        walletAddress.value,
        activeNetwork.value.id
      )
      tokens.value = response.result
    } catch (err) {
      error.value = 'Failed to fetch tokens'
      console.error('Error fetching tokens:', err)
    } finally {
      isLoadingAssets.value = false
    }
  }

  const fetchTransactions = async () => {
    if (!walletAddress.value) return

    try {
      isLoadingTransactions.value = true
      error.value = null

      const response = await MoralisService.getWalletHistory(
        walletAddress.value,
        activeNetwork.value.id
      )
      transactions.value = response.result
    } catch (err) {
      error.value = 'Failed to fetch transactions'
      console.error('Error fetching transactions:', err)
    } finally {
      isLoadingTransactions.value = false
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
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap');

  .wallet {
    width: 100%;
    background-color: #0b0919;
    padding: 2rem;
    border-radius: 12px;

    .wallet-address {
      font-size: 1rem;
      color: rgba(255, 255, 255, 0.5);
      text-align: left;
    }

    .wallet-value-loader {
      width: 100px !important;
      height: 40px !important;

      :deep(.v-skeleton-loader__image) {
        width: 100px !important;
        height: 40px !important;
      }
    }

    .wallet-title {
      font-size: 1.75rem;
      color: white;
      font-weight: 700;
      text-transform: uppercase;
    }

    .wallet-value {
      font-size: 20px;
      color: white;
    }

    .table-loader {
      width: 100%;
      max-width: 1024px;
      height: 200px;
    }

    .assets-table,
    .activity-table {
      background: #110e22 !important;
      border-radius: 8px;
      overflow: hidden;
      max-width: 1024px;
      padding: 24px 48px;
      margin-top: 32px;

      :deep(td) {
        border-bottom: none !important;
        padding-top: 20px;
      }

      :deep(th) {
        color: rgba(255, 255, 255, 0.5);
        font-weight: 500;
        font-size: 0.875rem;
        font-family: 'DM Sans', sans-serif;
        padding-bottom: 16px;

        &:last-child {
          text-align: right;
        }
      }

      :deep(td) {
        color: white;
        font-family: 'DM Sans', sans-serif;

        &:last-child {
          text-align: right;
        }
      }

      :deep(tr) {
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }
    }

    .text-success {
      color: #12b76a;
    }

    .text-error {
      color: #f04438;
    }

    :deep(.v-table) {
      background: transparent;
    }
  }
</style>
