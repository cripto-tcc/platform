import type { TransactionData } from './backend'
import type { Network } from '../types/network'
import { TransactionRequest } from '../types/transaction'
import { getPhantomProvider } from '../helpers/getProvider'
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
  static async sendTransaction(
    transactionData: TransactionData,
    activeNetwork: Network
  ): Promise<string> {
    const provider = await getPhantomProvider()

    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: activeNetwork.chainId }],
      })

      const isNative = transactionData.transactionRequest.isNativeToken

      console.log(
        'Transaction type:',
        isNative ? 'Native Token' : 'ERC-20 Token'
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

  private static async sendERC20TokenTransaction(
    transactionData: TransactionData,
    provider: any
  ): Promise<string> {
    const ethersProvider = new ethers.BrowserProvider(provider)
    const signer = await ethersProvider.getSigner()

    const tokenContractAddress = this.getTokenContractAddress(transactionData)
    const isSwap = this.isSwapTransaction(transactionData)

    if (isSwap) {
      return await this.executeERC20SwapTransaction(
        transactionData,
        provider,
        signer
      )
    } else {
      return await this.executeERC20TransferTransaction(
        transactionData,
        signer,
        tokenContractAddress
      )
    }
  }

  private static getTokenContractAddress(
    transactionData: TransactionData
  ): string {
    const tokenContractAddress =
      transactionData.transactionRequest.fromTokenInfo?.contract
    if (!tokenContractAddress) {
      throw new Error('Token contract address not found in fromTokenInfo')
    }
    return tokenContractAddress
  }

  private static isSwapTransaction(transactionData: TransactionData): boolean {
    return !!transactionData.transactionRequest.data
  }

  private static async executeERC20SwapTransaction(
    transactionData: TransactionData,
    provider: any,
    signer: ethers.Signer
  ): Promise<string> {
    const transaction = this.buildSwapTransaction(transactionData)
    console.log('ERC20 token transaction:', transaction)

    if (transactionData.estimate.approvalAddress) {
      await this.approveTokenForSwap(transactionData, signer)
    }

    return await this.sendRawTransaction(provider, transaction)
  }

  private static buildSwapTransaction(transactionData: TransactionData) {
    return {
      gasLimit: transactionData.transactionRequest.gasLimit,
      gasPrice: transactionData.transactionRequest.gasPrice,
      to: transactionData.transactionRequest.to,
      from: transactionData.transactionRequest.from,
      value: transactionData.transactionRequest.value,
      data: transactionData.transactionRequest.data,
    }
  }

  private static async approveTokenForSwap(
    transactionData: TransactionData,
    signer: ethers.Signer
  ): Promise<void> {
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

  private static async executeERC20TransferTransaction(
    transactionData: TransactionData,
    signer: ethers.Signer,
    tokenContractAddress: string
  ): Promise<string> {
    const { recipient, amount } = this.validateTransferData(transactionData)
    const tokenContract = this.createTokenContract(tokenContractAddress, signer)

    const tx = await tokenContract.transfer(recipient, amount, {
      gasLimit: ethers.getBigInt(transactionData.transactionRequest.gasLimit),
      gasPrice: ethers.getBigInt(transactionData.transactionRequest.gasPrice),
    })

    return tx.hash
  }

  private static validateTransferData(transactionData: TransactionData) {
    const recipient = transactionData.transactionRequest.to
    const amountHex = transactionData.transactionRequest.value

    if (!recipient || !amountHex) {
      throw new Error('Recipient or amount not provided for ERC20 transfer')
    }

    return {
      recipient,
      amount: ethers.getBigInt(amountHex),
    }
  }

  private static createTokenContract(
    tokenContractAddress: string,
    signer: ethers.Signer
  ) {
    return new ethers.Contract(tokenContractAddress, ERC20_ABI, signer)
  }

  private static async sendRawTransaction(
    provider: any,
    transaction: any
  ): Promise<string> {
    const txHash = await provider.request({
      method: 'eth_sendTransaction',
      params: [transaction],
    })
    return txHash
  }
}
