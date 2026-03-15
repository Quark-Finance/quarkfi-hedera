import type { Vault } from "./types";
import { TOKENS } from "./tokens";

export const VAULTS: Vault[] = [
  {
    id: "hedera-stable",
    name: "Hedera Stable Yield",
    tokens: [
      { token: TOKENS.HBAR, allocation: 40, quantity: 6_000_000 },
      { token: TOKENS.USDC_HEDERA, allocation: 35, quantity: 1_470_000 },
      { token: TOKENS.HBARX, allocation: 15, quantity: 2_032_258 },
      { token: TOKENS.SAUCE, allocation: 10, quantity: 10_000_000 },
    ],
    strategy: {
      name: "Hedera Native Yield",
      description:
        "Generates stable yield through Hedera-native DeFi protocols including HBAR staking, liquidity provisioning on SaucerSwap, and USDC lending on Hedera-based money markets. Designed for institutional investors seeking predictable returns with minimal cross-chain risk.",
      riskLevel: "low",
      type: "hedera-native",
    },
    fees: {
      management: 0.5,
      performance: 10,
      deposit: 0,
      withdrawal: 0.1,
    },
    apy: 8.2,
    tvl: 4_200_000,
    totalDepositors: 47,
    inception: "2025-09-15",
  },
  {
    id: "multi-chain-growth",
    name: "Multi-Chain Growth",
    tokens: [
      { token: TOKENS.ETH, allocation: 35, quantity: 1_310 },
      { token: TOKENS.WBTC, allocation: 30, quantity: 39.4 },
      { token: TOKENS.USDC_ETH, allocation: 25, quantity: 3_200_000 },
      { token: TOKENS.ARB, allocation: 10, quantity: 1_142_857 },
    ],
    strategy: {
      name: "Cross-Chain Alpha",
      description:
        "Pursues higher returns across Ethereum and L2 ecosystems through yield farming, concentrated liquidity positions, and delta-neutral strategies. Actively managed by quantitative models with automated rebalancing across multiple chains.",
      riskLevel: "high",
      type: "multi-chain",
    },
    fees: {
      management: 1.0,
      performance: 15,
      deposit: 0,
      withdrawal: 0.15,
    },
    apy: 15.7,
    tvl: 12_800_000,
    totalDepositors: 124,
    inception: "2025-06-01",
  },
  {
    id: "hybrid-balanced",
    name: "Hybrid Balanced",
    tokens: [
      { token: TOKENS.HBAR, allocation: 25, quantity: 6_696_429 },
      { token: TOKENS.ETH, allocation: 25, quantity: 548 },
      { token: TOKENS.USDC_HEDERA, allocation: 20, quantity: 1_500_000 },
      { token: TOKENS.USDC_ETH, allocation: 20, quantity: 1_500_000 },
      { token: TOKENS.HBARX, allocation: 10, quantity: 2_419_355 },
    ],
    strategy: {
      name: "Balanced Yield",
      description:
        "Combines Hedera-native yield strategies with select multi-chain opportunities for diversified, risk-adjusted returns. Maintains a core allocation in Hedera assets while capturing additional yield from Ethereum DeFi, targeting institutional-grade risk management.",
      riskLevel: "medium",
      type: "hybrid",
    },
    fees: {
      management: 0.75,
      performance: 12,
      deposit: 0,
      withdrawal: 0.1,
    },
    apy: 11.3,
    tvl: 7_500_000,
    totalDepositors: 83,
    inception: "2025-08-01",
  },
];
