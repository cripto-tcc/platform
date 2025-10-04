<template>
  <div class="chat">
    <div class="chat__content">
      <div class="chat__header">
        <span class="chat__address">Chat > {{ walletAddress }}</span>
      </div>

      <div class="chat__messages" ref="messagesContainer">
        <div
          v-for="(message, index) in messages"
          :key="index"
          class="message"
          :class="message.role"
        >
          <div class="message__header">
            <img
              v-if="message.role === 'assistant'"
              :src="logoIcon"
              alt="Assistant"
              class="message__icon"
            />
            <span class="message__role"
              >{{ message.role === 'user' ? 'You' : 'Assistant' }} -
              {{ formatTime(message.timestamp) }}</span
            >
          </div>
          <div
            class="message__content"
            v-html="formatMessageContent(message.content)"
          ></div>

          <!-- Transaction confirmation buttons -->
          <div
            v-if="message.pendingTransaction"
            class="action-buttons"
            :class="{
              cancelled: message.cancelled,
              completed: message.completed,
            }"
          >
            <button
              @click="confirmTransaction(message.pendingTransaction)"
              class="confirm-btn"
              :disabled="
                isTransactionLoading || message.cancelled || message.completed
              "
            >
              {{
                isTransactionLoading
                  ? 'LOADING...'
                  : message.cancelled
                    ? 'DECLINED'
                    : message.completed
                      ? 'COMPLETED'
                      : 'CONFIRM'
              }}
            </button>
            <button
              @click="cancelTransaction(index)"
              class="cancel-btn"
              :disabled="
                isTransactionLoading || message.cancelled || message.completed
              "
            >
              {{
                message.cancelled
                  ? 'DECLINED'
                  : message.completed
                    ? 'COMPLETED'
                    : 'CANCEL'
              }}
            </button>
          </div>
        </div>

        <div v-if="isLoading && !isTyping" class="message assistant loading">
          <div class="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>

      <div class="chat__input">
        <div class="input-container">
          <input
            v-model="userInput"
            type="text"
            placeholder="Transfer funds, swap tokens, or check the latest exchange rates and fees?"
            @keyup.enter="sendMessage"
            :disabled="isLoading"
          />
          <button
            class="input-icon send"
            @click="sendMessage"
            :disabled="isLoading"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import {
    getChatCompletion,
    trackAction,
    getSuccessMessage,
    type Message,
    type TransactionData,
  } from '@/src/services/backend'
  import { useUserContext } from '@/src/composables/useUserContext'
  import { WalletService } from '@/src/services/wallet'
  import logoIcon from '@/src/assets/logo.svg'

  interface ChatMessage extends Message {
    timestamp: Date
    pendingTransaction?: TransactionData
    cancelled?: boolean
    completed?: boolean
    messageId?: number
  }

  const userInput = ref('')
  const messages = ref<ChatMessage[]>([])
  const messagesContainer = ref<HTMLElement | null>(null)
  const { walletAddress, activeNetwork } = useUserContext()
  const isLoading = ref(false)
  const isTyping = ref(false)
  const isTransactionLoading = ref(false)

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      day: 'numeric',
      month: 'short',
    }).format(date)
  }

  const scrollToBottom = () => {
    if (messagesContainer.value) {
      setTimeout(() => {
        messagesContainer.value!.scrollTop =
          messagesContainer.value!.scrollHeight
      }, 100)
    }
  }

  const formatMessageContent = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<span class="bold-text">$1</span>')
      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer" class="explorer-link">$1</a>'
      )
  }

  const sendMessage = async () => {
    if (!userInput.value.trim() || isLoading.value) return

    const userMessage: ChatMessage = {
      role: 'user' as const,
      content: userInput.value,
      timestamp: new Date(),
    }
    messages.value.push(userMessage)
    userInput.value = ''
    scrollToBottom()

    try {
      isLoading.value = true

      const assistantMessage: ChatMessage = {
        role: 'assistant' as const,
        content: '',
        timestamp: new Date(),
      }

      messages.value.push(assistantMessage)
      scrollToBottom()

      await getChatCompletion(
        {
          walletAddress: walletAddress.value || '',
          chain: activeNetwork.value.apiId.toUpperCase(),
          input: userMessage.content,
        },
        chunk => {
          assistantMessage.content += chunk
          isTyping.value = true
          isLoading.value = false
          messages.value = [...messages.value]
          scrollToBottom()
        },
        transaction => {
          assistantMessage.pendingTransaction = transaction
          messages.value = [...messages.value]
          scrollToBottom()
        },
        messageId => {
          assistantMessage.messageId = messageId
          messages.value = [...messages.value]
        }
      )
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      console.log('finally')
      isTyping.value = false
      isLoading.value = false
    }
  }

  const confirmTransaction = async (transaction: TransactionData) => {
    try {
      isTransactionLoading.value = true

      // Find the message with this transaction to get the messageId
      const messageWithTransaction = messages.value.find(
        msg => msg.pendingTransaction === transaction
      )

      // Track action clicked
      if (messageWithTransaction?.messageId) {
        try {
          await trackAction(messageWithTransaction.messageId, {
            action_clicked: true,
          })
        } catch (trackingError) {
          console.error('Error tracking confirm action:', trackingError)
        }
      }

      const txHash = await WalletService.sendTransaction(
        transaction,
        activeNetwork.value
      )

      // Track action successful
      if (messageWithTransaction?.messageId) {
        try {
          await trackAction(messageWithTransaction.messageId, {
            action_successful: true,
          })
        } catch (trackingError) {
          console.error('Error tracking success:', trackingError)
        }
      }

      // Mark transaction as completed
      if (messageWithTransaction) {
        messageWithTransaction.completed = true
        messages.value = [...messages.value]
      }

      // Gera mensagem de sucesso genérica
      const successContent = getSuccessMessage(txHash, activeNetwork.value.id)

      const successMessage: ChatMessage = {
        role: 'assistant',
        content: successContent,
        timestamp: new Date(),
      }

      messages.value.push(successMessage)
      scrollToBottom()
    } catch (error) {
      console.error('Error confirming transaction:', error)

      // Find the message with this transaction to get the messageId
      const messageWithTransaction = messages.value.find(
        msg => msg.pendingTransaction === transaction
      )

      // Track action failed
      if (messageWithTransaction?.messageId) {
        try {
          await trackAction(messageWithTransaction.messageId, {
            action_successful: false,
            error_message:
              error instanceof Error ? error.message : 'Unknown error',
          })
        } catch (trackingError) {
          console.error('Error tracking failure:', trackingError)
        }
      }

      // Gera mensagem de erro genérica
      const rawError = error instanceof Error ? error.message : 'Unknown error'
      const errorContent = `❌ Transaction failed: ${rawError}`

      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: errorContent,
        timestamp: new Date(),
      }

      messages.value.push(errorMessage)
      scrollToBottom()
    } finally {
      isTransactionLoading.value = false
    }
  }

  const cancelTransaction = async (messageIndex: number) => {
    if (messages.value[messageIndex]) {
      const message = messages.value[messageIndex]
      message.cancelled = true
      messages.value = [...messages.value]

      // Track action clicked
      if (message.messageId) {
        try {
          await trackAction(message.messageId, {
            action_clicked: true,
            error_message: 'User declined (frontend)',
          })
        } catch (trackingError) {
          console.error('Error tracking decline action:', trackingError)
        }
      }
    }
  }

  onMounted(() => {
    scrollToBottom()
  })
