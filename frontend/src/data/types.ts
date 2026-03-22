export type Chain = "hedera" | "ethereum" | "base" | "arbitrum";

export type NetworkId =
  | "hedera-testnet"
  | "ethereum-sepolia"
  | "base-sepolia"
  | "arbitrum-sepolia";

export interface Token {
  symbol: string;
  name: string;
  chain: Chain;
  price: number;
  iconColor: string;
}

export interface VaultStrategy {
  name: string;
  description: string;
  riskLevel: "low" | "medium" | "high";
  type: "hedera-native" | "multi-chain" | "hybrid";
}

export interface VaultFees {
  management: number;
  performance: number;
  deposit: number;
  withdrawal: number;
}

export interface VaultToken {
  token: Token;
  allocation: number;
  quantity: number;
}

export interface Vault {
  id: string;
  name: string;
  addresses: Partial<Record<NetworkId, string>>;
  tokens: VaultToken[];
  strategy: VaultStrategy;
  fees: VaultFees;
  apy: number;
  tvl: number;
  totalDepositors: number;
  sharePrice: number;
  inception: string;
}

export interface PositionHolding {
  tokenSymbol: string;
  chain: string;
  quantity: number;
  valueUsd: number;
}

export interface UserPosition {
  vaultId: string;
  depositedAmount: number;
  currentValue: number;
  pnl: number;
  pnlPercent: number;
  depositDate: string;
  holdings: PositionHolding[];
}

export interface Transaction {
  id: string;
  vaultId: string;
  type: "deposit" | "withdraw";
  amount: number;
  tokenSymbol: string;
  timestamp: string;
  status: "completed" | "pending";
}

export interface UserPortfolio {
  totalValue: number;
  totalPnl: number;
  totalPnlPercent: number;
  positions: UserPosition[];
  transactions: Transaction[];
}
