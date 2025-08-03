export interface Token {
  token_address: string
  symbol: string
  name: string
  logo: string
  thumbnail: string
  decimals: number
  balance: string
  possible_spam: boolean
  verified_contract: boolean
  total_supply: string | null
  total_supply_formatted: string | null
  percentage_relative_to_total_supply: number | null
  security_score: number | null
  balance_formatted: string
  usd_price: number
  usd_price_24hr_percent_change: number
  usd_price_24hr_usd_change: number
  usd_value: number
  usd_value_24hr_usd_change: number | null
  native_token: boolean
  portfolio_percentage: number
  variance?: string
}

export interface TokenResponse {
  cursor: string | null
  page: number
  page_size: number
  block_number: number
  result: Token[]
}

export interface ERC20Transfer {
  token_name: string
  token_symbol: string
  token_logo: string | null
  token_decimals: string
  from_address: string
  to_address: string
  address: string
  value: string
  value_formatted: string
  possible_spam: boolean
  verified_contract: boolean
  direction: string
}

export interface Transaction {
  hash: string
  from_address: string
  to_address: string
  value: string
  block_timestamp: string
  method_label: string | null
  erc20_transfers: ERC20Transfer[]
  native_transfers: any[]
  summary: string
  category: string
}

export interface TransactionResponse {
  cursor: string | null
  page_size: number
  limit: string
  result: Transaction[]
  page: number
}
