<template>
  <div class="wallet">
    <div class="wallet-header">
      <div class="wallet-address">Wallet > {{ walletAddress }}</div>
      <div class="wallet-title">Total value</div>
      <div class="wallet-value">{{ totalValue }}</div>
    </div>

    <div class="mt-8">
      <div class="wallet-title">Assets</div>

      <template v-if="isLoading">
        <v-skeleton-loader class="table-loader" type="image" width="100%" height="200px"></v-skeleton-loader>
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
                    <v-img :src="token.logo || ''" :alt="token.symbol"></v-img>
                  </v-avatar>
                  {{ token.name }}
                </div>
              </td>
              <td>{{ formatBalance(token.balance_formatted) }} {{ token.symbol }}</td>
              <td class="text-grey">${{ formatNumber(token.usd_value) }}</td>
              <td class="text-grey">${{ formatNumber(token.usd_price) }}</td>
              <td :class="getVarianceClass(token.usd_price_24hr_percent_change)">{{ formatVariance(token.usd_price_24hr_percent_change) }}%</td>
            </tr>
          </tbody>
        </v-table>
      </template>
    </div>

    <div class="mt-8">
      <div class="wallet-title">Activity</div>

      <template v-if="isLoading">
        <v-skeleton-loader type="text" width="100%" height="200px"></v-skeleton-loader>
      </template>
      <template v-else>
        <v-table class="activity-table">
          <thead>
            <tr>
              <th>Transactions</th>
              <th>Amount</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(activity, index) in activities" :key="index">
              <td>
                <div class="d-flex align-center">
                  <v-avatar size="30" class="mr-2">
                    <v-img :src="activity.icon" :alt="activity.name"></v-img>
                  </v-avatar>
                  {{ activity.name }}
                </div>
              </td>
              <td>{{ activity.amount }}</td>
              <td>${{ activity.total }}</td>
              <td :class="activity.status === 'Done' ? 'text-success' : 'text-grey'">
                {{ activity.status }}
              </td>
              <td class="text-grey">{{ activity.date }}</td>
            </tr>
          </tbody>
        </v-table>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import { useUserContext } from "../composables/useUserContext";
import { MoralisService } from "../services/moralis";
import { Token } from "../types/moralis";

const { walletAddress, activeNetwork } = useUserContext();
const tokens = ref<Token[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);

const activities = ref([
  {
    name: "Ethereum Purchased",
    icon: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
    amount: "0.0154 ETH",
    total: "10.00",
    status: "Pending",
    date: "February 21, 2021",
  },
  {
    name: "Wrapped Bitcoin Purchased",
    icon: "https://cryptologos.cc/logos/bitcoin-btc-logo.png",
    amount: "0.3 BTC",
    total: "10.00",
    status: "Done",
    date: "February 14, 2021",
  },
  {
    name: "Wrapped Bitcoin Purchased",
    icon: "https://cryptologos.cc/logos/bitcoin-btc-logo.png",
    amount: "0.025 BTC",
    total: "10.00",
    status: "Done",
    date: "January 14, 2021",
  },
]);

const formatBalance = (balance: string) => {
  const number = parseFloat(balance);
  if (isNaN(number)) return balance;

  const str = number.toString();
  const firstNonZero = str.search(/[1-9]/);

  if (firstNonZero === -1) return "0.00";

  const decimalPlaces = Math.max(0, 2 - (str.indexOf(".") - firstNonZero));
  return number.toFixed(decimalPlaces);
};

const formatNumber = (value: number) => {
  return value.toFixed(2);
};

const formatVariance = (variance: number) => {
  return variance.toFixed(2);
};

const totalValue = computed(() => {
  if (!tokens.value.length) return "$0.00 USD";
  const total = tokens.value.reduce((sum, token) => sum + Number(token.usd_value), 0);
  return `$${total.toFixed(2)} USD`;
});

const getVarianceClass = (variance: number) => {
  return variance > 0 ? "text-success" : "text-error";
};

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
@import url("https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap");

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

    :deep(td) {
      border-bottom: none !important;
      padding-top: 20px;
    }

    :deep(th) {
      color: rgba(255, 255, 255, 0.5);
      font-weight: 500;
      font-size: 0.875rem;
      font-family: "DM Sans", sans-serif;
      padding-bottom: 16px;

      &:last-child {
        text-align: right;
      }
    }

    :deep(td) {
      color: white;
      font-family: "DM Sans", sans-serif;

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