</script>

<style lang="scss" scoped>
  .chat {
    height: 100vh;
    background-color: #0b0919;
    color: #fff;

    &__content {
      max-width: 1024px;
      margin: 0 auto;
      padding: 2rem;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    &__header {
      padding: 0 0 12px 0;
      margin-bottom: 24px;
    }

    &__address {
      font-size: 1rem;
      color: rgba(255, 255, 255, 0.5);
      text-align: left;
    }

    &__messages {
      flex: 1;
      overflow-y: auto;
      padding-right: 16px;
      margin-bottom: 24px;
      width: 100%;

      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 3px;
      }

      &::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 3px;
      }
    }

    &__input {
      .input-container {
        display: flex;
        align-items: center;
        border: 1px solid white;
        border-radius: 8px;
        padding: 12px 16px;
        gap: 8px;

        input {
          flex: 1;
          background: transparent;
          color: #fff;
          font-size: 16px;
          outline: none;
          min-width: 0;

          &::placeholder {
            color: rgba(255, 255, 255, 0.5);
          }
        }

        .input-icon {
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.5);
          cursor: pointer;
          padding: 4px 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
          font-size: 14px;
          flex-shrink: 0;

          &:hover {
            color: rgba(255, 255, 255, 0.8);
          }

          &.send {
            color: #7b61ff;
            padding: 6px 12px;
            border-radius: 4px;

            &:hover {
              background: rgba(123, 97, 255, 0.1);
            }
          }
        }
      }
    }
  }

  .message {
    margin-bottom: 24px;
    word-wrap: break-word;
    word-break: break-word;
    overflow-wrap: break-word;

    &.user {
      margin-left: auto;

      .message__header {
        justify-content: flex-end;
      }

      .message__content {
        text-align: right;
      }
    }

    &.assistant {
      margin-right: auto;

      .message__content {
        text-align: left;
      }
    }

    &.loading {
      opacity: 0.8;
      .message__content {
        min-height: 40px;
        display: flex;
        align-items: center;
      }
    }

    &__header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      font-size: 14px;
    }

    &__role,
    &__time {
      color: rgba(255, 255, 255, 0.5);
    }

    &__content {
      border-radius: 8px;
      line-height: 1.5;
      white-space: pre-wrap;
      min-width: 0;

      :deep(.bold-text) {
        color: #8247e5;
        font-weight: 600;
      }

      :deep(.explorer-link) {
        color: #8247e5;
        text-decoration: none;
        font-weight: 500;
        border-bottom: 1px solid #8247e5;
        transition: all 0.2s ease;

        &:hover {
          color: #6b2db3;
          border-bottom-color: #6b2db3;
        }
      }
    }

    &__icon {
      width: 24px;
      height: 24px;
      flex-shrink: 0;
    }
  }

  .action-buttons {
    margin-top: 16px;
    display: flex;
    gap: 12px;

    &.cancelled {
      opacity: 0.6;

      .confirm-btn,
      .cancel-btn {
        background: rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.5);
        border: 1px solid rgba(255, 255, 255, 0.2);
        cursor: not-allowed;

        &:hover {
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.5);
        }
      }
    }

    &.completed {
      opacity: 0.8;

      .confirm-btn,
      .cancel-btn {
        background: rgba(34, 197, 94, 0.2);
        color: rgba(34, 197, 94, 0.8);
        border: 1px solid rgba(34, 197, 94, 0.3);
        cursor: not-allowed;

        &:hover {
          background: rgba(34, 197, 94, 0.2);
          color: rgba(34, 197, 94, 0.8);
        }
      }
    }

    .confirm-btn,
    .cancel-btn {
      flex: 1;
      padding: 10px 16px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    .confirm-btn {
      background: #8247e5;
      color: white;

      &:hover:not(:disabled) {
        background: #6b3a9e;
      }
    }

    .cancel-btn {
      background: transparent;
      color: rgba(255, 255, 255, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.3);

      &:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.1);
        color: white;
      }
    }
  }

  .loading-dots {
    display: flex;
    gap: 4px;
    align-items: center;
    height: 24px;
    padding: 0;

    span {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.5);
      animation: bounce 1.4s infinite ease-in-out both;

      &:nth-child(1) {
        animation-delay: -0.32s;
      }

      &:nth-child(2) {
        animation-delay: -0.16s;
      }
    }
  }

  @keyframes bounce {
    0%,
    80%,
    100% {
      transform: scale(0);
    }
    40% {
      transform: scale(1);
    }
  }

  .input-container {
    input:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .input-icon.send:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      pointer-events: none;
    }
  }
</style>
