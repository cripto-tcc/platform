const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

export interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface ChatRequest {
  walletAddress: string
  chain: string
  input: string
}

export interface TransactionData {
  transactionRequest: {
    value: string
    to: string
    data: string
    chainId: number
    gasPrice: string
    gasLimit: string
    from: string
    isNativeToken: boolean
    fromTokenInfo?: {
      contract: string
      decimals: number
      name: string
    }
  }
  fromToken: string
  toToken: string
  tool: string
  estimate: {
    tool: string
    approvalAddress: string
    toAmountMin: string
    toAmount: number
    fromAmount: number
    feeCosts: any[]
    gasCosts: any[]
    executionDuration: number
    fromAmountUSD: number
    toAmountUSD: number
  }
  action: {
    fromAmount: string
  }
}

export interface TransactionMessage {
  type: 'transaction'
  data: TransactionData
}

export interface TrackingMessage {
  type: 'tracking'
  message_id: number
}

export interface TrackingData {
  action_clicked?: boolean
  action_successful?: boolean
  error_message?: string
}

export async function trackAction(messageId: number, data: TrackingData) {
  try {
    const response = await fetch(`${API_URL}/track/${messageId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Tracking failed: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error tracking action:', error)
    throw error
  }
}

export async function getChatCompletion(
  request: ChatRequest,
  onChunk: (chunk: string) => void,
  onTransaction?: (transaction: TransactionData) => void,
  onMessageId?: (messageId: number) => void
) {
  try {
    const response = await fetch(`${API_URL}/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    if (!reader) throw new Error('No reader available')

    while (true) {
      const { value, done } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value)
      const lines = chunk.split('\n')

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') {
            break
          }

          try {
            const parsed = JSON.parse(data)

            // Check if it's a tracking message with message_id
            if (
              parsed.type === 'tracking' &&
              parsed.message_id &&
              onMessageId
            ) {
              onMessageId(parsed.message_id)
            }
            // Check if it's a transaction message
            else if (parsed.type === 'transaction' && onTransaction) {
              onTransaction(parsed.data)
            } else if (parsed.content) {
              onChunk(parsed.content)
            }
          } catch (e) {
            console.error('Error parsing chunk:', e)
          }
        }
      }
    }
  } catch (error) {
    console.error('Error getting chat completion:', error)
    throw error
  }
}
