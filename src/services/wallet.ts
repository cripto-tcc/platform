import type { TransactionData } from './openai'
import type { Network } from '../types/network'
import { TransactionRequest } from '../types/transaction'
import { ethers } from 'ethers'

// ABI mínimo para tokens ERC-20
const ERC20_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
]

export class WalletService {
  /**
   * Gets the current gas price from the network
   * @param provider The Phantom provider
   * @returns Promise<string> The gas price in hex format
   */

  /**
   * Sends a native token transaction (ETH, MATIC, etc.)
   * @param transactionData The transaction data
   * @param provider The wallet provider
   * @returns Promise<string> Transaction hash
   */
  private static async sendNativeTokenTransaction(
    transactionData: TransactionData,
    provider: any
  ): Promise<string> {
    const transaction: TransactionRequest = {
      gasLimit: transactionData.transactionRequest.gasLimit,
      gasPrice: transactionData.transactionRequest.gasPrice,
      to: transactionData.transactionRequest.to,
      from: transactionData.transactionRequest.from,
      value: transactionData.transactionRequest.value,
    }

    console.log('Native token transaction:', transaction)

    // Add data if it exists
    if (transactionData.transactionRequest.data) {
      transaction.data = transactionData.transactionRequest.data
    }

    console.log('Native token transaction:', transaction)

    const txHash = await provider.request({
      method: 'eth_sendTransaction',
      params: [transaction],
    })

    return txHash
  }

  /**
   * Sends an ERC-20 token transaction
   * @param transactionData The transaction data
   * @param provider The wallet provider
   * @returns Promise<string> Transaction hash
   */
  private static async sendERC20TokenTransaction(
    transactionData: TransactionData,
    provider: any
  ): Promise<string> {
    const ethersProvider = new ethers.BrowserProvider(provider)
    const signer = await ethersProvider.getSigner()

    // Use the token contract address from fromTokenInfo
    const tokenContractAddress =
      transactionData.transactionRequest.fromTokenInfo?.contract

    if (!tokenContractAddress) {
      throw new Error('Token contract address not found in fromTokenInfo')
    }

    if (transactionData.transactionRequest.data) {
      const transaction = {
        gasLimit: transactionData.transactionRequest.gasLimit,
        gasPrice: transactionData.transactionRequest.gasPrice,
        to: transactionData.transactionRequest.to,
        from: transactionData.transactionRequest.from,
        value: transactionData.transactionRequest.value,
        data: transactionData.transactionRequest.data, // Use the data from LIFI
      }

      console.log('ERC20 token transaction:', transaction)

      if (transactionData.estimate.approvalAddress) {
        const tokenContract = new ethers.Contract(
          transactionData.transactionRequest.fromTokenInfo?.contract as string,
          ERC20_ABI,
          signer
        )

        await tokenContract.approve(
          transactionData.estimate.approvalAddress,
          BigInt(transactionData.estimate.fromAmount),
          {
            gasLimit: transactionData.transactionRequest.gasLimit,
            gasPrice: transactionData.transactionRequest.gasPrice,
          }
        )
      }

      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [transaction],
      })

      return txHash
    } else {
      // This is a normal ERC20 transfer - use ethers contract
      console.log('Processing normal ERC20 transfer')

      const recipient = transactionData.transactionRequest.to
      const amountHex = transactionData.transactionRequest.value // Amount in hex format

      if (!recipient || !amountHex) {
        throw new Error('Recipient or amount not provided for ERC20 transfer')
      }

      // Convert hex amount to BigInt for ethers
      const amount = ethers.getBigInt(amountHex)

      console.log(`Sending ${amount} tokens to ${recipient}`)
      console.log(`Amount hex: ${amountHex}, Amount BigInt: ${amount}`)

      // Create contract instance
      const tokenContract = new ethers.Contract(
        tokenContractAddress,
        ERC20_ABI,
        signer
      )

      // Execute the transfer using ethers contract
      const tx = await tokenContract.transfer(recipient, amount, {
        gasLimit: ethers.getBigInt(transactionData.transactionRequest.gasLimit),
        gasPrice: ethers.getBigInt(transactionData.transactionRequest.gasPrice), // Convert hex gasPrice to BigInt
      })

      return tx.hash
    }
  }

  static async sendTransaction(
    transactionData: TransactionData,
    activeNetwork?: Network
  ): Promise<string> {
    const provider = window.phantom?.ethereum

    if (!provider) {
      throw new Error('Phantom wallet is not installed!')
    }

    try {
      // Check if we need to switch networks
      if (activeNetwork) {
        try {
          await provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: activeNetwork.chainId }],
          })
        } catch (switchError: any) {
          // If the network is not added, add it
          if (switchError.code === 4902 && activeNetwork.chainConfig) {
            await provider.request({
              method: 'wallet_addEthereumChain',
              params: [activeNetwork.chainConfig],
            })
          } else {
            throw switchError
          }
        }
      }

      // Use the isNativeToken flag from the backend
      const isNative = transactionData.transactionRequest.isNativeToken

      console.log(
        'Transaction type:',
        isNative ? 'Native Token' : 'ERC-20 Token'
      )
      console.log(
        'Token info:',
        transactionData.transactionRequest.fromTokenInfo
      )

      if (isNative) {
        // Send native token transaction (ETH, MATIC, etc.)
        return await this.sendNativeTokenTransaction(transactionData, provider)
      } else {
        // Send ERC-20 token transaction (USDC, USDT, etc.)
        return await this.sendERC20TokenTransaction(transactionData, provider)
      }
    } catch (error) {
      console.error('Error sending transaction:', error)
      throw error
    }
  }
}
